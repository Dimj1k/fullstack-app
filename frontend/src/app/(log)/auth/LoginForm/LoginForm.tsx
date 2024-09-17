'use client'
import {TypesNotification, useLoginMutation} from '@/rtk'
import loginSchema from './login.schema'
import {FormEvent, useReducer} from 'react'
import type {ValidationError} from 'yup'
import {TargetType} from '@/interfaces'
import loginReducer, {TypeActions} from './login.reducer'
import Forma from '@/app/Components/Form/Form'
import Button from '@/app/Components/Button/Button'
import {Input} from '@/app/Components/Input/Input'
import {useNotification} from '@/hooks/use-notification'
import Link from '@/app/Components/Link/Link'

const initialState = {email: '', password: '', isValid: {email: true, password: true}}

export default function Form() {
	const [sendLogin, {isLoading}] = useLoginMutation()
	const [{email, password, isValid}, validatorDispatch] = useReducer(loginReducer, initialState)
	const [notification, dispatchNotification] = useNotification()
	const login = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const {email, password} = event.target as TargetType<typeof loginSchema>
		const form = {email: email.value, password: password.value}
		loginSchema
			.validate(form, {abortEarly: false})
			.then(v => sendLogin(v))
			.catch((err: ValidationError) =>
				dispatchNotification.show({
					typeNotification: TypesNotification.WARNING,
					messages: err.errors,
				}),
			)
	}
	const validator = (event: FormEvent<HTMLInputElement>, type: TypeActions) => {
		const target = event.target as EventTarget & {value: string; name: string}
		validatorDispatch({type, payload: {[target.name]: target.value}})
	}
	return (
		<div>
			<Forma onSubmit={login} gridTemplateAreas={`"a""b""c"`}>
				{notification}
				<Input
					name="email"
					placeholder="Электронная почта"
					type="text"
					gridArea="a"
					value={email as string}
					onChange={event => validator(event, TypeActions.onChangeEmail)}
					valid={isValid.email ? 1 : 0}
				/>
				<Input
					name="password"
					type="password"
					placeholder="Пароль"
					gridArea="b"
					value={password as string}
					onChange={event => validator(event, TypeActions.onChangePassword)}
					valid={isValid.password ? 1 : 0}
				/>
				<Button gridArea="c" disabled={isLoading}>
					Войти
				</Button>
			</Forma>
			<p style={{textAlign: 'center', marginTop: '10px'}}>Не имеете аккаунта?</p>
			<Link href="/registeration" style={{textAlign: 'center', fontSize: '16px'}}>
				Регистрация
			</Link>
		</div>
	)
}
