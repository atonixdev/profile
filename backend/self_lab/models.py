from django.conf import settings
from django.db import models


class BiometricReading(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='biometric_readings')

    recorded_at = models.DateTimeField()

    heart_rate_bpm = models.PositiveIntegerField(null=True, blank=True)
    steps = models.PositiveIntegerField(null=True, blank=True)
    sleep_hours = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    notes = models.CharField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at', '-id']

    def __str__(self):
        return f'BiometricReading(user={self.user_id}, recorded_at={self.recorded_at})'


class CognitiveTestResult(models.Model):
    class TestType(models.TextChoices):
        MEMORY = 'memory', 'Memory'
        FOCUS = 'focus', 'Focus'
        REACTION = 'reaction', 'Reaction'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cognitive_test_results')

    test_type = models.CharField(max_length=32, choices=TestType.choices)
    recorded_at = models.DateTimeField()

    score = models.FloatField(null=True, blank=True)
    duration_ms = models.PositiveIntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at', '-id']

    def __str__(self):
        return f'CognitiveTestResult(user={self.user_id}, type={self.test_type}, recorded_at={self.recorded_at})'


class EvolutionMetric(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='evolution_metrics')

    metric_name = models.CharField(max_length=100)
    value = models.FloatField()
    recorded_at = models.DateTimeField()

    notes = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at', '-id']

    def __str__(self):
        return f'EvolutionMetric(user={self.user_id}, {self.metric_name}={self.value})'


class JournalEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='journal_entries')

    title = models.CharField(max_length=200)
    content = models.TextField()
    mood = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'JournalEntry(user={self.user_id}, title={self.title})'
