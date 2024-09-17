import {createSlice, PayloadAction} from '@reduxjs/toolkit'

export enum TypesNotification {
	ERROR = 'ERROR',
	MESSAGE = 'MESSAGE',
	WARNING = 'WARNING',
	SUCCESS = 'SUCCESS',
	NOTHING = 'NOTHING',
}

export interface NotificationState {
	messages: string | string[]
	typeNotification: TypesNotification
}

export interface NotificationStateWithTime extends NotificationState {
	showTime: number
}

const initialState: NotificationStateWithTime = {
	messages: '',
	typeNotification: TypesNotification.NOTHING,
	showTime: 0,
}

export const notificationSlice = createSlice({
	name: 'notification',
	initialState,
	reducerPath: 'notification',
	reducers: {
		show: (state, {payload: {messages, typeNotification}}: PayloadAction<NotificationState>) => {
			if (typeNotification === TypesNotification.NOTHING) return
			state.messages = messages
			state.typeNotification = typeNotification
			state.showTime = Date.now()
		},
		hide: state => {
			state.messages = ''
			state.typeNotification = TypesNotification.NOTHING
		},
	},
})
