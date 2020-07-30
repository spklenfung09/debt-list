from django import forms
from django.utils.translation import gettext_lazy as _

from . import models

class Transaction(forms.ModelForm):
	class Meta:
		model = models.Transaction
		fields = ['name', 'amount', 'category_type', 'description', 'date_added']
		widgets = {
			'name': forms.Select(),
			'amount': forms.TextInput(),
			'date_added': forms.TextInput(),
			'category_type': forms.Select(),
			'description': forms.Textarea()
		}

class NewCategory(forms.ModelForm):
	class Meta:
		model = models.CustomerCategory
		fields = ['category_name']
		widgets = {
			'category_name': forms.TextInput()
		}

class NewCustomer(forms.ModelForm):
	class Meta:
		model = models.Customer
		fields = ['name', 'category']
		widgets = {
			'name': forms.TextInput(),
			'category': forms.Select()
		}