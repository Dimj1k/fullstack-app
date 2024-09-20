import {
	BaseQueryFn,
	FetchArgs,
	fetchBaseQuery,
	FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import {RootState} from '../store'
import {Mutex} from 'async-mutex'

const baseQuery = fetchBaseQuery({
	baseUrl: process.env.API,
	mode: 'cors',
	prepareHeaders: (headers, {getState}) => {
		if (!headers.has('authorization')) {
			const {
				jwt: {accessToken},
			} = getState() as RootState
			if (accessToken) {
				headers.set('authorization', accessToken)
			}
		}
		return headers
	},
	cache: 'default',
	referrerPolicy: 'origin',
	credentials: 'include',
})

const mutex = new Mutex()
export const baseQueryWithMutex: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	if (api.endpoint === 'refreshTokens') {
		await mutex.waitForUnlock()
		const release = await mutex.acquire()
		try {
			const result = await baseQuery(args, api, extraOptions)
			return result
		} finally {
			release()
		}
	}
	return baseQuery(args, api, extraOptions)
}
