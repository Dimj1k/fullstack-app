import {readFile} from 'fs/promises'
import {channelsJson, isExists} from '../../utils'
import {NextResponse} from 'next/server'

export const getAllChannels = async (): Promise<Record<string, undefined | string[]>> => {
	const jsonIsExists = await isExists(channelsJson)
	return jsonIsExists ? JSON.parse(await readFile(channelsJson, 'utf-8')) : {}
}

export const getChannelsByUserId = async (userId: string) => {
	const res = (await getAllChannels())[userId] ?? []
	return NextResponse.json(res, {status: 200})
}
