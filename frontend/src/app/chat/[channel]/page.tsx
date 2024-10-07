'use client'
import dynamic from 'next/dynamic'

const LazyChannel = dynamic(() => import('./Components/Channel').then(v => v.Channel), {
	loading: () => <></>,
	ssr: false,
})

export default function Chat({params: {channel}}: {params: {channel: string}}) {
	return <LazyChannel key={channel} channel={channel} />
}
