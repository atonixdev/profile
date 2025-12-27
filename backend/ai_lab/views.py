from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Dataset, ModelArtifact
from .serializers import DatasetSerializer, ModelArtifactSerializer
from .permissions import ReadOnlyOrAuthenticatedWrite


class DatasetViewSet(viewsets.ModelViewSet):
    serializer_class = DatasetSerializer
    permission_classes = [ReadOnlyOrAuthenticatedWrite]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Dataset.objects.all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)


class ModelArtifactViewSet(viewsets.ModelViewSet):
    serializer_class = ModelArtifactSerializer
    permission_classes = [ReadOnlyOrAuthenticatedWrite]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = ModelArtifact.objects.all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
