const $phoneNumberForm = $('form#balance-replenishment-with-phone-number-form'),
      $phoneNumberInput = $phoneNumberForm .find('#form-phone-number'),
      $phoneNumberAmountInput = $phoneNumberForm.find('#phone-number-form-deposit-amount'),
      $accountNumberForm = $('form#balance-replenishment-with-account-number-form'),
      $accountNumberInput = $accountNumberForm.find('#form-account-number'),
      $accountNumberAmountInput = $accountNumberForm.find('#account-number-form-deposit-amount'),
      commissionIndex = 8,
      fixedCommissionIndex = 10

import {Validate} from './validate.js'

const validate = new Validate

$(function() {
	validate.inputInit($phoneNumberInput, {isNumberInputEmptyCallback : isInputEmpty})
	validate.inputInit($accountNumberInput, {isNumberInputEmptyCallback : isInputEmpty})
})

function isIntegerInput(event) {
	if (event.key.match(/\./)) return false
	return true
}

function amountToPay(event, callbackObject) {
	const target = event.target,
	      amountEntered = parseInt(target.value),
	      commission = amountEntered * commissionIndex / 100,
	      amountWithCommission = amountEntered + commission,
	      roundedAmountWithCommission = Math.ceil(amountWithCommission / 10) * 10,
	      paymentAmount = roundedAmountWithCommission + fixedCommissionIndex,
	      $paymentInput = $(target).closest('.balance-replenishment-data')
	                               .find('.balance-replenishment-payment .to-pay-amount-input')

	$paymentInput.val(paymentAmount)

	let isEmpty
	if (target.value.length === 0)
		callbackObject.isAmountInputEmptyCallback(target, isEmpty = true)
	else
		callbackObject.isAmountInputEmptyCallback(target, isEmpty = false)
}

function isInputEmpty(target, isEmpty) {
	if (isEmpty) target.classList.add('mute-error-alerts')
	else target.classList.remove('mute-error-alerts')
}

$phoneNumberAmountInput.add($accountNumberAmountInput).on({
	'keypress':isIntegerInput,
	'input': e => amountToPay(e, {
		isAmountInputEmptyCallback : isInputEmpty
	})
})

$phoneNumberAmountInput.add($accountNumberAmountInput).trigger('input')

$phoneNumberForm.add($accountNumberForm).on('submit', function(event) {
	$(this).addClass('form-loading cancel-mute-error-alerts')
	event.preventDefault()
	event.stopPropagation()

	if (!$(this)[0].checkValidity()) {
		$(this).removeClass('form-loading').addClass('was-validated')
		return
	}

	const url = $(this).attr('action'),
	      type = $(this).attr('method'),
	      successMessage = $('.success-message'),
	      $form = $(this)

	$.ajax({
		url: url,
		type: type,
		dataType: "json",
		processData: false,
		success: function(response) {
			if (response.status === 'success') {
				successMessage.removeClass('d-none')
			}
		},
		error: function(response) {
			$form.removeClass('form-loading')
		}
	})
	return false
})