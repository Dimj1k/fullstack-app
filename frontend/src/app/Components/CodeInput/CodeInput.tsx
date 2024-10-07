import {
	FormEvent,
	HTMLProps,
	useEffect,
	useRef,
	useState,
	KeyboardEvent,
	ClipboardEvent,
} from 'react'
import styles from './CodeInput.module.css'

export function CodeInput({
	length,
	isLoading,
	submit,
	...props
}: {
	length: number
	submit?: (event?: FormEvent<HTMLFormElement>, pastedCode?: string) => void
	isLoading?: boolean
} & HTMLProps<HTMLInputElement>) {
	const maxIdx = length - 1
	const [inputsCode, setInputsCode] = useState<number[]>(new Array(length).fill(-1))
	const idx = inputsCode.findIndex(v => v == 0)
	const onInput = idx == -1 ? 0 : idx
	const [codeValues, setCodeValues] = useState<Record<number, string>>({
		...new Array(length).fill(''),
	})
	const inputsRefArray = useRef<(HTMLInputElement | null)[]>(new Array(length))
	useEffect(() => {
		inputsRefArray.current[onInput]?.focus()
		inputsRefArray.current[onInput]?.select()
	}, [isLoading, codeValues, onInput])

	const constructInputs = (currentInput: number) => {
		setInputsCode(inputsCode.map((_, idx) => (idx == currentInput ? 0 : -1)))
	}

	const onPaste = (event: ClipboardEvent) => {
		event.preventDefault()
		const numbers = event.clipboardData.getData('text').trim().match(/\d/g)?.join('')
		if (!numbers) return
		const code = Array.from(numbers.slice(0, length - onInput))
		code.forEach((v, idx) => onChange({target: {value: v}}, idx + onInput))
		if (typeof submit == 'function') submit(undefined, code.join(''))
	}

	const onChange = (
		event: FormEvent<HTMLInputElement> | {target: {value: string}},
		idx: number,
	) => {
		const {value} = event.target as EventTarget & {value: string}
		if (!isNaN(+value) && value.length == 1) {
			setCodeValues(state => ({...state, [idx]: value}))
			constructInputs(idx < maxIdx ? idx + 1 : maxIdx)
		} else if (!value) {
			setCodeValues(state => ({...state, [idx]: ''}))
			constructInputs(idx > 0 ? idx - 1 : 0)
		}
	}

	const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
		inputsRefArray.current[onInput]?.select()
		inputsRefArray.current[onInput]?.focus()
		switch (event.code) {
			case 'ArrowDown':
			case 'ArrowLeft': {
				return constructInputs(onInput > 0 ? onInput - 1 : 0)
			}
			case 'ArrowUp':
			case 'ArrowRight': {
				return constructInputs(onInput < maxIdx ? onInput + 1 : maxIdx)
			}
		}
	}
	return (
		<>
			{inputsCode.map((tabIndex, idx) => (
				<input
					data-testid="code"
					key={`code-${idx}`}
					className={styles.code}
					{...props}
					disabled={isLoading}
					ref={element => {
						inputsRefArray.current[idx] = element
					}}
					value={codeValues[idx]}
					onPaste={onPaste}
					onKeyUp={onKeyUp}
					onKeyDown={event => {
						if (event.repeat) {
							onKeyUp(event)
						}
					}}
					onClick={() => constructInputs(idx)}
					onChange={event => onChange(event, idx)}
					tabIndex={tabIndex}
				/>
			))}
		</>
	)
}
