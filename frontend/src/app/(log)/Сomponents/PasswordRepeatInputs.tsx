'use client'
import {FormEvent, HTMLProps, useState} from 'react'
import {Input} from '../../Components/Input/Input'

interface State {
	password: string
	passwordConfirm: string
	isValid: boolean
}

export default function PasswordRepeatInputs({
	gridArea,
	...props
}: {
	gridArea?: {forPassword: string; forPasswordConfirm: string}
} & HTMLProps<HTMLInputElement>) {
	const [{password, passwordConfirm, isValid}, setPasswords] = useState<State>({
		password: '',
		passwordConfirm: '',
		isValid: true,
	})
	const onChange = (event: FormEvent<HTMLInputElement>, type: keyof Omit<State, 'isValid'>) => {
		const {value} = event.target as EventTarget & {value: string}
		switch (type) {
			case 'password':
				return setPasswords({
					passwordConfirm,
					password: value,
					isValid: (value == passwordConfirm && value.length > 2) || !value,
				})
			case 'passwordConfirm':
				return setPasswords({
					password,
					passwordConfirm: value,
					isValid: (value == password && value.length > 2) || !value,
				})
			default:
				throw new Error(
					'Обнаружен неизвестный тип действия: ' +
						(type satisfies never) +
						' в компоненте PasswordRepeatInputs',
				)
		}
	}
	return (
		<>
			<Input
				gridArea={gridArea?.forPassword}
				name="password"
				type="password"
				onChange={event => onChange(event, 'password')}
				value={password}
				valid={isValid ? 1 : 0}
				placeholder="Пароль"
				{...props}
			/>
			<Input
				gridArea={gridArea?.forPasswordConfirm}
				name="passwordConfirm"
				type="password"
				onChange={event => onChange(event, 'passwordConfirm')}
				value={passwordConfirm}
				valid={isValid ? 1 : 0}
				placeholder="Подтверждение пароля"
				{...props}
			/>
		</>
	)
}
