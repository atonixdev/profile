from django.contrib import admin

from .models import BiometricReading, CognitiveTestResult, EvolutionMetric, JournalEntry


@admin.register(BiometricReading)
class BiometricReadingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'recorded_at', 'heart_rate_bpm', 'steps', 'sleep_hours', 'weight_kg')
    search_fields = ('user__username', 'notes')
    list_filter = ('recorded_at',)


@admin.register(CognitiveTestResult)
class CognitiveTestResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'test_type', 'recorded_at', 'score', 'duration_ms')
    search_fields = ('user__username',)
    list_filter = ('test_type', 'recorded_at')


@admin.register(EvolutionMetric)
class EvolutionMetricAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'metric_name', 'value', 'recorded_at')
    search_fields = ('user__username', 'metric_name', 'notes')
    list_filter = ('metric_name', 'recorded_at')


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'mood', 'created_at', 'updated_at')
    search_fields = ('user__username', 'title', 'content', 'mood')
    list_filter = ('created_at', 'mood')
