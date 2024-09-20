'use client'
import {FormEvent, useState} from 'react'
import Forma from '@/app/Components/Form/Form'
import EmailAndPasswordInputs from '../../Сomponents/EmailAndPasswordInputs'
import PasswordRepeatInputs from '../../Сomponents/PasswordRepeatInputs'
import {Input} from '@/app/Components/Input/Input'
import Button from '@/app/Components/Button/Button'
import {registerationSchema} from '../../Schemas'
import {Asserts, ValidationError} from 'yup'
import {useNotification} from '@/Hooks'
import {TypesNotification} from '@/Rtk'
import type {useRegisterationMutation} from '@/Rtk'

export default function RegistrationForm({
	sendRegisteration,
	isLoading,
}: {
	sendRegisteration: ReturnType<typeof useRegisterationMutation>[0]
	isLoading: boolean
}) {
	const showNotification = useNotification()
	const [gender, setGender] = useState(2)
	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const form = Object.fromEntries(formData) as unknown as Asserts<typeof registerationSchema>
		form.birthdayDate ||= undefined
		registerationSchema
			.validate(form, {abortEarly: false})
			.then(form => {
				sendRegisteration(form)
				showNotification({
					typeNotification: TypesNotification.MESSAGE,
					messages: 'Скоро вы получите код для регистрации',
				})
			})
			.catch((err: ValidationError) =>
				showNotification({typeNotification: TypesNotification.WARNING, messages: err.errors}),
			)
	}
	const genderOnChange = (event: FormEvent<HTMLInputElement>) => {
		const {value} = event.target as EventTarget & {value: string}
		const gender = +value
		setGender(gender > 2 ? 2 : gender < 0 ? 0 : gender)
	}
	return (
		<Forma gridTemplateAreas={`"a d""b e""c .""f f"`} onSubmit={onSubmit} role="grid">
			<EmailAndPasswordInputs
				gridArea={{forEmail: 'a'}}
				withoutPassword={true}
				validating={true}
				disabled={isLoading}
			/>
			<PasswordRepeatInputs
				gridArea={{forPassword: 'b', forPasswordConfirm: 'c'}}
				disabled={isLoading}
			/>
			<Input
				type="date"
				name="birthdayDate"
				prepend="Дата рождения"
				gridArea="d"
				disabled={isLoading}
			/>
			<Input
				type="number"
				name="gender"
				placeholder="Пол"
				gridArea="e"
				onChange={genderOnChange}
				value={gender}
				valid={gender <= 2 && gender >= 0 ? 1 : 0}
				disabled={isLoading}
			/>
			<Button gridArea="f">Получить код регистрации</Button>
		</Forma>
	)
}
