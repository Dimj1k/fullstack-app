import {configureStore} from '@reduxjs/toolkit'
import {authApi} from './api/auth'
import {jwtSlice} from './slices'
import {notificationSlice} from './slices/notification'

export const store = configureStore({
	reducer: {
		[authApi.reducerPath]: authApi.reducer,
		[jwtSlice.reducerPath]: jwtSlice.reducer,
		[notificationSlice.reducerPath]: notificationSlice.reducer,
	},
	devTools: process.env.NODE_ENV === 'development',
	middleware: gDM => gDM().concat(authApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch
