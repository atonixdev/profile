from rest_framework import serializers
from .models import Experiment, ExperimentRun


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
