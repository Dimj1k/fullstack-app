import {IAuth, ILogin} from '../interfaces'
import {jwtSlice} from '../slices'
import {notificationSlice, TypesNotification} from '../slices/notification'
import {emptyApi} from './empty'

export const authApi = emptyApi.injectEndpoints({
	endpoints: builder => ({
		login: builder.mutation<IAuth, ILogin>({
			query: body => ({url: 'auth/login', body, method: 'POST'}),
			transformResponse: (res: IAuth) => {
				return res
			},
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				try {
					const {data} = await queryFulfilled
					dispatch(jwtSlice.actions.addJwt(data))
					dispatch(
						notificationSlice.actions.show({
							messages: 'Вы успешно вошли!',
							typeNotification: TypesNotification.SUCCESS,
						}),
					)
					/* eslint-disable @typescript-eslint/no-explicit-any */
				} catch (e: any) {
					dispatch(
						notificationSlice.actions.show({
							messages: e.error.data.message,
							typeNotification: TypesNotification.ERROR,
						}),
					)
				}
			},
		}),
		refreshTokens: builder.mutation<IAuth, void>({
			query: () => ({url: 'auth/refresh-tokens', method: 'POST'}),
			transformResponse: (res: IAuth) => {
				return res
			},
			async onQueryStarted(arg, {dispatch, queryFulfilled}) {
				try {
					const {data} = await queryFulfilled
					dispatch(jwtSlice.actions.addJwt(data))
				} catch (e) {}
			},
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
				} catch (e) {}
			},
		}),
	}),
	overrideExisting: 'throw',
})

export const {useLoginMutation, useRefreshTokensMutation, useLogoutMutation} = authApi
