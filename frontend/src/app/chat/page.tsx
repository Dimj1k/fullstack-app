'use client'
import {CentrifugeContext, useCentrifugeConnect} from '@/Hooks'
import {FormEvent, useCallback, useEffect} from 'react'
import {useAddChannelMutation, useAppSelector, useLazyGetMyChannelsQuery} from '@/Rtk'
import {AddChannel} from './Components/AddChannel'
import {Channel} from './Components/Channel'
import styles from './chat.module.css'

export default function Chat() {
	const centrifuge = useCentrifugeConnect()
	const userId = useAppSelector(state => state.jwt.userId)
	const [getMyChannels, {data, isSuccess: isSuccessChannels}] = useLazyGetMyChannelsQuery({
		pollingInterval: 10000,
	})
	const [addNewChannel] = useAddChannelMutation()
	useEffect(() => {
		if (userId) {
			getMyChannels(userId)
		}
	}, [userId])
	const onSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			const {
				toUserId: {value},
			} = event.target as EventTarget & {toUserId: {value: string}}
			if (value) addNewChannel([userId, value])
		},
		[userId, addNewChannel],
	)
	return (
		<CentrifugeContext.Provider value={{centrifuge, userId}}>
			<AddChannel onSubmit={onSubmit} nameInput="toUserId" />
			<div className={styles.channels}>
				{isSuccessChannels && data.map(({channel}) => <Channel key={channel} channel={channel} />)}
			</div>
		</CentrifugeContext.Provider>
	)
}
