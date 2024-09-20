'use client'
import type {useRegisterationConfirmMutation} from '@/Rtk'
import Forma from '@/app/Components/Form/Form'
import {FormEvent, Fragment, useEffect, useRef, useState, KeyboardEvent} from 'react'
import styles from './CodeForm.module.css'
import Button from '@/app/Components/Button/Button'
import CodeInput from '../../../Components/CodeInput/CodeInput'

export default function CodeForm({
	sendCode,
	isLoading,
}: {
	sendCode: ReturnType<typeof useRegisterationConfirmMutation>[0]
	isLoading: boolean
}) {
	const [inputsCode, setInputsCode] = useState<React.JSX.Element[]>(new Array(6).fill(<></>))
	const [onInput, setOnInput] = useState<number>(0)
	const inputsRefArray = useRef<(HTMLInputElement | null)[]>([])
	useEffect(() => {
		constructInputs(onInput)
		inputsRefArray.current[onInput]?.focus()
	}, [onInput])

	const constructInputs = (currentInput: number) => {
		setInputsCode(
			inputsCode.map((_, idx) => (
				<CodeInput
					key={idx}
					className={styles.code}
					role="cell"
					aria-colindex={idx + 1}
					disabled={isLoading}
					ref={element => {
						inputsRefArray.current[idx] = element
					}}
					onKeyDown={event => onKeyDown(event)}
					onClick={() => setOnInput(idx)}
					tabIndex={currentInput == idx ? 0 : -1}
				/>
			)),
		)
	}

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		switch (event.code) {
			case 'Backspace':
			case 'ArrowDown':
			case 'ArrowLeft': {
				return setOnInput(onInput > 0 ? onInput - 1 : 0)
			}
			case 'ArrowUp':
			case 'ArrowRight': {
				return setOnInput(onInput < 6 ? onInput + 1 : 5)
			}
			case 'Delete': {
				if (inputsRefArray.current[onInput + 1]?.value) {
					return setOnInput(onInput < 6 ? onInput + 1 : 5)
				}
				break
			}
			default: {
				return setOnInput(onInput < 6 ? onInput + 1 : 5)
			}
		}
	}

	const onSubmit = (event?: FormEvent<HTMLFormElement>) => {
		if (event) event.preventDefault()
		const code = inputsRefArray.current
			.map(input => input?.value ?? '0')
			.reduce((prev, curr) => prev + curr, '')
		sendCode({code})
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
					<Fragment key={idx}>{v}</Fragment>
				))}
				<Button gridArea="g" role="row">
					Отправить код регистрации
				</Button>
			</Forma>
		</>
	)
}
