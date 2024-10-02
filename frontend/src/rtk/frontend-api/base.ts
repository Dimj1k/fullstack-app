import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const frontendBaseApi = createApi({
	baseQuery: fetchBaseQuery({baseUrl: '/api'}),
	refetchOnReconnect: false,
	reducerPath: 'frontendApi',
	tagTypes: ['channels'],
	endpoints: () => ({}),
})
