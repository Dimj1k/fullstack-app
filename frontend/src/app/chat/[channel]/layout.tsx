import {Metadata} from 'next'
import {channelIsExists} from './action'
import {notFound} from 'next/navigation'

export const generateMetadata = async ({
	params,
}: {
	params: {channel: string}
}): Promise<Metadata> => {
	const {channel} = params
	return {title: `Канал ${channel}`}
}

export default async function ChannelLayout({
	children,
	params: {channel},
}: Readonly<{
	children: React.ReactNode
	params: {channel: string}
}>) {
	const isExists = await channelIsExists(channel)
	if (!isExists) {
		notFound()
	}
	return <>{children}</>
}
