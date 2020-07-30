// 

$(document).ready(function() {
	getTransactions($('input[name="customer-id"]').val())
	getCustomerInfo($('input[name="customer-id"]').val())
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

	$('#newTransaction').click(function(e) {
		$($(e.target).parent()).removeClass('show')

		let modal = $('#newTransactionModal')
		$(modal.find('#modal-title')).text($('input[name="customer-name"]').val())
		$(modal.find('#datetime')).val(`${formatDate(Date(Date.now()))} ${formatTime(Date(Date.now()))}`)
	
		let addBtn = $(modal.find('#add'))
		addBtn.unbind()

		addBtn.click(function() {
			addTransaction($('input[name="customer-id"]').val())

			$(modal.find('#amount')).val('')
			$(modal.find('#description')).val('')
		}) 
	})
})

function formatNum(num) {
	num = String(num).split('')
	num.reverse()
	number = []
	for (i=0; i < num.length; i++) {
		if ((i+1) % 3 == 0 && (i+1) != num.length) {
			number.push(num[i])
			if (num[i+1] != '-') {
				number.push(',')
			}
		}  else {
			number.push(num[i])
		}
	}
	number.reverse()
	return number.join('')
}

// gets customer info
function getCustomerInfo(custId) {
	const url = '/get-customer-info/'

	$.get(url, {custId:custId}).done(function(data) {
		data = JSON.parse(data)

		$($('#data-unpaid').find('span')).text(`₱${formatNum(data.unpaid)}`)
	})
}

// adds transaction 
function addTransaction(custId) {
	const url = '/add-new-transaction/'
	
	let modal = $('#newTransactionModal')
	let amount = $(modal.find('#amount')).val()
	let description = $(modal.find('#description')).val()
	let datetime = $(modal.find('#datetime')).val() 
	let category_type = $(modal.find('#transaction-type')).val()

	$.post(url, {
			date_added: datetime,
			amount: amount,
			description: description,
			name: custId,
			category_type: category_type,
			csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
		}).done(function(data) {
			modal.modal('hide')
			getTransactions($('input[name="customer-id"]').val())
			getCustomerInfo($('input[name="customer-id"]').val())
			console.log(data)
	})
}

// gets transaction
function getTransactions(custId, date=formatDate(Date(Date.now()))) {
	$.get('/get-customer-transactions/', {
			date:date, custId:custId
		}).done(function(data) {
			$('#transaction-list').empty().html(data)
	})
}

// edits transaction
function editTransaction(transId, url='/edit-transaction/') {
	let modal = $('#editTransactionModal')

	let name = modal.find('#name').val()
	let amount = modal.find('#amount').val()
	let category_type = modal.find('#transaction-type').val()
	let description = modal.find('#description').val()
	let datetime = modal.find('#datetime').val()

	$.post(url, {
		transId: transId,
		name: name,
		amount: amount,
		category_type: category_type,
		description: description,
		date_added: datetime,
		csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
	}).done(function(data) {
		modal.modal('hide')
		getTransactions($('input[name="customer-id"]').val())
		getCustomerInfo($('input[name="customer-id"]').val())
		console.log(data)
	})
}

// deletes transaction
function deleteTransaction(transId) {
	const url = '/delete-transaction/'
	let modal = $('#deleteTransactionModal')
	$.post(url, {
		transId: transId,
		csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
	}).done(function(data) {
		modal.modal('hide')
		getTransactions($('input[name="customer-id"]').val())
		getCustomerInfo($('input[name="customer-id"]').val())
		console.log(data)
	})
}