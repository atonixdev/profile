from rest_framework import serializers

from .models import Dataset, ModelArtifact


class DatasetSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = (
            'id',
            'name',
            'description',
            'file',
            'file_url',
            'created_by',
            'created_at',
            'is_active',
        )
        read_only_fields = ('id', 'created_by', 'created_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if not obj.file:
            return None
        try:
            url = obj.file.url
        except Exception:
            return None
        if request is None:
            return url
        return request.build_absolute_uri(url)


class ModelArtifactSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ModelArtifact
        fields = (
            'id',
            'name',
            'version',
            'description',
            'file',
            'file_url',
            'metrics',
            'created_by',
            'created_at',
            'is_active',
        )
        read_only_fields = ('id', 'created_by', 'created_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if not obj.file:
            return None
        try:
            url = obj.file.url
        except Exception:
            return None
        if request is None:
            return url
        return request.build_absolute_uri(url)
