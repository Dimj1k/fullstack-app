'use client'
import {useDispatch} from 'react-redux'
import {StoreDispatch, notificationSlice} from '@/Rtk'
import {useEffect} from 'react'
import {bindActionCreators} from '@reduxjs/toolkit'

export function useNotification(timeoutHideMs: number = 3000) {
	const storeDispatch = useDispatch<StoreDispatch>()
	const dispatch = bindActionCreators(notificationSlice.actions, storeDispatch)
	useEffect(() => {
		dispatch.changeTimeOut({timeoutHideMs})
	}, [timeoutHideMs, dispatch])
	return dispatch.show
}
