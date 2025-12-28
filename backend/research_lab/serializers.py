from rest_framework import serializers
from django.db.models import Max

from .models import Experiment, ExperimentRun, Notebook, NotebookCell


class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = (
            'id',
            'slug',
            'name',
            'description',
            'experiment_type',
            'is_active',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class ExperimentRunSerializer(serializers.ModelSerializer):
    experiment = ExperimentSerializer(read_only=True)
    experiment_id = serializers.PrimaryKeyRelatedField(
        source='experiment',
        queryset=Experiment.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = ExperimentRun
        fields = (
            'id',
            'experiment',
            'experiment_id',
            'user',
            'status',
            'params',
            'output',
            'metrics',
            'error_text',
            'duration_ms',
            'local_sqlite_path',
            'started_at',
            'finished_at',
            'created_at',
        )
        read_only_fields = (
            'id',
            'user',
            'status',
            'output',
            'metrics',
            'error_text',
            'duration_ms',
            'local_sqlite_path',
            'started_at',
            'finished_at',
            'created_at',
            'experiment',
        )


class NotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notebook
        fields = (
            'id',
            'name',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class NotebookCellSerializer(serializers.ModelSerializer):
    notebook_id = serializers.PrimaryKeyRelatedField(source='notebook', queryset=Notebook.objects.all(), write_only=True)

    class Meta:
        model = NotebookCell
        fields = (
            'id',
            'notebook_id',
            'notebook',
            'position',
            'code',
            'last_stdout',
            'last_stderr',
            'last_exit_code',
            'last_duration_ms',
            'last_executed_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'notebook',
            'last_stdout',
            'last_stderr',
            'last_exit_code',
            'last_duration_ms',
            'last_executed_at',
            'created_at',
            'updated_at',
        )

    def validate(self, attrs):
        notebook = attrs.get('notebook')
        if notebook and hasattr(self.context.get('request', None), 'user'):
            request = self.context.get('request')
            if request and request.user and request.user.is_authenticated:
                if not (request.user.is_staff or notebook.user_id == request.user.id):
                    raise serializers.ValidationError('Not allowed.')
        return attrs

    def create(self, validated_data):
        # If position isn't provided, append to the end.
        notebook = validated_data['notebook']
        if 'position' not in validated_data:
            max_pos = NotebookCell.objects.filter(notebook=notebook).aggregate(Max('position')).get('position__max')
            validated_data['position'] = (max_pos + 1) if max_pos is not None else 0
        return super().create(validated_data)
