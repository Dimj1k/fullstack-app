import {createSlice, PayloadAction} from '@reduxjs/toolkit'
// import {JWT_REFRESH_TOKEN_TIME, JWT_TOKEN_IN_LOCAL_STORAGE} from '../constants'
// import {getItem} from '../local-storage'

interface JwtState {
	accessToken?: string
	refresh: number
}

const initialState: JwtState = {
	accessToken: undefined,
	refresh: 0,
}

export const jwtSlice = createSlice({
	name: 'jwt',
	initialState,
	reducerPath: 'jwt',
	reducers: {
		addJwt: (state, {payload: {accessToken}}: PayloadAction<Omit<JwtState, 'refresh'>>) => {
			if (!accessToken) return
			state.accessToken = accessToken
			const time = Date.now() + 3000 * 1000
			state.refresh = time
			// localStorage.setItem(JWT_TOKEN_IN_LOCAL_STORAGE, accessToken)
			// localStorage.setItem(JWT_REFRESH_TOKEN_TIME, `${time}`)
		},
		deleteJwt: state => {
			state.accessToken = undefined
			state.refresh = 0
			// localStorage.removeItem(JWT_TOKEN_IN_LOCAL_STORAGE)
			// localStorage.removeItem(JWT_REFRESH_TOKEN_TIME)
		},
	},
})
