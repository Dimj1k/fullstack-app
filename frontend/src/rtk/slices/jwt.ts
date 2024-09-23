import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import type {UUID} from 'crypto'
// import {JWT_REFRESH_TOKEN_TIME, JWT_TOKEN_IN_LOCAL_STORAGE} from '../constants'
// import {getItem} from '../local-storage'

interface JwtState {
	accessToken?: string
	lifeTimeAccessToken: number
	userId: UUID | ''
}

const initialState: JwtState = {
	accessToken: undefined,
	lifeTimeAccessToken: 0,
	userId: '',
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
			// localStorage.setItem(JWT_TOKEN_IN_LOCAL_STORAGE, accessToken)
			// localStorage.setItem(JWT_REFRESH_TOKEN_TIME, `${time}`)
		},
		deleteJwt: state => {
			state.accessToken = undefined
			state.lifeTimeAccessToken = 0
			state.userId = ''
			// localStorage.removeItem(JWT_TOKEN_IN_LOCAL_STORAGE)
			// localStorage.removeItem(JWT_REFRESH_TOKEN_TIME)
		},
	},
})
