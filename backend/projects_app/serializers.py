from rest_framework import serializers
from .models import Collection, Tag, Project


class CollectionSerializer(serializers.ModelSerializer):
    project_count = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ['id', 'name', 'description', 'color', 'created_at', 'project_count']
        read_only_fields = ['id', 'created_at']

    def get_project_count(self, obj):
        return obj.projects.count()


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']
        read_only_fields = ['id']


class ProjectSerializer(serializers.ModelSerializer):
    collection_name = serializers.CharField(source='collection.name', read_only=True)
    collection_color = serializers.CharField(source='collection.color', read_only=True)
    tags_data = TagSerializer(source='tags', many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'url', 'collection', 'collection_name', 'collection_color',
            'tags', 'tags_data', 'status', 'due_date', 'progress', 'is_pinned',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
