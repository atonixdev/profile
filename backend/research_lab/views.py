from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Experiment, ExperimentRun
from .permissions import IsAdminOrReadOnly, IsOwnerOrAdminReadOnly
from .runner import run_experiment
from .local_sqlite import append_log, read_logs


class ExperimentViewSet(viewsets.ModelViewSet):
    serializer_class = None  # set in get_serializer_class
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Experiment.objects.all()
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
