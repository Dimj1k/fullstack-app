import {PickType} from '@/Interfaces'
import {Book, BookWithDescription, ParamsFindBooks} from '../interfaces'
import {notificationSlice, TypesNotification} from '../slices'
import {baseApi} from './base'

export const booksApi = baseApi.enhanceEndpoints({addTagTypes: ['books']}).injectEndpoints({
	endpoints: builder => ({
		createBook: builder.mutation<unknown, FormData>({
			query: formData => ({
				url: 'books/create',
				body: formData,
				// headers: {'Content-Type': 'multipart/form-data'},
				method: 'POST',
			}),
			invalidatesTags: ['books'],
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
			providesTags: ['books'],
			keepUnusedDataFor: 5,
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
