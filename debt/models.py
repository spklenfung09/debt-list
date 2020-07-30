from django.db import models

# Create your models here.

class CustomerCategory(models.Model):
	category_name = models.CharField(max_length=100)

	class Meta:
		verbose_name_plural = 'Customer\'s category'

	def __str__(self):
		return self.category_name

	def save(self):
		self.category_name = [ n.capitalize() for n in self.category_name.split()]
		self.category_name = ' '.join(self.category_name)
		super(CustomerCategory, self).save()

class Customer(models.Model):
	category = models.ForeignKey(CustomerCategory, on_delete=models.CASCADE, default=1)
	name = models.CharField(max_length=50, unique=True)	
	
	class Meta:
		ordering = ['name']
		
	def __str__(self):
		return self.name

	def save(self):
		self.name = [ n.capitalize() for n in self.name.split()]
		self.name = ' '.join(self.name)
		super(Customer, self).save()

class Transaction(models.Model):
	category_type = [
		('Store', 'Store'),
		('Shop', 'Shop'),
		('Debit', 'Debit')
	]

	name = models.ForeignKey(Customer, on_delete=models.CASCADE)
	amount = models.PositiveIntegerField()
	category_type = models.CharField(max_length=10, choices=category_type, default='Store')
	description = models.TextField(blank=True)
	date_added = models.DateTimeField()

	class Meta:
		verbose_name_plural = 'Debt transactions'

	def __str__(self):
		return f'{self.name} - {self.amount} {self.description}'