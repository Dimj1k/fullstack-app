import {createApi} from '@reduxjs/toolkit/query/react'
import {baseQueryWithMutex} from './base-query'

export const baseApi = createApi({
	baseQuery: baseQueryWithMutex,
	tagTypes: ['jwt', 'books'],
	refetchOnReconnect: false,
	reducerPath: 'backendApi',
	endpoints: () => ({}),
})
