$(document).ready(function() {
	$('#nav-btn').click(function() {
		let id_target = $(this).attr('data-target')
		if (($(id_target).css('display')) == 'block') {
			$(id_target).slideUp()
		} else {
			$(id_target).slideDown()

		}

		// $(id_target).slideUp()
	})

	$('#search-name-input').keyup(function() {
		search($(this).val())
	})

	$('#search-name-input').focusin(function() {
		searchMoveToTop()
	})

	function searchMoveToTop() {
		$($('#search-name-input').parent()).toggleClass('py-2')
		elements = $('#search-name-input').parent().find('a')
		$('.navbar').toggleClass('d-none')
		for(i=0; i < elements.length; i++) {
			$(elements[i]).toggleClass('d-inline-block')
			$(elements[i]).toggleClass('d-none')
		}
	}
})