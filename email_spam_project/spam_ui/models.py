from django.db import models


class SpamCheck(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	text = models.TextField()

	prediction = models.CharField(max_length=32, blank=True)
	confidence = models.FloatField(null=True, blank=True)
	spam_probability = models.FloatField(null=True, blank=True)
	ham_probability = models.FloatField(null=True, blank=True)

	def __str__(self) -> str:
		label = self.prediction or 'unknown'
		return f"{label} @ {self.created_at:%Y-%m-%d %H:%M:%S}"

# Create your models here.
