from django.contrib import admin
from .models import Folder, Tag, Note, NoteImage  # Replace with your actual models

admin.site.register(Folder)
admin.site.register(Tag)
admin.site.register(Note)
admin.site.register(NoteImage)