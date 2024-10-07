import {configureStore} from '@reduxjs/toolkit'
import {jwtSlice, notificationSlice} from './slices'
import {baseApi} from './api'
import {queryErrorMiddleware} from './middlewares'
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux'
import {frontendBaseApi} from './frontend-api'
import {setupListeners} from '@reduxjs/toolkit/query'

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
export const useAppDispatch: () => StoreDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
setupListeners(store.dispatch)
