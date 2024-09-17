import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {JWT_REFRESH_TOKEN_TIME, JWT_TOKEN_IN_LOCAL_STORAGE} from '../constants'
import {getItem} from '../local-storage'

interface State {
	accessToken?: string
	refresh: number
}

const initialState: State = {
	accessToken: getItem(JWT_TOKEN_IN_LOCAL_STORAGE) ?? undefined,
	refresh: +(getItem(JWT_REFRESH_TOKEN_TIME) ?? 0),
}

export const jwtSlice = createSlice({
	name: 'jwt',
	initialState,
	reducerPath: 'jwt',
	reducers: {
		addJwt: (state, {payload: {accessToken}}: PayloadAction<Omit<State, 'refresh'>>) => {
			if (!accessToken) return
			state.accessToken = accessToken
			const time = Date.now() + 3000 * 1000
			state.refresh = time
			localStorage.setItem(JWT_TOKEN_IN_LOCAL_STORAGE, accessToken)
			localStorage.setItem(JWT_REFRESH_TOKEN_TIME, `${time}`)
		},
		deleteJwt: state => {
			state.accessToken = undefined
			state.refresh = 0
			localStorage.removeItem(JWT_TOKEN_IN_LOCAL_STORAGE)
			localStorage.removeItem(JWT_REFRESH_TOKEN_TIME)
		},
	},
})
