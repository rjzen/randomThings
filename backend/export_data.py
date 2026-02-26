import os
import sys
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def get_field_value(obj, field):
    value = getattr(obj, field.name)
    if hasattr(value, 'isoformat'):
        return value.isoformat()
    elif hasattr(value, 'pk'):
        return value.pk
    elif hasattr(value, 'name'):
        return value.name
    return value

def export_model(model, app_name):
    model_name = model._meta.model_name
    data = []
    for obj in model.objects.all():
        fields = {}
        for field in model._meta.fields:
            fields[field.name] = get_field_value(obj, field)
        data.append({
            "model": f"{app_name}.{model_name}",
            "pk": obj.pk,
            "fields": fields
        })
    return data

# Export each app
all_data = []

# Gallery
try:
    from gallery.models import Photo
    all_data.extend(export_model(Photo, 'gallery'))
    print(f"Exported gallery: {len([d for d in all_data if d['model'].startswith('gallery')])} records")
except Exception as e:
    print(f"Error exporting gallery: {e}")

# Notes app
try:
    from notes_app.models import Note, Folder, Tag
    for model in [Note, Folder, Tag]:
        all_data.extend(export_model(model, 'notes_app'))
    print(f"Exported notes_app: {len([d for d in all_data if d['model'].startswith('notes_app')])} records")
except Exception as e:
    print(f"Error exporting notes_app: {e}")

# Profiles
try:
    from profiles.models import UserProfile, Theme, Activity
    for model in [UserProfile, Theme, Activity]:
        all_data.extend(export_model(model, 'profiles'))
    print(f"Exported profiles: {len([d for d in all_data if d['model'].startswith('profiles')])} records")
except Exception as e:
    print(f"Error exporting profiles: {e}")

# Calendar app
try:
    from calendar_app.models import Task
    all_data.extend(export_model(Task, 'calendar_app'))
    print(f"Exported calendar_app: {len([d for d in all_data if d['model'].startswith('calendar_app')])} records")
except Exception as e:
    print(f"Error exporting calendar_app: {e}")

# Projects app
try:
    from projects_app.models import Project, Collection, Tag as ProjectTag
    for model in [Project, Collection, ProjectTag]:
        all_data.extend(export_model(model, 'projects_app'))
    print(f"Exported projects_app: {len([d for d in all_data if d['model'].startswith('projects_app')])} records")
except Exception as e:
    print(f"Error exporting projects_app: {e}")

# Auth
try:
    from django.contrib.auth.models import User, Group, Permission
    for model in [User, Group, Permission]:
        all_data.extend(export_model(model, 'auth'))
    print(f"Exported auth: {len([d for d in all_data if d['model'].startswith('auth')])} records")
except Exception as e:
    print(f"Error exporting auth: {e}")

# ContentTypes
try:
    from django.contrib.contenttypes.models import ContentType
    all_data.extend(export_model(ContentType, 'contenttypes'))
    print(f"Exported contenttypes: {len([d for d in all_data if d['model'].startswith('contenttypes')])} records")
except Exception as e:
    print(f"Error exporting contenttypes: {e}")

# Sessions
try:
    from django.contrib.sessions.models import Session
    all_data.extend(export_model(Session, 'sessions'))
    print(f"Exported sessions: {len([d for d in all_data if d['model'].startswith('sessions')])} records")
except Exception as e:
    print(f"Error exporting sessions: {e}")

with open('db_backup.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"\nTotal records exported: {len(all_data)}")
print("Data exported to db_backup.json")
