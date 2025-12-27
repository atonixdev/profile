from rest_framework import serializers

from .models import BiometricReading, CognitiveTestResult, EvolutionMetric, JournalEntry


class BiometricReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiometricReading
        fields = [
            'id',
            'recorded_at',
            'heart_rate_bpm',
            'steps',
            'sleep_hours',
            'weight_kg',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class CognitiveTestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = CognitiveTestResult
        fields = [
            'id',
            'test_type',
            'recorded_at',
            'score',
            'duration_ms',
            'metadata',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class EvolutionMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvolutionMetric
        fields = [
            'id',
            'metric_name',
            'value',
            'recorded_at',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = [
            'id',
            'title',
            'content',
            'mood',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
