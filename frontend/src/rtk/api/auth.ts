import {IAuth, ILogin} from '../interfaces'
import {jwtSlice} from '../slices'
import {notificationSlice, TypesNotification} from '../slices/notification'
import {showErrorNotification} from '../utils'
import {baseApi} from './base'

export const authApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		login: builder.mutation<IAuth, ILogin>({
			query: body => ({url: 'auth/login', body, method: 'POST'}),
			transformResponse: (res: IAuth) => {
				return res
			},
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				const showNotification = notificationSlice.actions.show
				try {
					const {data} = await queryFulfilled
					// localStorage.setItem(JWT_REFRESH_TOKEN, data.refreshToken)
					dispatch(jwtSlice.actions.addJwt(data))
					dispatch(
						showNotification({
							messages: 'Вы успешно вошли!',
							typeNotification: TypesNotification.SUCCESS,
						}),
					)
				} catch (e) {
					showErrorNotification(e, dispatch)
				}
			},
			invalidatesTags: ['jwt'],
		}),
		refreshTokens: builder.mutation<IAuth, void>({
			query: () => ({url: 'auth/refresh-tokens', method: 'POST'}),
			transformResponse: (res: IAuth) => {
				return res
			},
			transformErrorResponse: err => {
				if (err.status === 'FETCH_ERROR') return null
				return err
			},
			async onQueryStarted(arg, {dispatch, queryFulfilled}) {
				try {
					const {data} = await queryFulfilled
					// localStorage.setItem(JWT_REFRESH_TOKEN, data.refreshToken)
					dispatch(jwtSlice.actions.addJwt(data))
				} catch (e) {}
			},
			invalidatesTags: ['jwt'],
		}),
		logout: builder.mutation<void, void>({
			query: () => ({url: 'auth/logout', method: 'POST'}),
			transformResponse: () => {
				return undefined
			},
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				try {
					await queryFulfilled
					dispatch(jwtSlice.actions.deleteJwt())
				} catch (e) {
					showErrorNotification(e, dispatch)
				}
			},
			invalidatesTags: ['jwt'],
		}),
	}),
	overrideExisting: 'throw',
})

export const {useLoginMutation, useRefreshTokensMutation, useLogoutMutation} = authApi
