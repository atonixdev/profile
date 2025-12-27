from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import BiometricReading, CognitiveTestResult, EvolutionMetric, JournalEntry
from .serializers import (
    BiometricReadingSerializer,
    CognitiveTestResultSerializer,
    EvolutionMetricSerializer,
    JournalEntrySerializer,
)


class OwnedModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user and self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BiometricReadingViewSet(OwnedModelViewSet):
    serializer_class = BiometricReadingSerializer
    queryset = BiometricReading.objects.all()


class CognitiveTestResultViewSet(OwnedModelViewSet):
    serializer_class = CognitiveTestResultSerializer
    queryset = CognitiveTestResult.objects.all()


class EvolutionMetricViewSet(OwnedModelViewSet):
    serializer_class = EvolutionMetricSerializer
    queryset = EvolutionMetric.objects.all()


class JournalEntryViewSet(OwnedModelViewSet):
    serializer_class = JournalEntrySerializer
    queryset = JournalEntry.objects.all()


class SummaryViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        now = timezone.now()

        biometrics_qs = BiometricReading.objects.filter(user=user)
        cognitive_qs = CognitiveTestResult.objects.filter(user=user)
        evolution_qs = EvolutionMetric.objects.filter(user=user)
        journals_qs = JournalEntry.objects.filter(user=user)

        latest_biometric = biometrics_qs.order_by('-recorded_at').first()
        latest_cognitive = cognitive_qs.order_by('-recorded_at').first()
        latest_evolution = evolution_qs.order_by('-recorded_at').first()
        latest_journal = journals_qs.order_by('-created_at').first()

        def fmt_dt(dt):
            return dt.isoformat() if dt else None

        return Response(
            {
                'captured_at': now.isoformat(),
                'counts': {
                    'biometrics': biometrics_qs.count(),
                    'cognitive_tests': cognitive_qs.count(),
                    'evolution_metrics': evolution_qs.count(),
                    'journal_entries': journals_qs.count(),
                },
                'latest': {
                    'biometric_recorded_at': fmt_dt(getattr(latest_biometric, 'recorded_at', None)),
                    'cognitive_recorded_at': fmt_dt(getattr(latest_cognitive, 'recorded_at', None)),
                    'evolution_recorded_at': fmt_dt(getattr(latest_evolution, 'recorded_at', None)),
                    'journal_created_at': fmt_dt(getattr(latest_journal, 'created_at', None)),
                },
            }
        )
