import {nanoid} from '@reduxjs/toolkit'
import {NextResponse} from 'next/server'
import {Channels, connectToMongo} from '@/mongo'

export const addChannel = async (...members: string[]) => {
	const channelName = nanoid()
	try {
		await connectToMongo()
		const newChannel = new Channels({channelName, members})
		await newChannel.save()
		return NextResponse.json({channelName}, {status: 201})
	} catch (error) {
		return NextResponse.json(error, {status: 500})
	}
}
