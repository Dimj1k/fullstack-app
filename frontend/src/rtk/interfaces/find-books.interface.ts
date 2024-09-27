import {UUID} from 'crypto'

export type ParamsFindBooks = {
	skip?: number
	take?: number
	genres?: string[]
}

export interface Book {
	name_book: string
	book_id: UUID
	created_at: string
	likes: number
	genres: string[]
	image: string
}

export interface BookWithDescription extends Book {
	description: string
}
