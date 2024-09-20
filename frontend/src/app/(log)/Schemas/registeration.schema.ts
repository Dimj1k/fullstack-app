import {date, mixed, object, ref, string} from 'yup'
import {Gender} from '@/Rtk'

export const registerationSchema = object({
	email: string()
		.trim()
		.email('В поле "Электронная почта" указана не электронная почта')
		.required('Электронная почта не введена'),
	password: string()
		.required('Пароль не введён')
		.trim()
		.min(3, 'Пароль должен содержать хотя бы 3 символа'),
	passwordConfirm: string()
		.trim()
		.required('Подтверждение пароля не введено')
		.oneOf([ref('password')], 'Пароли должны совпадать'),
	birthdayDate: date()
		.test({
			test: date => {
				if (!date) return true
				return date.getFullYear() > 1900
			},
			message: 'Год рождения должен быть больше 1900',
		})
		.max(new Date(), 'Введена неверная дата'),
	gender: mixed<Gender>().transform(Number).default(2).oneOf([0, 1, 2], 'Выбран неверный пол'),
})
