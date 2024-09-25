import {mixed, object, string} from 'yup'
import {isFile} from '@/Utils/is-file'

export const createNewBookSchema = object({
	nameBook: string().trim().max(100).required('Введите название книги'),
	description: string().trim().required('Введите описание книги'),
	genres: string()
		.required('Жанры не заполнены')
		.test({
			test: genres => genres.split(',').every(genre => typeof genre == 'string' && !!genre.trim()),
			message: 'Жанры не заполнены',
		}),
	image: mixed<File>()
		.test({
			test: image => {
				if (!image) return true
				if (isFile(image))
					return ['image/gif', 'image/jpeg', 'image/png', 'image/webp'].includes(image.type)
			},
			message:
				'Поддеживаемые изоражения: ' +
				['image/gif', 'image/jpeg', 'image/png', 'image/webp'].join(' '),
		})
		.test({
			test: image => {
				if (!image) return true
				if (isFile(image)) return image.size < 25 << 20
			},
			message: 'Максимальный размер изображения должен составлять менее 25 мегабайт',
		}),
})
