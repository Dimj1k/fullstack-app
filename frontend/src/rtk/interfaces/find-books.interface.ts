import {UUID} from 'crypto'

export type ParamsFindBooks = {
	skip?: number
	take?: number
	genres?: string[]
}

export interface Book<T extends 'arr' | 'str' = 'str'> {
	name_book: string
	book_id: UUID
	created_at: string
	likes: string
	genres: T extends 'arr' ? string[] : string
	image: string | null
}

export interface BookWithDescription extends Book<'arr'> {
	description: string
}
