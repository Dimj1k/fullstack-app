'use client'
import {configureStore} from '@reduxjs/toolkit'
import {jwtSlice} from './slices'
import {notificationSlice} from './slices/notification'
import {baseApi} from './api'
import {queryErrorMiddleware} from './middlewares'
import {TypedUseSelectorHook, useSelector} from 'react-redux'
import {frontendBaseApi} from './frontend-api'

export const store = configureStore({
	reducer: {
		[baseApi.reducerPath]: baseApi.reducer,
		[jwtSlice.reducerPath]: jwtSlice.reducer,
		[notificationSlice.reducerPath]: notificationSlice.reducer,
		[frontendBaseApi.reducerPath]: frontendBaseApi.reducer,
	},
	devTools: process.env.NODE_ENV === 'development',
	middleware: gDM =>
		gDM().concat(baseApi.middleware, queryErrorMiddleware, frontendBaseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
