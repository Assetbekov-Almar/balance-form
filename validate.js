export class Validate {

	isNumberKey(event) {
		if (event.key.match(/^[0-9]+$/)) return true
		return false
	}

	escapeRegExp(string) {
		return string.replace(/[.*+\-?^${}()/:<>=|[\]\\]/g, '\\$&')
	}

	inputInit($inputToValidate, callbackObject = {}) {
		if (
			$inputToValidate.length !== 1 &&
			$inputToValidate.prop('validity').valid
		) throw new Error('input is not validated')
		$inputToValidate.on({
			'keypress':  this.isNumberKey,
			'input': e => this.formatToNumber(e, callbackObject)
		})

		this.generatePatternAttribute($inputToValidate)
		$inputToValidate.trigger('input')
	}

	formStringOfNumbers(inputValueArray, shapingPattern) {
		let lastDigitIndex
		inputValueArray.forEach(value => {
			shapingPattern = shapingPattern.replace('.', (match, index) => {
				lastDigitIndex = index
				return value
			})
		})
		return shapingPattern.substring(0, lastDigitIndex + 1)
	}

	formatToNumber(event, callbackObject) {
		const target = event.target,
		      inputValue = target.value.replace(/\D/g,''),
		      inputValueArray = Array.from(inputValue),
		      beginningValueArray = Array.from(target.getAttribute('data-begin-value'))
		let shapingPattern = target.getAttribute('data-shaping-pattern'),
		    isEmpty
		if (inputValueArray.length === 0)
			beginningValueArray.forEach(value => inputValueArray.push(value))

		target.value = this.formStringOfNumbers(inputValueArray, shapingPattern)

		if (callbackObject.hasOwnProperty('isNumberInputEmptyCallback')) {

			if (target.value.length < 1 ||
				(inputValueArray.toString() === beginningValueArray.slice(0, inputValueArray.length).toString() &&
				inputValueArray.length <= beginningValueArray.length)
			)
				callbackObject.isNumberInputEmptyCallback(target, isEmpty = true)
			else
				callbackObject.isNumberInputEmptyCallback(target, isEmpty = false)
		}
	}

	generatePatternAttribute($inputToValidate) {
		const shapingPattern = $inputToValidate.attr('data-shaping-pattern'),
		      beginningValueArray = Array.from($inputToValidate.attr('data-begin-value')),
		      patternMinLength = $inputToValidate.attr('data-min-length')
		let pattern = this.formStringOfNumbers(beginningValueArray, shapingPattern),
		    beginningPatternLength = pattern.length
		pattern = this.escapeRegExp(pattern)
		if (patternMinLength) {
			const remainedPatternMinLength = patternMinLength - beginningPatternLength
			pattern += '.{' + remainedPatternMinLength + ',' + shapingPattern.length + '}'
		}
		else {
			const remainedPatternLength = shapingPattern.length - beginningPatternLength
			pattern += '.{' +  remainedPatternLength + '}'
		}
		$inputToValidate.attr('pattern', pattern)
	}
}
