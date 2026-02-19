from rest_framework import serializers
from .models import Folder, Tag, Note, NoteImage


class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']
        read_only_fields = ['id']


class NoteImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NoteImage
        fields = ['id', 'image', 'image_url', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )
    folder_name = serializers.SerializerMethodField()
    images = NoteImageSerializer(many=True, read_only=True)

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'content', 'folder', 'folder_name', 'tags', 'tag_ids',
            'color', 'is_pinned', 'is_archived', 'is_deleted', 'deleted_at',
            'created_at', 'updated_at', 'images'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_folder_name(self, obj):
        return obj.folder.name if obj.folder else None

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        folder = validated_data.get('folder')
        if folder == '' or folder is None:
            validated_data['folder'] = None
        note = Note.objects.create(**validated_data)
        if tag_ids:
            note.tags.set(tag_ids)
        return note

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        folder = validated_data.get('folder', None)
        if folder == '' or folder is None or folder == 'null':
            validated_data['folder'] = None
        instance = super().update(instance, validated_data)
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        return instance
