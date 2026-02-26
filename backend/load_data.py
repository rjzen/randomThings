import os
import sys
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.core import serializers

# Clear and reload
with connection.cursor() as cursor:
    cursor.execute('TRUNCATE TABLE django_content_type CASCADE;')
    cursor.execute('ALTER SEQUENCE django_content_type_id_seq RESTART WITH 1;')

with open('db_backup.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Categorize data
contenttypes = [d for d in data if d['model'].startswith('contenttypes.')]
auth_user = [d for d in data if d['model'] == 'auth.user']
auth_perm = [d for d in data if d['model'] == 'auth.permission']
auth_group = [d for d in data if d['model'] == 'auth.group']
sessions = [d for d in data if d['model'].startswith('sessions.')]

# Independent tables (no FK to local tables)
profiles_theme = [d for d in data if d['model'] == 'profiles.theme']
projects_collection = [d for d in data if d['model'] == 'projects_app.collection']
projects_tag = [d for d in data if d['model'] == 'projects_app.tag']
notes_folder = [d for d in data if d['model'] == 'notes_app.folder']
notes_tag = [d for d in data if d['model'] == 'notes_app.tag']

# Dependent tables
profiles_userprofile = [d for d in data if d['model'] == 'profiles.userprofile']
profiles_activity = [d for d in data if d['model'] == 'profiles.activity']
gallery_photo = [d for d in data if d['model'] == 'gallery.photo']
calendar_task = [d for d in data if d['model'] == 'calendar_app.task']
notes_note = [d for d in data if d['model'] == 'notes_app.note']
notes_notetag = [d for d in data if d['model'] == 'notes_app.note_tags']
projects_project = [d for d in data if d['model'] == 'projects_app.project']
projects_projecttag = [d for d in data if d['model'] == 'projects_app_project_tags']

# Load function
def load(objs, label):
    if not objs:
        print(f"Skipped {label} (0)")
        return
    try:
        for obj in serializers.deserialize('json', json.dumps(objs)):
            obj.save()
        print(f"Loaded {label}: {len(objs)}")
    except Exception as e:
        print(f"Error {label}: {e}")
        for i, obj in enumerate(objs):
            try:
                for d in serializers.deserialize('json', json.dumps([obj])):
                    d.save()
            except:
                pass

# Load in correct order
print("Loading data...\n")
load(contenttypes, "contenttypes")
load(auth_group, "auth.group")
load(auth_user, "auth.user")
load(auth_perm, "auth.permissions")
load(sessions, "sessions")

# Independent
print("\n--- Independent tables ---")
load(profiles_theme, "profiles.theme")
load(projects_collection, "projects.collection")
load(projects_tag, "projects.tag")
load(notes_folder, "notes.folder")
load(notes_tag, "notes.tag")

# Dependent
print("\n--- Dependent tables ---")
load(profiles_userprofile, "profiles.userprofile")
load(profiles_activity, "profiles.activity")
load(gallery_photo, "gallery.photo")
load(calendar_task, "calendar.task")
load(notes_note, "notes.note")
load(notes_notetag, "notes.note_tags")
load(projects_project, "projects.project")

print("\n=== Done ===")
