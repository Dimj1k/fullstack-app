import {isRejectedWithValue, Middleware, MiddlewareAPI} from '@reduxjs/toolkit'
import {notificationSlice, TypesNotification} from '../slices'
import {isErrorFromApi} from '../interfaces'

export const queryErrorMiddleware: Middleware = (api: MiddlewareAPI) => next => action => {
	if (isRejectedWithValue(action) && !action.meta.aborted) {
		if (isErrorFromApi(action.payload)) {
			const message = action.payload.data.message
			if (message) {
				api.dispatch(
					notificationSlice.actions.show({
						typeNotification: TypesNotification.ERROR,
						messages: message,
					}),
				)
			}
		} else {
			api.dispatch(
				notificationSlice.actions.show({
					typeNotification: TypesNotification.ERROR,
					messages: 'Произошла неизвестная ошибка',
				}),
			)
		}
	}
	return next(action)
}
