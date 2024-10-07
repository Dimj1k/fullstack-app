import {Metadata} from 'next'

export const generateMetadata = async ({
	params,
}: {
	params: {channel: string}
}): Promise<Metadata> => {
	const {channel} = params
	return {title: `Канал ${channel}`}
}

export default function ChannelLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return <>{children}</>
}
