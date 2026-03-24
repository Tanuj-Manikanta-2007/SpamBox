from django import forms


class AiTextForm(forms.Form):
    text = forms.CharField(
        widget=forms.Textarea(
            attrs={
                "placeholder": "Paste your email/text here...",
                "class": "textarea",
            }
        ),
        required=True,
        label="Text",
    )
