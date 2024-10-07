import {NextResponse} from 'next/server'
import {Channels, connectToMongo} from '@/mongo'

export const getChannelsByUserId = async (member: string) => {
	try {
		await connectToMongo()
		const res = (await Channels.aggregate([
			{$match: {members: member}},
			{$project: {channelName: 1, _id: 0}},
		])) as {channelName: string}[]
		return NextResponse.json(
			res.map(({channelName}) => channelName),
			{status: 200},
		)
	} catch (error) {
		return NextResponse.json(error, {status: 500})
	}
}
