$(document).ready(function() {
	$('.container').click(function(e) {
		if ($(e.target).hasClass('dropdown-toggle')) {
			let parent = $($(e.target).parent())
			let options = $($(e.target).parent()).find('.dropdown-menu')
			$(parent).toggleClass('show')
			$(options).toggleClass('show')
		}
	})
})


function search(toSearch) {
	let items = $('.card')
	if (items.length == 0) {
		items = $('tbody tr')
		s1(items, 'a')
	} else {
		 s1(items, '.card-header')
	}

	function s1(items, toFind) {
		for (i=0; i < items.length; i++) {
		if ($($(items[i]).find(toFind)).text().toLowerCase().includes(toSearch.toLowerCase())) {
				$(items[i]).removeClass('d-none')
			} else {
				$(items[i]).addClass('d-none')
			}
		}
	}
	
}

function formatDate(dateTime) {
	var d = new Date(dateTime)
    month = '' + (d.getMonth() + 1)
    day = '' + d.getDate(),
    year = d.getFullYear()
   	
    if (month.length < 2) 
        month = '0' + month
    if (day.length < 2) 
        day = '0' + day
   
    return [year, month, day].join('-')
}

function formatTime(dateTime) {
	var d = new Date(dateTime)
	hour = '' + d.getHours()
   	minute = '' + d.getMinutes()
   	second = '' + d.getSeconds()

 	if (hour.length < 2)
    	hour = '0' + hour
   	if (minute.length < 2)
   		minute = '0' + minute
   	if (second.length < 2)
   		second = '0' + second

   	return [hour, minute, second].join(':')
}

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

// Fetch all customers
function getCustomers(targetDiv, name='all') {
	const url = '/get-customers/'
	$.get(url, {name: name}).done(function(data) {
		targetDiv.empty().html(data)
		
		actionDiv($('#customer-category-action'), $('#customer-container'), 'category-id')
	})
}

// Add customers
function addCustomer() {
	const url = '/add-new-customer/'
	let modal = $('#newCustomerModal')
	let name = $(modal.find('#name'))
	let category = $(modal.find('#category'))
	$.post(url, 
		{ 	
			category: category.val(),
			name: name.val(), 
			csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
		}
	).done(function(data) {
		modal.modal('hide')
		getCustomers($('#customer-list'))
	})
}

// Fetch all transaction
function getTransactions(targetDiv, date=Date.now(), url='/get-transactions/', dataJson={date: formatDate(date)}) {
	$.get(url, dataJson).done(function(data) {
		targetDiv.empty().html(data)

		actionDiv($('#transaction-type-action'), $('#transaction-container'), 'transaction-type')
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
			getTransactions($('#transaction-list'))
			console.log(data)
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
		getTransactions($('#transaction-list'))
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
		getTransactions($('#transaction-list'))
		console.log(data)
	})
}

function actionDiv(actionContainer, container, categoryData) {
	actionContainer.click(function(e) {
			if ($(e.target).data(categoryData) && !($(e.target).hasClass('active'))) {

				$(container.children()).each(function(index, value){
					if ($(e.target).data(categoryData) == $(value).data('category')) {
						$(value).css('display', 'block')
					} else {
						$(value).css('display', 'none')
					}

					if ($(e.target).data(categoryData) == 'all') {
						$(value).css('display', 'block')
					}
				})

				$($(this).children()).each(function(index, value) {
					$(value).removeClass('active')	
				})
				$(e.target).addClass('active')
			}
		})
}


