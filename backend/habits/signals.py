from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import date, timedelta
from .models import HabitLog, UserStats, UserAchievement, Achievement


@receiver(post_save, sender=HabitLog)
def check_achievements(sender, instance, created, **kwargs):
    if not created or not instance.completed:
        return

    user = instance.habit.user

    user_stats, _ = UserStats.objects.get_or_create(user=user)

    achievement_checks = [
        ('First Step', lambda: True),
        ('Week Warrior', lambda: instance.habit.get_current_streak() >= 7),
        ('Month Master', lambda: instance.habit.get_current_streak() >= 30),
        ('Diverse', lambda: user.habits.count() >= 5),
    ]

    for name, check_func in achievement_checks:
        achievement = Achievement.objects.filter(name=name).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            if check_func():
                UserAchievement.objects.create(user=user, achievement=achievement)
                if achievement.points_required > 0:
                    user_stats.add_points(achievement.points_required)
