from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from .models import Folder, Tag, Note, NoteImage
from .serializers import FolderSerializer, TagSerializer, NoteSerializer, NoteImageSerializer


def create_activity(user, action, description, metadata=None):
    from profiles.models import Activity
    Activity.objects.create(
        user=user,
        action=action,
        description=description,
        metadata=metadata or {}
    )


class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Folder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user)
        
        search = self.request.query_params.get('search')
        folder_id = self.request.query_params.get('folder')
        tag_id = self.request.query_params.get('tag')
        archived = self.request.query_params.get('archived')
        deleted = self.request.query_params.get('deleted')
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        if folder_id:
            queryset = queryset.filter(folder_id=folder_id)
        
        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)
        
        if archived == 'true':
            queryset = queryset.filter(is_archived=True, is_deleted=False)
        
        if deleted == 'true':
            queryset = queryset.filter(is_deleted=True)
        else:
            queryset = queryset.filter(is_deleted=False)
        
        return queryset.distinct()

    def perform_create(self, serializer):
        note = serializer.save(user=self.request.user)
        create_activity(
            self.request.user,
            'note_created',
            f'Created note: {note.title or "Untitled"}',
            {'note_id': note.id}
        )

    def perform_destroy(self, instance):
        note_title = instance.title or "Untitled"
        instance.delete()
        create_activity(
            self.request.user,
            'note_deleted',
            f'Deleted note: {note_title}',
            {}
        )

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.is_deleted and not serializer.validated_data.get('is_deleted', True):
            instance.deleted_at = None
        serializer.save()

    @action(detail=True, methods=['patch'])
    def pin(self, request, pk=None):
        note = self.get_object()
        note.is_pinned = not note.is_pinned
        note.save()
        serializer = self.get_serializer(note)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        note = self.get_object()
        note.is_archived = not note.is_archived
        note.is_pinned = False if note.is_archived else note.is_pinned
        note.save()
        serializer = self.get_serializer(note)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def trash(self, request, pk=None):
        note = self.get_object()
        note_title = note.title or "Untitled"
        note.is_deleted = True
        note.is_pinned = False
        note.deleted_at = timezone.now()
        note.save()
        create_activity(
            self.request.user,
            'note_deleted',
            f'Deleted note: {note_title}',
            {'note_id': note.id}
        )
        serializer = self.get_serializer(note)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def restore(self, request, pk=None):
        note = self.get_object()
        note.is_deleted = False
        note.deleted_at = None
        note.save()
        serializer = self.get_serializer(note)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def images(self, request, pk=None):
        note = self.get_object()
        image = request.FILES.get('image')
        
        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        note_image = NoteImage.objects.create(note=note, image=image)
        serializer = NoteImageSerializer(note_image, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, image_id=None):
        try:
            note_image = NoteImage.objects.get(id=image_id, note__user=request.user)
            note_image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except NoteImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'], url_path='permanent-delete')
    def permanent_delete_old(self, request):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        old_notes = Note.objects.filter(
            user=request.user,
            is_deleted=True,
            deleted_at__lt=thirty_days_ago
        )
        count = old_notes.count()
        old_notes.delete()
        return Response({'deleted': count})


class NoteImageViewSet(viewsets.ModelViewSet):
    serializer_class = NoteImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return NoteImage.objects.filter(note__user=self.request.user)
