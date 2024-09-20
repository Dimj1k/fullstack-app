'use client'
import {FormEvent, HTMLProps, useReducer} from 'react'
import {Input} from '../../Components/Input/Input'
import {loginReducer, TypeActions} from '../Reducers'

const initialState = {email: '', password: '', isValid: {email: true, password: true}}

export default function EmailAndPasswordInputs({
	gridArea,
	withoutEmail,
	withoutPassword,
	validating,
	...props
}: {
	gridArea?: {forEmail?: string; forPassword?: string}
	withoutEmail?: boolean
	withoutPassword?: boolean
	validating?: boolean
} & HTMLProps<HTMLInputElement>) {
	const [{email, password, isValid}, validatorDispatch] = useReducer(loginReducer, initialState)
	const validator = (event: FormEvent<HTMLInputElement>, type: TypeActions) => {
		const target = event.target as EventTarget & {value: string; name: string}
		validatorDispatch({type, payload: {[target.name]: target.value}})
	}
	if (validating)
		return (
			<>
				{withoutEmail || (
					<Input
						name="email"
						placeholder="Электронная почта"
						type="text"
						gridArea={gridArea?.forEmail}
						value={email as string}
						onChange={event => validator(event, TypeActions.onChangeEmail)}
						valid={isValid.email ? 1 : 0}
						{...props}
					/>
				)}
				{withoutPassword || (
					<Input
						name="password"
						type="password"
						placeholder="Пароль"
						gridArea={gridArea?.forPassword}
						value={password as string}
						onChange={event => validator(event, TypeActions.onChangePassword)}
						valid={isValid.password ? 1 : 0}
						{...props}
					/>
				)}
			</>
		)
	else
		return (
			<>
				{withoutEmail || (
					<Input
						name="email"
						placeholder="Электронная почта"
						type="text"
						gridArea={gridArea?.forEmail}
						{...props}
					/>
				)}
				{withoutPassword || (
					<Input
						name="password"
						type="password"
						placeholder="Пароль"
						gridArea={gridArea?.forPassword}
						{...props}
					/>
				)}
			</>
		)
}
