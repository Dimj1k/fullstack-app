'use client'
import {useRef, useEffect, Fragment, useLayoutEffect} from 'react'
import {notificationSlice, TypesNotification, useAppDispatch, useAppSelector} from '@/Rtk'
import cn from 'classnames'
import styles from './AppNotification.module.css'

export function AppNotification() {
	const {messages, typeNotification, showTime, timeoutHideMs} = useAppSelector(
		state => state.notification,
	)
	const ref = useRef<HTMLDivElement>(null)
	const storeDispatch = useAppDispatch()
	useLayoutEffect(() => {
		if (typeNotification === TypesNotification.NOTHING) return
		const div = ref.current
		if (!div) return
		const zero = performance.now()
		const height = div.clientHeight
		const animate = (t: number) => {
			const time = t - zero
			const top = time - height
			if (top < 120) {
				div.style.top = `${top / 1.5}px`
				requestAnimationFrame(animate)
			} else {
				div.style.top = `80px`
				const opacity = timeoutHideMs - time
				if (opacity > 0) {
					div.style.opacity = `${opacity > 300 ? 100 : opacity / 3}%`
					requestAnimationFrame(animate)
				} else {
					div.style.opacity = '0'
					cancelAnimationFrame(requestId)
				}
			}
		}
		const requestId = requestAnimationFrame(animate)
		return () => {
			cancelAnimationFrame(requestId)
		}
	}, [showTime, typeNotification, timeoutHideMs])
	useEffect(() => {
		if (typeNotification === TypesNotification.NOTHING) return
		const idTimeout = setTimeout(
			() => storeDispatch(notificationSlice.actions.hide()),
			timeoutHideMs,
		)
		return () => {
			clearTimeout(idTimeout)
		}
	}, [showTime, typeNotification, timeoutHideMs, storeDispatch])
	if (typeNotification === TypesNotification.NOTHING) return undefined
	const message = Array.isArray(messages)
		? messages.map((message, idx) => (
				<Fragment key={idx}>
					{message}
					<br />
				</Fragment>
			))
		: messages
	return (
		<div
			className={cn(styles.notification, styles[typeNotification.toLowerCase()])}
			role="status"
			ref={ref}>
			{message}
		</div>
	)
}
