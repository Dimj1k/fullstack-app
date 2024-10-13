'use client'
import {CentrifugeContext, useCentrifugeConnect} from '@/Hooks'
import {FormEvent, useEffect} from 'react'
import {useAddChannelMutation, useAppSelector, useLazyGetMyChannelsQuery} from '@/Rtk'
import {AddChannel} from './Components/AddChannel'
import styles from './chat.module.css'
import Link from '../Components/Link/Link'

export default function ChatLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const centrifuge = useCentrifugeConnect()
	const userId = useAppSelector(state => state.jwt.userId)
	const [getMyChannels, {data, isSuccess}] = useLazyGetMyChannelsQuery({
		pollingInterval: 10000,
		skipPollingIfUnfocused: true,
	})
	const [addNewChannel] = useAddChannelMutation()
	useEffect(() => {
		if (userId) {
			getMyChannels(userId)
		}
	}, [userId, getMyChannels])
	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const {
			toUserId: {value},
		} = event.target as EventTarget & {toUserId: {value: string}}
		if (value) addNewChannel([userId, value])
	}

	return (
		<CentrifugeContext.Provider value={{centrifuge, userId}}>
			<AddChannel onSubmit={onSubmit} nameInput="toUserId" />
			<div className={styles.channels}>
				{isSuccess &&
					data.map(({channel}) => (
						<Link key={channel} href={`chat/${channel}`} scroll={false} prefetch={false}>
							Канал {channel}
						</Link>
					))}
			</div>
			{children}
		</CentrifugeContext.Provider>
	)
}
