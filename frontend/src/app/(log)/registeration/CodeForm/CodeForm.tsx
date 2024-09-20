'use client'
import {TypesNotification, type useRegisterationConfirmMutation} from '@/Rtk'
import Forma from '@/app/Components/Form/Form'
import {
	FormEvent,
	Fragment,
	useEffect,
	useRef,
	useState,
	KeyboardEvent,
	HTMLProps,
	ClipboardEvent,
} from 'react'
import styles from './CodeForm.module.css'
import Button from '@/app/Components/Button/Button'
import {useNotification} from '@/Hooks'

export default function CodeForm({
	sendCode,
	isLoading,
	length,
	...props
}: {
	sendCode: ReturnType<typeof useRegisterationConfirmMutation>[0]
	isLoading: boolean
	length?: number
} & HTMLProps<HTMLInputElement>) {
	length ??= 6
	const maxIdx = length - 1
	const [inputsCode, setInputsCode] = useState<React.JSX.Element[]>(new Array(length).fill(<></>))
	const [onInput, setOnInput] = useState<number>(0)
	const [codeValues, setCodeValues] = useState<Record<number, string>>({
		...new Array(length).fill(''),
	})
	const showNotification = useNotification()
	const inputsRefArray = useRef<(HTMLInputElement | null)[]>([])
	useEffect(() => {
		constructInputs(onInput)
		inputsRefArray.current[onInput]?.focus()
		inputsRefArray.current[onInput]?.select()
	}, [onInput, isLoading, codeValues])

	const constructInputs = (currentInput: number) => {
		setInputsCode(
			inputsCode.map((_, idx) => (
				<input
					key={`code-${idx}`}
					className={styles.code}
					{...props}
					role="cell"
					aria-colindex={idx + 1}
					disabled={isLoading}
					ref={element => {
						inputsRefArray.current[idx] = element
					}}
					value={codeValues[idx]}
					onPaste={onPaste}
					onKeyUp={onKeyUp}
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
		onSubmit(undefined, code.join(''))
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

	const onSubmit = (event?: FormEvent<HTMLFormElement>, pastedCode?: string) => {
		if (event) event.preventDefault()
		if (pastedCode) {
			if (pastedCode.length == length) sendCode({code: pastedCode})
			return
		}
		const code = inputsRefArray.current
			.map(input => input?.value ?? '0')
			.reduce((prev, curr) => prev + curr, '')
		if (code.length == length) sendCode({code})
		else
			showNotification({
				typeNotification: TypesNotification.WARNING,
				messages: 'Вы ввели не шестизначный код',
			})
	}
	return (
		<>
			<h1>Введите полученный шестизначный код регистрации</h1>
			<Forma
				gridTemplateAreas={`"a b c d e f""g g g g g g"`}
				aria-colcount={inputsCode.length}
				role="grid"
				onSubmit={onSubmit}>
				{inputsCode.map((v, idx) => (
					<Fragment key={`code-${idx}`}>{v}</Fragment>
				))}
				<Button gridArea="g" role="row" disabled={isLoading}>
					Отправить код регистрации
				</Button>
			</Forma>
		</>
	)
}
