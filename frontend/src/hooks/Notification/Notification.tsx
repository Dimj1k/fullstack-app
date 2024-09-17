'use client'
import {NotificationState, TypesNotification} from '@/rtk'
import styles from './Notification.module.css'
import cn from 'classnames'
import {Fragment, memo, useEffect, useRef} from 'react'

function Notification({typeNotification, messages}: NotificationState) {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => {
		const div = ref.current
		if (!div) return
		const zero = performance.now()
		const height = div.clientHeight
		const animate = (t: number) => {
			const top = (t - zero - height) / 1.5
			if (top < 80) {
				div.style.top = `${top}px`
				requestAnimationFrame(animate)
			} else {
				div.style.top = `80px`
				cancelAnimationFrame(requestId)
			}
		}
		const requestId = requestAnimationFrame(animate)
	}, [typeNotification])
	if (typeNotification === TypesNotification.NOTHING) return <></>
	const message = Array.isArray(messages)
		? messages.map((message, idx) => (
				<Fragment key={idx}>
					{message}
					<br />
				</Fragment>
			))
		: messages
	return (
		<div className={cn(styles.notification, styles[typeNotification.toLowerCase()])} ref={ref}>
			{message}
		</div>
	)
}

export default memo(Notification)
