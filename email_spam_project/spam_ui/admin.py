from django.contrib import admin

from .models import SpamCheck


@admin.register(SpamCheck)
class SpamCheckAdmin(admin.ModelAdmin):
	list_display = (
		'created_at',
		'prediction',
		'confidence',
		'spam_probability',
		'ham_probability',
	)
	search_fields = ('text', 'prediction')
	ordering = ('-created_at',)

# Register your models here.
