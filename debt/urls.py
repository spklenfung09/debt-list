from django.urls import path
from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('add-new-customer/', views.add_new_customer),
	path('add-new-transaction/', views.add_new_transaction),
	path('edit-add-transaction/', views.edit_add_transaction),
	path('check-customer/', views.check_customer),
	path('customer-profile/', views.customer_profile, name='customer-profile'),
	path('customer-list/<category>/', views.customer_list, name='customer-list'),
	path('get-customers/', views.get_customers),
	path('get-transactions/', views.get_transactions),
	path('edit-transaction/', views.edit_transaction),
	path('delete-transaction/', views.delete_transaction),
	path('get-customer-transactions/', views.get_customer_transactions),
	path('get-customer-info/', views.get_customer_info),
	path('add-category/', views.add_category)
]