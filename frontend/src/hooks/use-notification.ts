import {notificationSlice, useAppDispatch} from '@/Rtk'
import {useEffect} from 'react'
import {bindActionCreators} from '@reduxjs/toolkit'

export function useNotification(timeoutHideMs: number = 3000) {
	const storeDispatch = useAppDispatch()
	const dispatch = bindActionCreators(notificationSlice.actions, storeDispatch)
	useEffect(() => {
		dispatch.changeTimeOut({timeoutHideMs})
	}, [timeoutHideMs, dispatch])
	return dispatch.show
}
