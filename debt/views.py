from django.shortcuts import render, redirect, get_object_or_404, HttpResponse
from django.db.models import Sum, Count
import datetime
from . import models
from . import forms

# Get's a obj.['amount__sum'] then return 0 if None
def zero(to_check):
		if to_check == None:
			return 0
		return to_check

# Get's customer week total
def week_total(customer, category):
	today = datetime.date.today()
	
	if today.weekday() == 6:
		start_week = today
		end_week = today + datetime.timedelta(weeks=1)
	else:
		start_week = today - datetime.timedelta(days=today.weekday()+1)
		end_week = today - datetime.timedelta(days=today.weekday()+1, weeks=-1)

	total = customer.transaction_set.filter(
		    category_type=category, 
		    date_added__range=[start_week, end_week]
		).aggregate(Sum('amount'))

	return zero(total['amount__sum'])

# Get's the customer unpaid
def unpaid_total(customer):
	debit_trans = customer.transaction_set.filter(category_type='Debit')
	credit_trans = customer.transaction_set.exclude(category_type='Debit')
	debits = zero(debit_trans.aggregate(Sum('amount'))['amount__sum'])
	credits = zero(credit_trans.aggregate(Sum('amount'))['amount__sum'])
	return credits - debits

# Checks if customer exist
def check_customer(request):
	exists = models.Customer.objects.all().filter(name=request.GET['name']).exists()
	context = {'exists': exists }
	return render(request, 'debt/check_customer.json', context)
	
# Gets info for parag-assemble
def parag_assemble(customer):
	try:
		last_debit_transaction = customer.debit_set.latest('date_added').date_added
		transactions_upto_latest_debit = customer.transaction_set.filter(
				date_added__lte=last_debit_transaction
			)
		debits_upto_lastest_debit = customer.debit_set.filter(
				date_added__lte=last_debit_transaction
			)

		transactions_amount = transactions_upto_latest_debit.aggregate(Sum('amount'))['amount__sum']
		debits_amount = debits_upto_lastest_debit.aggregate(Sum('amount'))['amount__sum']
		
		balance = zero(transactions_amount) - zero(debits_amount)

		transactions = customer.transaction_set.filter(date_added__gte=last_debit_transaction)
		store = transactions.filter(category_type='Store').aggregate(Sum('amount'))['amount__sum']
		shop = transactions.filter(category_type='Shop').aggregate(Sum('amount'))['amount__sum']
		
		return {
			'store': zero(store),
			'shop': zero(shop),
			'balance': balance
		}

	except:
		store = customer.transaction_set.filter(category_type='Store').aggregate(Sum('amount'))['amount__sum']
		shop = customer.transaction_set.filter(category_type='Shop').aggregate(Sum('amount'))['amount__sum']
		return {
			'store': zero(store),
			'shop': zero(shop),
			'balance': 'No debits yet'
		}

# Get all customers
def get_customers(request):
	name_query = request.GET['name']

	if name_query == 'all':
		customers = models.Customer.objects.all()
	else:
		customers = models.Customer.objects.filter(name__contains=name_query)

	return render(request, 'debt/customers.html', {
			'customers': customers,
			'categories': models.CustomerCategory.objects.all()
		})
		
# Get all transactions
def get_transactions(request):
	try:
		customer = request.GET['customer_name']
		transactions = models.Transaction.objects.filter(name=customer, date_added__date=request.GET.get('date'))
		profile = True
	except:
		transactions = models.Transaction.objects.filter(date_added__date=request.GET.get('date'))
		profile = False
	return render(request, 'debt/transactions.html', {
			'transactions': transactions,
			'profile': profile
		})

# Debt page
def index(request):
	today = datetime.date.today()

	# context to return
	context = {
		'Title': 'Debts',
        'customers': models.Customer.objects.all(),
        'categories': models.CustomerCategory.objects.all()
	}

	return render(request, 'debt/index.html', context)

# Adds a new category
def add_category(request):
	if request.method == 'POST':
		form = forms.NewCategory(request.POST)
		if form.is_valid():
			form.save()

	return HttpResponse(f'Added {request.POST.get("category_name")}.')

# Adds a new customer
def add_new_customer(request):
	if request.method == 'POST':
		form = forms.NewCustomer(request.POST)
		if form.is_valid():
			form.save()
	
	return HttpResponse(f'Added {request.POST.get("name")}.')

# Adds new transaction
def add_new_transaction(request):
	if request.method == 'POST':
		customer = get_object_or_404(models.Customer, id=request.POST.get('name'))
		form = forms.Transaction(request.POST)	
		if form.is_valid():
			form.save()

	return HttpResponse(f'{customer.name} debt {request.POST.get("amount")}.')

# edit transaction
def edit_transaction(request):
	if request.method == 'POST':
		transaction = models.Transaction.objects.get(id=request.POST.get('transId'))
		form = forms.Transaction(request.POST, instance=transaction)
		if form.is_valid():
			form.save()

	return HttpResponse(f'transaction: {request.POST.get("transId")} edited')

# deletes transactions
def delete_transaction(request):
	if request.method == 'POST':
		transaction = models.Transaction.objects.get(id=request.POST.get('transId'))
		transaction.delete()

	return HttpResponse(f'transaction: {request.POST.get("transId")} deleted')

# Edit or add new transaction
def edit_add_transaction(request):
	if request.method == 'POST':
		url = request.META.get('HTTP_REFERER')
		if url == None:
			url = '/'

		transaction = models.Transaction.objects.get(id=request.POST.get('trans-id'))
		if request.POST.get('delete') == 'True':
			transaction.delete()
			return redirect(url)

		form = forms.CustomerProfileForm(request.POST, instance=transaction)
		if form.is_valid():
			form.save()

	return redirect(url)

# Customer Profile Page
def customer_profile(request):
	customer = models.Customer.objects.get(name=request.GET['customer_name'])
	return render(request, 'debt/customer_profile.html', {
			'customer': customer,
			'profile': True,
		})

# Customer profile transactions
def get_customer_transactions(request):
	customer = models.Customer.objects.get(id=request.GET['custId'])
	return render(request, 'debt/customer_profile_transactions.html', {
			'transactions': customer.transaction_set.order_by('date_added'),
		})

def get_customer_info(request):
	customer = models.Customer.objects.get(id=request.GET['custId'])

	return HttpResponse('{"unpaid": "%s"}' % (unpaid_total(customer)))


# Customer List Page
def customer_list(request, category):
	customer_list = list()
	all_unpaid = 0
	if category == 'Shop':
		all_shop_total = 0
		all_store_total = 0
		all_week_total= 0
		all_prev_balance = 0

	if category != 'All':
		customers = models.Customer.objects.filter(category=category)
	else:
		customers = models.Customer.objects.all()

	customer_number = len(customers)
	
	for customer in customers:
		total = unpaid_total(customer)
		if category == 'Shop':
			shop_week_total = week_total(customer, 'Shop')
			store_week_total = week_total(customer, 'Store')
			previous_balance = total - (shop_week_total + store_week_total)
			if previous_balance < 0:
				previous_balance = 0
		
		all_unpaid += total

		data = {
			'customer': customer, 
			'unpaid_total': total
		}

		if category == 'Shop':
			all_shop_total += shop_week_total
			all_store_total += store_week_total
			all_week_total += (shop_week_total + store_week_total)
			all_prev_balance += previous_balance 

			data['shop_week_total'] = shop_week_total
			data['store_week_total'] = store_week_total
			data['week_total'] = shop_week_total + store_week_total
			data['previous_balance'] = previous_balance

		customer_list.append(data)

	context = {
				'Title': 'Customers List',
				'customers_list': customers,
				'customers_data': customer_list,
			 	'overall_unpaid': all_unpaid, 
			 	'category': category,
			 	'customer_number': len(customer_list),
	 		}

	if category == 'Shop':
		context['unpaid_shop_total'] = all_shop_total
		context['unpaid_store_total'] = all_store_total
		context['unpaid_week_total'] = all_week_total
		context['unpaid_balance_total'] = all_prev_balance

	return render(request, 'debt/customer_list.html', context)