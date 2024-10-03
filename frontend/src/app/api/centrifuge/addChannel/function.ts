import {nanoid} from '@reduxjs/toolkit'
import {Mutex} from 'async-mutex'
import {writeFile} from 'fs/promises'
import {channelsJson} from '../../utils'
import {getAllChannels} from '../getChannelsByUserId'
import {NextResponse} from 'next/server'

const mutex = new Mutex()
export const addChannel = async (...userIds: string[]) => {
	await mutex.waitForUnlock()
	const release = await mutex.acquire()
	try {
		const newChannel = nanoid()
		const allChannels = await getAllChannels()
		for (const userId of userIds) {
			const userIdChannels = allChannels[userId]
			if (!userIdChannels) {
				allChannels[userId] = [newChannel]
			} else {
				userIdChannels.push(newChannel)
			}
		}
		await writeFile(channelsJson, JSON.stringify(allChannels), 'utf-8')
		return NextResponse.json({newChannel}, {status: 201})
	} catch (error) {
		return NextResponse.json(error, {status: 500})
	} finally {
		release()
	}
}
