'use client'
import {isErrorFromApi} from '../interfaces'
import {notificationSlice, TypesNotification} from '../slices'
import type {store} from '../store'

export function showErrorNotification(error: unknown, dispatch: typeof store.dispatch) {
	if (isErrorFromApi(error))
		dispatch(
			notificationSlice.actions.show({
				messages: error.error.data.message,
				typeNotification: TypesNotification.ERROR,
			}),
		)
	else
		dispatch(
			notificationSlice.actions.show({
				messages: 'Произошла неизвестная ошибка',
				typeNotification: TypesNotification.ERROR,
			}),
		)
}
