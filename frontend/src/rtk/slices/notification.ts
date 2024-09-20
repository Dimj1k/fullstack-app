import {createSlice, PayloadAction} from '@reduxjs/toolkit'

export enum TypesNotification {
	ERROR = 'ERROR',
	MESSAGE = 'MESSAGE',
	WARNING = 'WARNING',
	SUCCESS = 'SUCCESS',
	NOTHING = 'NOTHING',
}

export interface NotificationState {
	messages?: string | string[]
	typeNotification: TypesNotification
}

export interface NotificationStateWithTime extends NotificationState {
	showTime: number
	timeoutHideMs: number
}

const initialState: NotificationStateWithTime = {
	messages: undefined,
	typeNotification: TypesNotification.NOTHING,
	showTime: 0,
	timeoutHideMs: 3000,
}

export const notificationSlice = createSlice({
	name: 'notification',
	initialState,
	reducerPath: 'notification',
	reducers: {
		show: (state, {payload: {messages, typeNotification}}: PayloadAction<NotificationState>) => {
			if (typeNotification === TypesNotification.NOTHING) return
			state.messages = Array.isArray(messages) ? Array.from(new Set(messages)) : messages
			state.typeNotification = typeNotification
			state.showTime = Date.now()
		},
		hide: state => {
			state.messages = undefined
			state.typeNotification = TypesNotification.NOTHING
		},
		changeTimeOut: (
			state,
			{payload: {timeoutHideMs}}: PayloadAction<Pick<NotificationStateWithTime, 'timeoutHideMs'>>,
		) => {
			if (state.timeoutHideMs !== timeoutHideMs) state.timeoutHideMs = timeoutHideMs
		},
	},
})
