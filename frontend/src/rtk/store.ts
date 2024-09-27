'use client'
import {configureStore} from '@reduxjs/toolkit'
import {jwtSlice} from './slices'
import {notificationSlice} from './slices/notification'
import {baseApi} from './api'
import {queryErrorMiddleware} from './middlewares'

export const store = configureStore({
	reducer: {
		[baseApi.reducerPath]: baseApi.reducer,
		[jwtSlice.reducerPath]: jwtSlice.reducer,
		[notificationSlice.reducerPath]: notificationSlice.reducer,
	},
	devTools: true,
	middleware: gDM => gDM().concat(baseApi.middleware, queryErrorMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch
