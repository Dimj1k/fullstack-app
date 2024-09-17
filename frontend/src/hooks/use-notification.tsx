'use client'
import {useDispatch, useSelector} from 'react-redux'
import {RootState, StoreDispatch, notificationSlice, NotificationStateWithTime} from '@/rtk'
import {useEffect, useMemo} from 'react'
import Notification from './Notification/Notification'
import {bindActionCreators} from '@reduxjs/toolkit'

export function useNotification(timeoutMs: number = 2000) {
	const {messages, typeNotification, showTime} = useSelector<RootState>(
		state => state.notification,
	) as NotificationStateWithTime
	const storeDispatch = useDispatch<StoreDispatch>()
	const dispatch = useMemo(
		() => bindActionCreators(notificationSlice.actions, storeDispatch),
		[storeDispatch],
	)
	useEffect(() => {
		const idTimeout = setTimeout(() => dispatch.hide(), timeoutMs)
		return () => {
			clearTimeout(idTimeout)
		}
	}, [showTime, dispatch, timeoutMs])
	const notification = <Notification messages={messages} typeNotification={typeNotification} />
	return [notification, dispatch as Omit<typeof dispatch, 'hide'>] as const
}
