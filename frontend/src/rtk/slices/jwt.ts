import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {getItem} from '../local-storage'
// import {JWT_REFRESH_TOKEN_TIME, JWT_TOKEN_IN_LOCAL_STORAGE} from '../constants'
// import {getItem} from '../local-storage'

interface JwtState {
	accessToken?: string
	lifeTimeAccessToken: number
	userId: string | ''
}

const initialState: JwtState = {
	accessToken: undefined,
	lifeTimeAccessToken: 0,
	userId: getItem('userId') ?? '',
}

export const jwtSlice = createSlice({
	name: 'jwt',
	initialState,
	reducerPath: 'jwt',
	reducers: {
		addJwt: (
			state,
			{payload: {accessToken, lifeTimeAccessToken, userId}}: PayloadAction<JwtState>,
		) => {
			if (!accessToken) return
			state.accessToken = accessToken
			state.lifeTimeAccessToken = lifeTimeAccessToken
			state.userId = userId
			localStorage.setItem('userId', userId)
			// localStorage.setItem(JWT_TOKEN_IN_LOCAL_STORAGE, accessToken)
			// localStorage.setItem(JWT_REFRESH_TOKEN_TIME, `${time}`)
		},
		deleteJwt: state => {
			state.accessToken = undefined
			state.lifeTimeAccessToken = 0
			state.userId = ''
			localStorage.removeItem('userId')
			// localStorage.removeItem(JWT_TOKEN_IN_LOCAL_STORAGE)
			// localStorage.removeItem(JWT_REFRESH_TOKEN_TIME)
		},
	},
})
