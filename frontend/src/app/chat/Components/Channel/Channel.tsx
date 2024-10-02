import Button from '@/app/Components/Button/Button'
import {FormEvent, useContext, useRef, useState} from 'react'
import {PublicationContext, Subscription} from 'centrifuge'
import {Input} from '@/app/Components/Input'
import Form from '@/app/Components/Form/Form'
import {createPortal} from 'react-dom'
import styles from './Channel.module.css'
import cn from 'classnames'
import {CentrifugeContext} from '@/Hooks'

export const Channel: React.FC<{channel: string}> = ({channel}) => {
	const {centrifuge, userId} = useContext(CentrifugeContext)
	const subRef = useRef<Subscription | null>(null)
	const modalRef = useRef<HTMLDivElement>(null)
	const [messages, setMessages] = useState<PublicationContext[]>([])
	const [toggleChannel, setToggleChannel] = useState<boolean>(false)

	// const closeChannel = () => {
	// 	setToggleChannel(false)
	// 	const sub = subRef.current
	// 	if (!sub) return
	// 	sub.removeAllListeners('publication')
	// 	sub.unsubscribe()
	// 	centrifuge?.disconnect()
	// }

	const sendMessage = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const sub = subRef.current
		if (!sub) return
		const target = event.target as HTMLFormElement
		const {
			message: {value},
		} = target as typeof target & {message: {value: string}}
		target.reset()
		if (!value) return
		sub.publish(value)
	}

	const joinChannel = () => {
		if (!centrifuge) return
		centrifuge.connect()
		const sub = centrifuge.newSubscription(`personal:${channel}`)
		subRef.current = sub
		sub.subscribe()
		sub.on('publication', pub => {
			setMessages(state => [...state, pub])
		})
		setToggleChannel(true)
	}

	return (
		<div>
			{toggleChannel &&
				createPortal(
					<div className={styles.modal} ref={modalRef}>
						<div className={styles.content}>
							{messages.map((msg, idx) => (
								<div
									className={cn(styles.msg, {
										[styles['u-msg']]: msg.info?.user == userId,
									})}
									key={msg.offset ?? idx}>
									{msg.data}
								</div>
							))}
							<Form onSubmit={sendMessage} className={styles.input} gridTemplateAreas={`"a""b"`}>
								<Input name="message" />
								<Button>Отправить</Button>
							</Form>
						</div>
					</div>,
					document.body,
				)}
			{!toggleChannel && <Button onClick={joinChannel}>Канал {channel}</Button>}
		</div>
	)
}
