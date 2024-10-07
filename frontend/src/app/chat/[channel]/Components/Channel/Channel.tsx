import Button from '@/app/Components/Button/Button'
import {FormEvent, useCallback, useContext, useEffect, useRef, useState} from 'react'
import {PublicationContext, type Subscription} from 'centrifuge'
import {Input} from '@/app/Components/Input'
import Form from '@/app/Components/Form/Form'
import styles from './Channel.module.css'
import cn from 'classnames'
import {CentrifugeContext} from '@/Hooks'
import {Modal} from '@/app/Components/Modal'
import {useRouter} from 'next/navigation'
import {flushSync} from 'react-dom'

export const Channel: React.FC<{channel: string}> = ({channel}) => {
	const {centrifuge, userId} = useContext(CentrifugeContext)
	const [sub, setSub] = useState<Subscription | null>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const [messages, setMessages] = useState<PublicationContext[]>([])
	const router = useRouter()
	useEffect(() => {
		const content = contentRef.current
		if (!content || !centrifuge) return
		let historyUpdate = true
		const sub =
			centrifuge.getSubscription(`personal:${channel}`) ||
			centrifuge.newSubscription(`personal:${channel}`)
		sub.subscribe()
		setSub(sub)
		sub.history({limit: 100}).then(({publications}) => {
			if (historyUpdate) {
				flushSync(() => setMessages(messages => [...messages, ...publications]))
				content.scrollTo(0, content.scrollHeight)
			}
		})
		sub.on('publication', pub => {
			setMessages(messages => [...messages, pub])
		})
		return () => {
			sub.removeAllListeners('publication')
			setSub(null)
			historyUpdate = false
		}
	}, [contentRef.current, centrifuge, setSub, channel])

	useEffect(() => {
		const content = contentRef.current
		if (!content || !content.lastElementChild) return
		if (
			content.scrollHeight - content.scrollTop - content.clientHeight <
			content.lastElementChild.clientHeight * 2
		) {
			content.scrollTo(0, content.scrollHeight)
		}
	}, [messages])

	const closeChannel = useCallback(() => {
		if (!sub) return
		router.back()
		setMessages([])
		sub.removeAllListeners('publication')
		sub.unsubscribe()
	}, [sub, router, setMessages])

	const sendMessage = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const content = contentRef.current
		if (!sub || !content) return
		const target = event.target as HTMLFormElement
		const {
			message: {value},
		} = target as typeof target & {message: {value: string}}
		const send = value.trim()
		if (!send) return
		target.reset()
		content.scrollTo(0, content.scrollHeight)
		sub.publish(send)
	}

	return (
		<Modal closeCb={closeChannel}>
			<div className={styles.content} ref={contentRef}>
				{messages.map((msg, idx) => {
					const publisher = msg.info?.user || 'Аноним'
					return (
						<div
							className={cn(styles.msg, {
								[styles['u-msg']]: publisher == userId,
							})}
							key={`${msg.offset || idx}`}>
							<p className={styles.publisher}>{publisher}</p>
							{typeof msg.data == 'string' ? msg.data : JSON.stringify(msg.data)}
						</div>
					)
				})}
			</div>
			<Form onSubmit={sendMessage} className={styles.input} gridTemplateAreas={`"a""b"`}>
				<Input name="message" />
				<Button>Отправить</Button>
			</Form>
		</Modal>
	)
}
