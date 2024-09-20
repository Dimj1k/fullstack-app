import {ICode, IMessage, IRegisteration} from '../interfaces'
import {notificationSlice, TypesNotification} from '../slices'
import {showErrorNotification} from '../utils'
import {baseApi} from './base'

export const registerationApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		registeration: builder.mutation<IMessage, IRegisteration>({
			query: body => ({url: 'registration', body, method: 'POST'}),
			onQueryStarted: async (arg, {dispatch, queryFulfilled}) => {
				const showNotification = notificationSlice.actions.show
				try {
					const {
						data: {message},
					} = await queryFulfilled
					dispatch(
						showNotification({typeNotification: TypesNotification.SUCCESS, messages: message}),
					)
				} catch (e) {
					showErrorNotification(e, dispatch)
				}
			},
		}),
		registerationConfirm: builder.mutation<IMessage, ICode>({
			query: body => ({url: 'registration/confirm', body, method: 'POST'}),
			onQueryStarted: async (arg, {dispatch, queryFulfilled}) => {
				try {
					const {
						data: {message},
					} = await queryFulfilled
					dispatch(
						notificationSlice.actions.show({
							typeNotification: TypesNotification.SUCCESS,
							messages: message,
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

export const {useRegisterationMutation, useRegisterationConfirmMutation} = registerationApi
