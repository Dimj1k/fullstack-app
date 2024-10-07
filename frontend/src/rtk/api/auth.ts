import {IAuth, ILogin, InfoUser, isErrorFromApi} from '../interfaces'
import {jwtSlice} from '../slices'
import {notificationSlice, TypesNotification} from '../slices/notification'
import {baseApi} from './base'

export const authApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		login: builder.mutation<IAuth, ILogin>({
			query: body => ({url: 'auth/login', body, method: 'POST'}),
			transformResponse: ({lifeTimeAccessToken, refreshToken, ...res}: IAuth) => {
				return {...res, refreshToken, lifeTimeAccessToken: lifeTimeAccessToken * 900}
			},
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				const showNotification = notificationSlice.actions.show
				try {
					const {data} = await queryFulfilled
					dispatch(jwtSlice.actions.addJwt(data))
					dispatch(
						showNotification({
							messages: 'Вы успешно вошли!',
							typeNotification: TypesNotification.SUCCESS,
						}),
					)
				} catch {}
			},
			invalidatesTags: (_, err) => (err ? [] : ['jwt']),
		}),
		refreshTokens: builder.mutation<IAuth, void>({
			query: () => ({url: 'auth/refresh-tokens', method: 'POST'}),
			transformResponse: ({lifeTimeAccessToken, refreshToken, ...res}: IAuth) => {
				return {...res, refreshToken, lifeTimeAccessToken: lifeTimeAccessToken * 950}
			},
			async onQueryStarted(arg, {dispatch, queryFulfilled}) {
				try {
					const {data} = await queryFulfilled
					dispatch(jwtSlice.actions.addJwt(data))
				} catch (err) {
					if (isErrorFromApi(err)) {
						if (err.status === 401) {
							dispatch(jwtSlice.actions.deleteJwt())
						}
					} else if (err && typeof err == 'object' && 'error' in err && isErrorFromApi(err.error)) {
						dispatch(jwtSlice.actions.deleteJwt())
					}
				}
			},
			invalidatesTags: (_, err) => (err ? [] : ['jwt']),
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
				} catch {}
			},
			invalidatesTags: (_, err) => (err ? [] : ['jwt']),
		}),
		me: builder.query<InfoUser, void>({
			query: () => ({url: 'users/me'}),
			providesTags: ['jwt'],
			keepUnusedDataFor: 300,
		}),
	}),
	overrideExisting: 'throw',
})

export const {useLoginMutation, useRefreshTokensMutation, useLogoutMutation, useLazyMeQuery} =
	authApi
