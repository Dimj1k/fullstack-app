'use client'
import {TypesNotification, useAppSelector, useLoginMutation} from '@/Rtk'
import {FormEvent, useEffect} from 'react'
import type {ValidationError} from 'yup'
import {TargetType} from '@/Interfaces'
import Forma from '@/app/Components/Form/Form'
import Button from '@/app/Components/Button/Button'
import {useNotification} from '@/Hooks'
import Link from '@/app/Components/Link/Link'
import {useRouter} from 'next/navigation'
import EmailAndPasswordInputs from '../../Сomponents/EmailAndPasswordInputs'
import {loginSchema} from '../../Schemas'

export default function Form() {
	const showNotification = useNotification()
	const [sendLogin, {isLoading}] = useLoginMutation()
	const router = useRouter()
	const userId = useAppSelector(state => state.jwt.userId)
	useEffect(() => {
		if (userId) router.replace(`/profile/${userId}`)
	}, [userId, router])
	const login = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const {email, password} = event.target as TargetType<typeof loginSchema>
		const form = {email: email.value, password: password.value}
		loginSchema
			.validate(form, {abortEarly: false})
			.then(v =>
				sendLogin(v).then(res => {
					if (!res.error) {
						router.replace('/profile/' + res.data.userId)
					}
				}),
			)
			.catch((err: ValidationError) =>
				showNotification({
					typeNotification: TypesNotification.WARNING,
					messages: err.errors,
				}),
			)
	}
	return (
		<div>
			<Forma onSubmit={login} gridTemplateAreas={`"a""b""c"`}>
				<EmailAndPasswordInputs gridArea={{forEmail: 'a', forPassword: 'b'}} />
				<Button gridArea="c" disabled={isLoading}>
					Войти
				</Button>
			</Forma>
			<p style={{textAlign: 'center', marginTop: '10px'}}>Нет аккаунта?</p>
			<Link href="/registeration" style={{textAlign: 'center', fontSize: '16px'}}>
				Регистрация
			</Link>
		</div>
	)
}
