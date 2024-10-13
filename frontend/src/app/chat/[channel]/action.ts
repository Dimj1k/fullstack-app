'use server'

import {Channels, connectToMongo} from '@/mongo'

export const channelIsExists = async (channelName: string) => {
	await connectToMongo()
	const foundedChannel = await Channels.countDocuments({channelName}).exec()
	return !!foundedChannel
}
