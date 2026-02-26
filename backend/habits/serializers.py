from rest_framework import serializers
from datetime import date, timedelta
from django.db.models import Count
from .models import Habit, HabitLog, Achievement, UserAchievement, UserStats


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ['id', 'habit', 'date', 'completed']
        read_only_fields = ['id', 'habit']


class HabitSerializer(serializers.ModelSerializer):
    current_streak = serializers.SerializerMethodField()
    longest_streak = serializers.SerializerMethodField()
    today_completed = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            'id', 'name', 'color', 'icon', 'frequency', 'target_days', 'category',
            'reminder_time', 'reminder_enabled', 'points',
            'created_at', 'current_streak', 'longest_streak', 'today_completed', 'completion_rate'
        ]
        read_only_fields = ['id', 'created_at', 'points']

    def get_current_streak(self, obj):
        return obj.get_current_streak()

    def get_longest_streak(self, obj):
        return obj.get_longest_streak()

    def get_today_completed(self, obj):
        return obj.logs.filter(date=date.today(), completed=True).exists()

    def get_completion_rate(self, obj):
        return round(obj.get_completion_rate(), 1)


class HabitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = [
            'name', 'color', 'icon', 'frequency', 'target_days', 'category',
            'reminder_time', 'reminder_enabled'
        ]


class AchievementSerializer(serializers.ModelSerializer):
    unlocked = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'icon', 'unlocked']

    def get_unlocked(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user:
            return UserAchievement.objects.filter(user=user, achievement=obj).exists()
        return False


class UserStatsSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    achievements = serializers.SerializerMethodField()

    class Meta:
        model = UserStats
        fields = ['total_points', 'level', 'title', 'progress', 'achievements']

    def get_progress(self, obj):
        return round(obj.get_progress_to_next_level(), 1)

    def get_achievements(self, obj):
        user_achievements = UserAchievement.objects.filter(user=obj.user).select_related('achievement')
        return [
            {
                'name': ua.achievement.name,
                'description': ua.achievement.description,
                'icon': ua.achievement.icon,
                'unlocked_at': ua.unlocked_at
            }
            for ua in user_achievements
        ]


class AnalyticsSerializer(serializers.Serializer):
    overall_completion_rate = serializers.FloatField()
    best_day_of_week = serializers.CharField()
    most_consistent_habit = serializers.DictField()
    weekly_summary = serializers.ListField()
