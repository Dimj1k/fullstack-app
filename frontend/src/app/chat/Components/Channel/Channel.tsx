import Button from '@/app/Components/Button/Button'
import {FormEvent, Fragment, useContext, useEffect, useRef, useState} from 'react'
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
	useEffect(() => {
		if (!modalRef.current) return
		const escapeListener = (event: KeyboardEvent) => {
			if (event.key == 'Escape') {
				closeChannel()
			}
		}
		document.addEventListener('keydown', escapeListener)
		return () => {
			document.removeEventListener('keydown', escapeListener)
		}
	}, [modalRef.current])

	const closeChannel = () => {
		const sub = subRef.current
		if (!sub) return
		setToggleChannel(false)
		setMessages([])
		sub.removeAllListeners('publication')
		sub.unsubscribe()
	}

	const sendMessage = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const sub = subRef.current
		if (!sub) return
		const target = event.target as HTMLFormElement
		const {
			message: {value},
		} = target as typeof target & {message: {value: string}}
		if (!value) return
		target.reset()
		sub.publish(value)
	}

	const joinChannel = () => {
		if (!centrifuge) return
		const sub =
			centrifuge.getSubscription(`personal:${channel}`) ||
			centrifuge.newSubscription(`personal:${channel}`)
		subRef.current = sub
		sub.subscribe()
		sub.history({limit: 100}).then(({publications}) => {
			setMessages(state => [...state, ...publications])
		})
		sub.on('publication', pub => {
			setMessages(state => [...state, pub])
		})
		setToggleChannel(true)
	}

	return (
		<div>
			{toggleChannel &&
				createPortal(
					<div
						className={styles.modal}
						ref={modalRef}
						onClick={({target}) => {
							if (target == modalRef.current) {
								closeChannel()
							}
						}}>
						<div className={styles.window} role="dialog">
							<span className={styles.close} onClick={closeChannel} role="button" />
							<div className={styles.content}>
								{messages.map((msg, idx) => {
									const publisher = msg.info?.user
									return (
										<div
											className={cn(styles.msg, {
												[styles['u-msg']]: publisher == userId,
											})}
											key={msg.offset || idx}>
											<p className={styles.publisher}>{publisher}</p>
											{msg.data}
										</div>
									)
								})}
							</div>
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
