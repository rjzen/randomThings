from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Collection, Tag, Project
from .serializers import CollectionSerializer, TagSerializer, ProjectSerializer


def create_activity(user, action, description, metadata=None):
    from profiles.models import Activity
    Activity.objects.create(
        user=user,
        action=action,
        description=description,
        metadata=metadata or {}
    )


class CollectionViewSet(viewsets.ModelViewSet):
    serializer_class = CollectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Collection.objects.filter(user=self.request.user)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        create_activity(
            self.request.user,
            'collection_deleted',
            f'Deleted collection: {instance.name}',
            {'collection_id': instance.id}
        )
        instance.delete()

    @action(detail=True, methods=['get'])
    def projects(self, request, pk=None):
        collection = self.get_object()
        projects = collection.projects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Project.objects.filter(user=self.request.user)
        
        search = self.request.query_params.get('search')
        collection_id = self.request.query_params.get('collection')
        status_filter = self.request.query_params.get('status')
        tag_id = self.request.query_params.get('tag')
        pinned = self.request.query_params.get('pinned')

        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
        
        if collection_id:
            queryset = queryset.filter(collection_id=collection_id)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)
        
        if pinned == 'true':
            queryset = queryset.filter(is_pinned=True)
        
        return queryset.distinct()

    def perform_create(self, serializer):
        project = serializer.save(user=self.request.user)
        create_activity(
            self.request.user,
            'project_created',
            f'Created project: {project.title}',
            {'project_id': project.id}
        )

    def perform_destroy(self, instance):
        create_activity(
            self.request.user,
            'project_deleted',
            f'Deleted project: {instance.title}',
            {'project_id': instance.id}
        )
        instance.delete()

    @action(detail=True, methods=['patch'])
    def pin(self, request, pk=None):
        project = self.get_object()
        project.is_pinned = not project.is_pinned
        project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def progress(self, request, pk=None):
        project = self.get_object()
        progress_value = request.data.get('progress')
        if progress_value is not None:
            project.progress = int(progress_value)
            if project.progress >= 100:
                project.status = 'completed'
            project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)
