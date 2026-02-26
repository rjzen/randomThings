from django.db import models
from django.contrib.auth.models import User
from datetime import date, timedelta


class Habit(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekdays', 'Weekdays'),
        ('weekends', 'Weekends'),
        ('custom', 'Custom'),
    ]

    CATEGORY_CHOICES = [
        ('health', 'Health'),
        ('productivity', 'Productivity'),
        ('mindfulness', 'Mindfulness'),
        ('fitness', 'Fitness'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=7, default='#6366f1')
    icon = models.CharField(max_length=10, default='✅')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='daily')
    target_days = models.JSONField(default=list)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    reminder_time = models.TimeField(null=True, blank=True)
    reminder_enabled = models.BooleanField(default=False)
    points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'name']

    def __str__(self):
        return self.name

    def is_due_today(self):
        """Check if habit is due today based on frequency"""
        today = date.today()
        weekday = today.weekday()

        if self.frequency == 'daily':
            return True
        elif self.frequency == 'weekdays':
            return weekday < 5
        elif self.frequency == 'weekends':
            return weekday >= 5
        elif self.frequency == 'custom':
            return weekday in (self.target_days or [])
        return True

    def get_completion_rate(self):
        """Calculate completion rate based on frequency"""
        from datetime import datetime, timedelta
        logs = self.logs.filter(completed=True)
        if not logs.exists():
            return 0

        start_date = self.created_at.date()
        today = date.today()
        total_days = (today - start_date).days + 1

        if total_days <= 0:
            return 0

        if self.frequency == 'daily':
            completed = logs.count()
        else:
            due_days = 0
            current = start_date
            while current <= today:
                if self.is_due_on(current):
                    due_days += 1
                current += timedelta(days=1)

            completed = logs.filter(date__gte=start_date, date__lte=today).count()
            if due_days == 0:
                return 0
            return (completed / due_days) * 100

        return (completed / total_days) * 100 if total_days > 0 else 0

    def is_due_on(self, check_date):
        """Check if a specific date is a due day"""
        weekday = check_date.weekday()
        if self.frequency == 'daily':
            return True
        elif self.frequency == 'weekdays':
            return weekday < 5
        elif self.frequency == 'weekends':
            return weekday >= 5
        elif self.frequency == 'custom':
            return weekday in (self.target_days or [])
        return True

    def get_current_streak(self):
        """Count consecutive completed days ending today (respects frequency)"""
        logs = self.logs.filter(completed=True).order_by('-date')
        if not logs.exists():
            return 0

        streak = 0
        current_date = date.today()

        if not self.is_due_on(current_date):
            current_date -= timedelta(days=1)
            while current_date >= self.created_at.date() and not self.is_due_on(current_date):
                current_date -= timedelta(days=1)

        if current_date < self.created_at.date():
            return 0

        while logs.filter(date=current_date, completed=True).exists():
            streak += 1
            current_date -= timedelta(days=1)
            while current_date >= self.created_at.date() and not self.is_due_on(current_date):
                current_date -= timedelta(days=1)
            if current_date < self.created_at.date():
                break

        return streak

    def get_longest_streak(self):
        """Find max run of consecutive completed days (respects frequency)"""
        logs = self.logs.filter(completed=True).order_by('date')
        if not logs.exists():
            return 0

        longest = 0
        current = 0
        prev_date = None
        start_date = self.created_at.date()

        for log in logs:
            if log.date < start_date:
                continue
            if prev_date is None:
                current = 1
            elif (log.date - prev_date).days == 1:
                current += 1
            else:
                current = 1
            longest = max(longest, current)
            prev_date = log.date

        return longest


class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    completed = models.BooleanField(default=True)

    class Meta:
        unique_together = ['habit', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.habit.name} - {self.date}"


class Achievement(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=20, default='🏆')
    points_required = models.IntegerField(default=0)
    streak_required = models.IntegerField(default=0)
    habit_count_required = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'achievement']


class UserStats(models.Model):
    LEVELS = [
        ('Beginner', 0),
        ('Consistent', 100),
        ('Dedicated', 300),
        ('Master', 600),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    total_points = models.IntegerField(default=0)
    level = models.CharField(max_length=20, default='Beginner')
    title = models.CharField(max_length=50, default='Newcomer')

    def add_points(self, points):
        self.total_points += points
        self.update_level()
        self.save()

    def update_level(self):
        if self.total_points >= 600:
            self.level = 'Master'
            self.title = 'Habit Master'
        elif self.total_points >= 300:
            self.level = 'Dedicated'
            self.title = 'Dedicated Achiever'
        elif self.total_points >= 100:
            self.level = 'Consistent'
            self.title = 'Consistent Starter'
        else:
            self.level = 'Beginner'
            self.title = 'Newcomer'

    def get_progress_to_next_level(self):
        thresholds = [0, 100, 300, 600]
        current_threshold = 0
        next_threshold = 100

        for i, (level, threshold) in enumerate(self.LEVELS):
            if self.total_points >= threshold:
                current_threshold = threshold
                if i + 1 < len(self.LEVELS):
                    next_threshold = thresholds[i + 1]
                else:
                    next_threshold = threshold + 100

        if next_threshold == current_threshold:
            return 100

        return ((self.total_points - current_threshold) / (next_threshold - current_threshold)) * 100

    def __str__(self):
        return f"{self.user.username} - {self.level}"
