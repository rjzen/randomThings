from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db import IntegrityError
from django.db.models import Count
from datetime import date, timedelta
from collections import Counter

from .models import Habit, HabitLog, Achievement, UserAchievement, UserStats
from .serializers import (
    HabitSerializer, HabitLogSerializer, HabitCreateSerializer,
    AchievementSerializer, UserStatsSerializer, AnalyticsSerializer
)


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return HabitCreateSerializer
        return HabitSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.logs.all().delete()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        habit = self.get_object()
        logs = habit.logs.all()
        serializer = HabitLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_log(self, request, pk=None):
        habit = self.get_object()
        date_str = request.data.get('date')
        completed = request.data.get('completed', True)

        if not date_str:
            return Response(
                {'error': 'date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            log, created = HabitLog.objects.update_or_create(
                habit=habit,
                date=date_str,
                defaults={'completed': completed}
            )

            if completed:
                habit.points += 10
                habit.save()

            serializer = HabitLogSerializer(log)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except IntegrityError:
            return Response(
                {'error': 'Database error'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def due_today(self, request):
        habits = self.get_queryset()
        due_habits = []

        for habit in habits:
            if habit.reminder_enabled and habit.is_due_today():
                if not habit.logs.filter(date=date.today(), completed=True).exists():
                    due_habits.append(habit)

        serializer = HabitSerializer(due_habits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        habits = self.get_queryset()
        user = request.user

        if not habits.exists():
            return Response({
                'overall_completion_rate': 0,
                'best_day_of_week': 'N/A',
                'most_consistent_habit': None,
                'weekly_summary': []
            })

        total_logs = 0
        total_due = 0
        day_counts = Counter()

        today = date.today()
        four_weeks_ago = today - timedelta(weeks=4)

        for habit in habits:
            logs = habit.logs.filter(completed=True)
            total_logs += logs.count()

            for i in range(0, 28):
                check_date = today - timedelta(days=i)
                if habit.is_due_on(check_date):
                    total_due += 1
                    if logs.filter(date=check_date).exists():
                        day_counts[check_date.weekday()] += 1

        overall_rate = (total_logs / total_due * 100) if total_due > 0 else 0

        best_day = day_counts.most_common(1)[0][0] if day_counts else 0
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        habits_data = []
        for habit in habits:
            rate = habit.get_completion_rate()
            habits_data.append({
                'id': habit.id,
                'name': habit.name,
                'completion_rate': rate
            })

        most_consistent = max(habits_data, key=lambda x: x['completion_rate']) if habits_data else None

        weekly_summary = []
        for week in range(4):
            week_end = today - timedelta(weeks=week)
            week_start = week_end - timedelta(days=6)
            completed = 0
            total = 0

            for d in range(7):
                check_date = week_start + timedelta(days=d)
                for habit in habits:
                    if habit.is_due_on(check_date):
                        total += 1
                        if habit.logs.filter(date=check_date, completed=True).exists():
                            completed += 1

            weekly_summary.append({
                'week': f'Week {4 - week}',
                'completed': completed,
                'total': total
            })

        weekly_summary.reverse()

        return Response({
            'overall_completion_rate': round(overall_rate, 1),
            'best_day_of_week': day_names[best_day] if best_day < 7 else 'N/A',
            'most_consistent_habit': most_consistent,
            'weekly_summary': weekly_summary
        })


class GamificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        user_stats, created = UserStats.objects.get_or_create(user=user)

        achievements = Achievement.objects.all()
        serializer = AchievementSerializer(achievements, many=True, context={'request': request})

        return Response({
            'points': user_stats.total_points,
            'level': user_stats.level,
            'title': user_stats.title,
            'progress': round(user_stats.get_progress_to_next_level(), 1),
            'achievements': serializer.data
        })


class AchievementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        achievements = Achievement.objects.all()
        serializer = AchievementSerializer(achievements, many=True, context={'request': request})
        return Response(serializer.data)
