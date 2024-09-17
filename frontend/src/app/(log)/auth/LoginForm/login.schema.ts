import {object, string} from 'yup'

export default object({
	email: string()
		.trim()
		.email('В поле "Электронная почта" указана не электронная почта')
		.required('Электронная почта не введена'),
	password: string()
		.trim()
		.required('Пароль не введён')
		.min(3, 'Пароль должен содержать хотя бы 3 символа'),
})
