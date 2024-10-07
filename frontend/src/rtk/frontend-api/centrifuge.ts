import {frontendBaseApi} from './base'

export const centrifugeApi = frontendBaseApi.injectEndpoints({
	overrideExisting: 'throw',
	endpoints: builder => ({
		getMyChannels: builder.query<{channel: string}[], string>({
			query: userId => ({url: 'centrifuge/getChannelsByUserId', params: {userId}}),
			providesTags: ['channels'],
			transformResponse: (res: string[]) => {
				return res.map(channel => ({
					channel,
				}))
			},
		}),
		addChannel: builder.mutation<{newChannel: string}, string[]>({
			query: body => ({url: 'centrifuge/addChannel', body, method: 'POST'}),
			invalidatesTags: (_, error) => (error ? [] : ['channels']),
		}),
	}),
})

export const {useLazyGetMyChannelsQuery, useAddChannelMutation} = centrifugeApi
