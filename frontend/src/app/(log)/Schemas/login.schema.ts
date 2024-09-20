import {object, string} from 'yup'

export const loginSchema = object({
	email: string()
		.trim()
		.email('В поле "Электронная почта" указана не электронная почта')
		.required('Электронная почта не введена'),
	password: string()
		.required('Пароль не введён')
		.trim()
		.min(3, 'Пароль должен содержать хотя бы 3 символа'),
})
