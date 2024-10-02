import {
	FormEvent,
	Fragment,
	HTMLProps,
	useEffect,
	useRef,
	useState,
	KeyboardEvent,
	ClipboardEvent,
	memo,
} from 'react'
import styles from './CodeInput.module.css'

export const CodeInput = memo(function CodeInput({
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
	const [inputsCode, setInputsCode] = useState<React.JSX.Element[]>(new Array(length).fill(<></>))
	const [onInput, setOnInput] = useState<number>(0)
	const [codeValues, setCodeValues] = useState<Record<number, string>>({
		...new Array(length).fill(''),
	})
	const inputsRefArray = useRef<(HTMLInputElement | null)[]>(new Array(length))
	useEffect(() => {
		constructInputs(onInput)
		inputsRefArray.current[onInput]?.focus()
		inputsRefArray.current[onInput]?.select()
	}, [onInput, isLoading, codeValues])

	const constructInputs = (currentInput: number) => {
		setInputsCode(
			inputsCode.map((_, idx) => (
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
					onClick={() => setOnInput(idx)}
					onChange={event => onChange(event, idx)}
					tabIndex={currentInput == idx ? 0 : -1}
				/>
			)),
		)
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
			setOnInput(idx < maxIdx ? idx + 1 : maxIdx)
		}
		if (!value) {
			setCodeValues(state => ({...state, [idx]: ''}))
			setOnInput(idx > 0 ? idx - 1 : 0)
		}
	}

	const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
		inputsRefArray.current[onInput]?.select()
		inputsRefArray.current[onInput]?.focus()
		switch (event.code) {
			case 'ArrowDown':
			case 'ArrowLeft': {
				return setOnInput(onInput > 0 ? onInput - 1 : 0)
			}
			case 'ArrowUp':
			case 'ArrowRight': {
				return setOnInput(onInput < maxIdx ? onInput + 1 : maxIdx)
			}
		}
	}
	return (
		<>
			{inputsCode.map((v, idx) => (
				<Fragment key={`code-${idx}`}>{v}</Fragment>
			))}
		</>
	)
})
