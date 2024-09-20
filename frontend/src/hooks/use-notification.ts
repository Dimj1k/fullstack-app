'use client'
import {useDispatch} from 'react-redux'
import {StoreDispatch, notificationSlice} from '@/Rtk'
import {useEffect, useMemo} from 'react'
import {bindActionCreators} from '@reduxjs/toolkit'

export function useNotification(timeoutHideMs: number = 3000) {
	const storeDispatch = useDispatch<StoreDispatch>()
	const dispatch = useMemo(
		() => bindActionCreators(notificationSlice.actions, storeDispatch),
		[storeDispatch],
	)
	useEffect(() => {
		dispatch.changeTimeOut({timeoutHideMs})
	}, [timeoutHideMs, dispatch])
	return dispatch.show
}
