from django.utils import timezone
from django.db.models import Max
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Experiment, ExperimentRun, Notebook, NotebookCell
from .permissions import IsAdminOrReadOnly, IsOwnerOrAdminReadOnly
from .runner import run_experiment
from .local_sqlite import append_log, read_logs
from .notebook_kernel import kernel_run, kernel_install, kernel_status


class ExperimentViewSet(viewsets.ModelViewSet):
    serializer_class = None  # set in get_serializer_class
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Experiment.objects.all()
        exp_type = self.request.query_params.get('experiment_type')
        if exp_type:
            qs = qs.filter(experiment_type=exp_type)
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        from .serializers import ExperimentSerializer

        return ExperimentSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def run(self, request, pk=None):
        experiment = self.get_object()
        params = request.data.get('params')
        if params is None:
            params = request.data

        run_obj = ExperimentRun.objects.create(
            experiment=experiment,
            user=request.user,
            status=ExperimentRun.Status.RUNNING,
            params=params or {},
            started_at=timezone.now(),
        )

        local_db_path = ''
        try:
            local_db_path = str(append_log(
                user_id=request.user.id,
                run_id=run_obj.id,
                level='INFO',
                message='Run started',
                extra={'experiment': experiment.slug, 'experiment_type': experiment.experiment_type},
            ))

            output, metrics, duration_ms = run_experiment(experiment.experiment_type, run_obj.params)

            append_log(
                user_id=request.user.id,
                run_id=run_obj.id,
                level='INFO',
                message='Run finished',
                extra={'duration_ms': duration_ms},
            )

            run_obj.status = ExperimentRun.Status.SUCCEEDED
            run_obj.output = output
            run_obj.metrics = metrics
            run_obj.duration_ms = duration_ms
            run_obj.local_sqlite_path = local_db_path
            run_obj.finished_at = timezone.now()
            run_obj.save(update_fields=[
                'status',
                'output',
                'metrics',
                'duration_ms',
                'local_sqlite_path',
                'finished_at',
            ])
        except Exception as exc:
            append_log(
                user_id=request.user.id,
                run_id=run_obj.id,
                level='ERROR',
                message='Run failed',
                extra={'error': str(exc)},
            )
            run_obj.status = ExperimentRun.Status.FAILED
            run_obj.error_text = str(exc)
            run_obj.local_sqlite_path = local_db_path
            run_obj.finished_at = timezone.now()
            run_obj.save(update_fields=['status', 'error_text', 'local_sqlite_path', 'finished_at'])
            return Response({'detail': 'Experiment failed', 'error': str(exc), 'run_id': run_obj.id}, status=400)

        from .serializers import ExperimentRunSerializer

        return Response(ExperimentRunSerializer(run_obj).data, status=status.HTTP_201_CREATED)


class ExperimentRunViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = None  # set in get_serializer_class
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminReadOnly]

    def get_queryset(self):
        qs = ExperimentRun.objects.select_related('experiment', 'user')

        exp_type = self.request.query_params.get('experiment_type')
        if exp_type:
            qs = qs.filter(experiment__experiment_type=exp_type)

        if self.request.user and self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        from .serializers import ExperimentRunSerializer

        return ExperimentRunSerializer

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        run_obj = self.get_object()
        if not run_obj.user_id:
            return Response([], status=200)

        limit = int(request.query_params.get('limit', 200))
        records = read_logs(user_id=run_obj.user_id, run_id=run_obj.id, limit=limit)
        return Response(
            [
                {
                    'run_id': r.run_id,
                    'level': r.level,
                    'message': r.message,
                    'extra': r.extra,
                }
                for r in records
            ],
            status=200,
        )


class NotebookViewSet(viewsets.ModelViewSet):
    serializer_class = None
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notebook.objects.all()
        if self.request.user and self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        from .serializers import NotebookSerializer

        return NotebookSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotebookCellViewSet(viewsets.ModelViewSet):
    serializer_class = None
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = NotebookCell.objects.select_related('notebook', 'notebook__user')
        notebook_id = self.request.query_params.get('notebook')
        if notebook_id:
            qs = qs.filter(notebook_id=notebook_id)

        if self.request.user and self.request.user.is_staff:
            return qs
        return qs.filter(notebook__user=self.request.user)

    def get_serializer_class(self):
        from .serializers import NotebookCellSerializer

        return NotebookCellSerializer

    def perform_create(self, serializer):
        notebook = serializer.validated_data.get('notebook')
        if not (self.request.user.is_staff or notebook.user_id == self.request.user.id):
            raise permissions.PermissionDenied('Not allowed.')

        # If position isn't provided, append to end.
        if 'position' not in serializer.validated_data:
            max_pos = NotebookCell.objects.filter(notebook=notebook).aggregate(Max('position')).get('position__max')
            serializer.save(position=(max_pos + 1) if max_pos is not None else 0)
            return

        serializer.save()

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        cell = self.get_object()
        code = request.data.get('code')
        if code is None:
            code = cell.code

        try:
            result = kernel_run(code)
        except Exception as exc:
            return Response({'detail': 'Kernel run failed', 'error': str(exc)}, status=502)

        cell.last_stdout = result.get('stdout', '') or ''
        cell.last_stderr = result.get('stderr', '') or ''
        cell.last_exit_code = result.get('exit_code')
        cell.last_duration_ms = result.get('duration_ms')
        cell.last_executed_at = timezone.now()
        cell.save(update_fields=[
            'last_stdout',
            'last_stderr',
            'last_exit_code',
            'last_duration_ms',
            'last_executed_at',
            'updated_at',
        ])

        from .serializers import NotebookCellSerializer

        return Response(NotebookCellSerializer(cell).data, status=200)


class NotebookKernelViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def status(self, request):
        try:
            return Response(kernel_status(), status=200)
        except Exception as exc:
            return Response({'status': 'error', 'error': str(exc)}, status=502)

    @action(detail=False, methods=['post'])
    def install(self, request):
        package = (request.data.get('package') or '').strip()
        if not package:
            return Response({'detail': 'package is required'}, status=400)

        try:
            return Response(kernel_install(package), status=200)
        except Exception as exc:
            return Response({'detail': 'Kernel install failed', 'error': str(exc)}, status=502)
