import {cleanup, render, RenderResult} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {CodeInput} from '../src/app/Components/CodeInput/CodeInput'

let codeInput: RenderResult
let inputs: HTMLElement[]
beforeEach(() => {
	codeInput = render(<CodeInput length={6} />)
	inputs = codeInput.getAllByTestId('code')
})

afterEach(cleanup)
test('Снимок CodeInput', () => {
	expect(codeInput).toMatchSnapshot('length 6')
})

describe('Ввод кода в CodeInput', () => {
	test('Ввод цифр, проверка фокуса', async () => {
		const validCode = '123421'
		expect(inputs.length).toBe(6)
		let onInput = 0
		inputs[onInput].focus()
		for (const char of validCode) {
			await userEvent.type(inputs[onInput], char)
			if (onInput < inputs.length - 1) {
				expect(inputs[++onInput]).toHaveFocus()
			}
		}
	})
	test('Ввод цифр в ячейки', async () => {
		const validCode = '123421'
		await userEvent.type(inputs[0], validCode)
		inputs.forEach((input, idx) => expect(input).toHaveValue(validCode[idx]))
	})
	test('Ввод более 6 цифр', async () => {
		const type = '123456789'
		await userEvent.type(inputs[0], type)
		inputs.forEach((input, idx) => {
			if (idx != 5) {
				expect(input).toHaveValue(type[idx])
			} else {
				expect(input).toHaveValue(type.at(-1))
			}
		})
		expect(inputs.at(-1)).toHaveFocus()
	})
	test('Ввод не цифр и цифр в ячейки', async () => {
		const input = '5a6b4mdhqkjc3l0hdan1'
		await userEvent.type(inputs[0], input)
		let onInput = 0
		for (const i of input) {
			if (!isNaN(+i)) {
				expect(inputs[onInput++]).toHaveValue(i)
			}
		}
		expect(onInput).toBe(input.match(/\d/g)?.length)
	})
})

describe('Вставка кода в CodeInput', () => {
	beforeEach(async () => {
		inputs[0].focus()
	})
	test('Вставка кода 6 цифр', async () => {
		const clipboardData = '669821'
		await userEvent.paste(clipboardData)
		expect(inputs[0]).not.toHaveValue(clipboardData)
		inputs.forEach((input, idx) => expect(input).toHaveValue(clipboardData[idx]))
		expect(inputs.at(-1)).toHaveFocus()
	})
	test('Вставка кода менее чем 6 цифр', async () => {
		const clipboardData = '123'
		await userEvent.paste(clipboardData)
		let onInput = 0
		for (const i of clipboardData) {
			expect(inputs[onInput++]).toHaveValue(i)
		}
		expect(inputs[clipboardData.length]).toHaveFocus()
		for (; onInput != inputs.length; onInput++) {
			expect(inputs[onInput]).toHaveValue('')
		}
	})
	test('Вставка кода более чем 6 цифр', async () => {
		const clipboardData = '1234567890'
		await userEvent.paste(clipboardData)
		inputs.forEach((input, idx) => expect(input).toHaveValue(clipboardData[idx]))
		expect(inputs.at(-1)).toHaveFocus()
	})
	test('Вставка кода 2 цифр и 3 цифр', async () => {
		const clipboardDatas = ['12', '345']
		let idx = 0
		for (const clipboardData of clipboardDatas) {
			await userEvent.paste(clipboardData)
			idx += clipboardData.length
			expect(inputs[idx]).toHaveFocus()
		}
		for (let i = 0; i != 5; i++) {
			expect(inputs[i]).toHaveValue(clipboardDatas.join('')[i])
		}
		expect(inputs.at(-1)).toHaveValue('')
	})
	test('Вставка не цифр', async () => {
		const clipboardData = 'dhuihqlwjneq.ljdicxlhfulkhy'
		await userEvent.paste(clipboardData)
		inputs.forEach(input => expect(input).toHaveValue(''))
		expect(inputs[0]).toHaveFocus()
	})
	test('Вставка кода с цифрами и не с цифрами', async () => {
		const clipboardData = '67sahds7723hhy7968sak351a'
		await userEvent.paste(clipboardData)
		let onInput = 0
		for (const i of clipboardData) {
			if (onInput >= 6) {
				break
			}
			if (!isNaN(+i)) {
				expect(inputs[onInput++]).toHaveValue(i)
			}
		}
		const length = clipboardData.match(/\d/g)?.length
		expect(onInput).toBe(length && length > 6 ? 6 : length)
	})
})

describe('Перемещение по CodeInput', () => {
	test('ЛКМ по случайным ячейкам', async () => {
		const clickOn = [1, 3, 2]
		for (const on of clickOn) {
			await userEvent.click(inputs[on])
			expect(inputs[on]).toHaveFocus()
			expect(inputs[on].tabIndex).toBe(0)
			inputs.forEach((_, idx) => {
				if (idx !== on) expect(inputs[idx].tabIndex).toBe(-1)
			})
		}
	})
	test('Табуляция', async () => {
		await userEvent.click(inputs[0])
		await userEvent.tab()
		expect(inputs[0].tabIndex).toBe(0)
		inputs.forEach((input, idx) => {
			if (idx !== 0) expect(input.tabIndex).not.toBe(0)
		})
	})
	test('Клавиши передвижения', async () => {
		inputs[0].focus()
		await userEvent.keyboard('{ArrowRight}')
		expect(inputs[1].tabIndex).toBe(0)
		expect(inputs[0].tabIndex).toBe(-1)
		expect(inputs[1]).toHaveFocus()
		expect(inputs[0]).not.toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}')
		expect(inputs[1].tabIndex).toBe(-1)
		expect(inputs[0].tabIndex).toBe(0)
		expect(inputs[1]).not.toHaveFocus()
		expect(inputs[0]).toHaveFocus()
		await userEvent.keyboard('{ArrowRight}'.repeat(2))
		expect(inputs[2].tabIndex).toBe(0)
		expect(inputs[1].tabIndex).toBe(-1)
		expect(inputs[2]).toHaveFocus()
		expect(inputs[1]).not.toHaveFocus()
	})
	test('Стирание кода', async () => {
		inputs[0].focus()
		const type = '123'
		await userEvent.type(inputs[0], type)
		await userEvent.keyboard('{ArrowLeft}')
		expect(inputs[2].tabIndex).toBe(0)
		expect(inputs[2]).toHaveValue(type[2])
		await userEvent.keyboard('{Backspace}')
		expect(inputs[1].tabIndex).toBe(0)
		expect(inputs[2]).toHaveValue('')
		expect(inputs[1]).toHaveValue(type[1])
	})
})
