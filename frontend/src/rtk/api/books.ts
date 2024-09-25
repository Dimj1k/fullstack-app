import {notificationSlice, TypesNotification} from '../slices'
import {showErrorNotification} from '../utils'
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
					const {data} = await queryFulfilled
					dispatch(
						showNotification({
							messages: 'Вы добавили новую книгу',
							typeNotification: TypesNotification.SUCCESS,
						}),
					)
				} catch (e) {
					showErrorNotification(e, dispatch)
				}
			},
		}),
	}),
	overrideExisting: 'throw',
})

export const {useCreateBookMutation} = booksApi
