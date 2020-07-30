$(document).ready(function() {
	$('#byName').click(function(e) {
		hideDropDiv(e)
		$('#dropdownSort').text('Sorted By Name')
	})

	$('#byUnpaid').click(function(e) {
		hideDropDiv(e)
		$('#dropdownSort').text('Sorted By Unpaid')
		sortByUnpaid($('tbody'))
	})

	$('#hideZero').click(function(e) {
		hideDropDiv(e)
		$('#dropdownSort').text('Hide Zeroes ')
		hideZero($('tbody'))
	})
})


function hideDropDiv(e) {
	let parent = $($(e.target).parent())
	let options = $($(e.target).parent()).find('.dropdown-menu')
	$(parent).toggleClass('show')
	$(options).toggleClass('show')
}

function sortByUnpaid(tbody) {

	function getVal(value) {
		let val = $($(value).find('#unpaidAmount')).text()
		return Number(val.replace(/,/g, ''))
	}

	$(tbody).find('tr').each(function(key, value) {
		console.log(getVal(value))
	})
}

function hideZero(tbody) {
	$($(tbody.find('tr'))).find('#unpaidAmount').each(function(key, value) {
		if ($(value).text() == '0') {
			$($(value).parent()).toggleClass('d-none')
		}
	})
}


