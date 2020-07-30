$(document).ready(function() {
	// Search for name in customer list
	$('#name-search-input').keyup(function() {
		if ($(this).val()) {
			getCustomers($('#customer-list'), $(this).val())
		} else {
			getCustomers($('#customer-list'))
		}
	})

	// adds a new customer
	$('#newCustomerModal').click(function(e) {
		if ($(e.target).attr('id') == 'save') {
			let category = $($(this).find('#category')).val()
			let name = $($(this).find('#name')).val()
			if (name && category) {
				addCustomer()
			}		
		}
	})

	$('#newCategoryModal').click(function(e) {
		if ($(e.target).attr('id') == 'add') {
			let categoryName = $($(this).find('#category-name')).val()
			if (categoryName) {
				addCategory(categoryName)

				$(this).modal('hide')
			}		
		}
	})

	// adds a new transaction
	$('#customer-list').click(function(e) {
		let t = e.target.nodeName
		if (t == 'BUTTON' || t == 'svg' || t == 'path') {
			let card = $($(e.target).parents('.card'))[0]
			let customerId = $(card).data('id')
			let customerName = $(card).data('name')

			let modal = $('#newTransactionModal')

			// Change modal title
			$(modal.find('#modal-title')).text(customerName)

			// Change datetime input value
			let dateNow = formatDate(Date.now())
			let timeNow = formatTime(Date.now())
			$(modal.find('#datetime').val(`${dateNow} ${timeNow}`))

			// Add button process
			let addBtn = $(modal.find('#add'))
			addBtn.unbind()
			addBtn.click(function() {
				addTransaction(customerId)

				$(modal.find('#amount')).val('')
				$(modal.find('#description')).val('')
				$(modal.find('#name')).val('')
				$(modal.find('#category')).val('')

			})
		}
	})

	// edit a transaction
	$('#transaction-list').click(function(e) {
		let t = e.target.nodeName
		if (t == 'svg' || t == 'path') {
			let target = $(e.target)
			let container = $(target.parents('.transaction-container')[0])
			let transId = container.data('id')

			var action

			if (target.parent('svg').length != 0) {
				action = $(target.parent('svg')[0]).data('action')
				
			} else if (target.parent('svg').length == 0) {
				action = target.data('action')
			}

			if (action == 'delete') {
				let modal = $('#deleteTransactionModal')

				let deleteBtn = $(modal.find('#delete'))
				deleteBtn.unbind()
				deleteBtn.click(function() {
					deleteTransaction(container.data('id'))
				})
			} else {
				let modal = $('#editTransactionModal')

				// Place current value on modal
				$(modal.find('#datetime')).val(container.data('date-added'))
				$(modal.find('#amount')).val(container.data('amount'))
				$(modal.find('#description')).val(container.data('description'))
				$(modal.find('#name')).val(container.data('name'))
				$(modal.find('#transaction-type')).val(container.data('category-type'))

				// add event to save btn
				let saveBtn = $(modal.find('#save'))
				saveBtn.unbind()
				saveBtn.click(function() {
					editTransaction(transId)
				})
			}
		}
	})
	getCustomers($('#customer-list'))
	getTransactions($('#transaction-list'))
})

function addCategory(name) {
	const url = '/add-category/'
	$.post(url, {category_name:name, csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()}).done(function(data) {
		console.log(data)
	})
}