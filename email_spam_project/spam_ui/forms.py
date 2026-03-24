from django import forms


class SpamCheckForm(forms.Form):
    text = forms.CharField(
        label="Email text",
        widget=forms.Textarea(
            attrs={
                "rows": 10,
                "placeholder": "Paste the email content here...",
                "spellcheck": "false",
            }
        ),
    )
