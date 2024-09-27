'use client'

import {FormEvent, useMemo, useRef} from 'react'
import Forma from '../../Components/Form/Form'
import {Input} from '../../Components/Input/Input'
import Button from '../../Components/Button/Button'
import {createNewBookSchema} from './Schemas'
import {useNotification} from '@/Hooks'
import {ValidationError} from 'yup'
import {TypesNotification, useCreateBookMutation} from '@/Rtk'
import {ArrayInput, ImageInput, TextAreaInput} from '../../Components/Input'

const keys = [1, -1]

export default function CreateNewBook() {
	const [sendNewBook, {isSuccess, isError, requestId}] = useCreateBookMutation()
	const showNotification = useNotification()
	const formRef = useRef<HTMLFormElement>(null)

	if (isSuccess) {
		formRef.current?.reset()
	}

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.target as EventTarget & HTMLFormElement)
		const validateFormData = Object.fromEntries(formData)
		createNewBookSchema
			.validate(validateFormData, {abortEarly: false})
			.then(() => sendNewBook(formData))
			.catch((err: ValidationError) =>
				showNotification({typeNotification: TypesNotification.WARNING, messages: err.errors}),
			)
	}

	return (
		<div>
			<h1>Размещение новой книги</h1>
			<Forma onSubmit={onSubmit} ref={formRef} gridTemplateAreas={`"a""b""c"`}>
				<Input name="nameBook" type="text" placeholder="Название книги" />
				<TextAreaInput
					name="description"
					maxLength={500}
					placeholder="Описание книги"
					spellCheck="true"
				/>
				<ArrayInput add="Жанр" maxLength={6} key={isSuccess ? ++keys[0] : keys[0]} name="genres" />
				<ImageInput name="image" key={isSuccess ? --keys[1] : keys[1]} />
				<Button>Разместить новую книгу</Button>
			</Forma>
		</div>
	)
}
