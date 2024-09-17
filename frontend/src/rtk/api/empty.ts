import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const emptyApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: 'http://localhost:3002/api/',
		prepareHeaders: headers => {
			// headers.set('content-type', 'application/json')
			return headers
		},
		credentials: 'include',
	}),
	reducerPath: 'api',
	endpoints: () => ({}),
})
