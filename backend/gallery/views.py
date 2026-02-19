from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Photo
from .serializers import PhotoSerializer


def create_activity(user, action, description, metadata=None):
    from profiles.models import Activity
    Activity.objects.create(
        user=user,
        action=action,
        description=description,
        metadata=metadata or {}
    )


class PhotoViewSet(viewsets.ModelViewSet):
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Photo.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        photo = serializer.save(user=self.request.user)
        create_activity(
            self.request.user,
            'photo_uploaded',
            f'Uploaded photo: {photo.title or photo.id}',
            {'photo_id': photo.id}
        )

    def perform_destroy(self, instance):
        photo_title = instance.title or f"Photo {instance.id}"
        instance_id = instance.id
        instance.delete()
        create_activity(
            self.request.user,
            'photo_deleted',
            f'Deleted photo: {photo_title}',
            {'photo_id': instance_id}
        )

    def perform_update(self, instance):
        old_title = instance.title
        instance.title = self.request.data.get('title', instance.title)
        instance.description = self.request.data.get('description', instance.description)
        instance.save()
        if instance.title != old_title:
            create_activity(
                self.request.user,
                'photo_updated',
                f'Updated photo: {instance.title or instance.id}',
                {'photo_id': instance.id}
            )


class PhotoUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image = request.FILES.get('image')
        title = request.data.get('title', '')
        description = request.data.get('description', '')

        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        photo = Photo.objects.create(
            user=request.user,
            image=image,
            title=title,
            description=description
        )

        create_activity(
            request.user,
            'photo_uploaded',
            f'Uploaded photo: {title or photo.id}',
            {'photo_id': photo.id}
        )

        serializer = PhotoSerializer(photo, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PhotoDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        photo = get_object_or_404(Photo, pk=pk, user=request.user)
        serializer = PhotoSerializer(photo, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        photo = get_object_or_404(Photo, pk=pk, user=request.user)
        photo_title = photo.title or f"Photo {photo.id}"
        photo.delete()
        
        create_activity(
            request.user,
            'photo_deleted',
            f'Deleted photo: {photo_title}',
            {'photo_id': pk}
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def put(self, request, pk):
        photo = get_object_or_404(Photo, pk=pk, user=request.user)
        old_title = photo.title
        photo.title = request.data.get('title', photo.title)
        photo.description = request.data.get('description', photo.description)
        photo.save()
        
        if photo.title != old_title:
            create_activity(
                request.user,
                'photo_updated',
                f'Updated photo: {photo.title or photo.id}',
                {'photo_id': photo.id}
            )
        
        serializer = PhotoSerializer(photo, context={'request': request})
        return Response(serializer.data)
