from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, date
from .models import Task
from .serializers import TaskSerializer


def create_activity(user, action, description, metadata=None):
    from profiles.models import Activity
    Activity.objects.create(
        user=user,
        action=action,
        description=description,
        metadata=metadata or {}
    )


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        create_activity(
            self.request.user,
            'task_created',
            f'Created task: {task.title}',
            {'task_id': task.id, 'date': str(task.date)}
        )

    def perform_destroy(self, instance):
        task_title = instance.title
        instance_id = instance.id
        instance.delete()
        create_activity(
            self.request.user,
            'task_deleted',
            f'Deleted task: {task_title}',
            {'task_id': instance_id}
        )

    @action(detail=False, methods=['get'])
    def today(self, request):
        today = date.today()
        tasks = Task.objects.filter(user=request.user, date=today)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        today = date.today()
        tasks = Task.objects.filter(user=request.user, date__gte=today).order_by('date', 'start_time')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def past(self, request):
        today = date.today()
        tasks = Task.objects.filter(user=request.user, date__lt=today).order_by('-date', '-start_time')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def all(self, request):
        tasks = Task.objects.filter(user=request.user).order_by('date', 'start_time')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_date(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'Date parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
        
        tasks = Task.objects.filter(user=request.user, date=target_date)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
