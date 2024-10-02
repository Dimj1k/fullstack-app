import {PickType} from '@/Interfaces'
import {Book, BookWithDescription, ParamsFindBooks} from '../interfaces'
import {notificationSlice, TypesNotification} from '../slices'
import {baseApi} from './base'

export const booksApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		createBook: builder.mutation<unknown, FormData>({
			query: formData => ({
				url: 'books/create',
				body: formData,
				// headers: {'Content-Type': 'multipart/form-data'},
				method: 'POST',
			}),
			invalidatesTags: [{type: 'books', id: 'NEW_BOOK'}],
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				const showNotification = notificationSlice.actions.show
				try {
					await queryFulfilled
					dispatch(
						showNotification({
							messages: 'Вы добавили новую книгу',
							typeNotification: TypesNotification.SUCCESS,
						}),
					)
				} catch {}
			},
		}),
		findBooks: builder.query<Book[], ParamsFindBooks>({
			query: params => ({url: 'books/find-all', params}),
			providesTags: result =>
				result
					? [
							...result.map(book => ({type: 'books' as const, id: book.book_id})),
							{type: 'books', id: 'NEW_BOOK'},
						]
					: [{type: 'books', id: 'NEW_BOOK'}],
			keepUnusedDataFor: 60,
			transformResponse(baseQueryReturnValue: Book<'arr'>[]) {
				return baseQueryReturnValue.map(({genres, ...book}) => ({
					...book,
					genres: genres.join(','),
				}))
			},
		}),
		findBook: builder.query<BookWithDescription, PickType<Book, 'name_book'>>({
			query: name_book => ({url: `books/get-one/${name_book}`}),
			providesTags(result) {
				return [{type: 'books', id: result?.book_id}]
			},
		}),
	}),
	overrideExisting: 'throw',
})

export const {useCreateBookMutation, useFindBooksQuery} = booksApi
