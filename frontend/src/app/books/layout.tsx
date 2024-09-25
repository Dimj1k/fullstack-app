import {Metadata} from 'next'
import {PropsWithChildren} from 'react'

export const metadata: Metadata = {
	title: 'Книги',
	description: 'Все книги',
}

export default async function ProfileLayout({
	children,
}: PropsWithChildren<{modal: React.ReactNode}>) {
	return (
		<div>
			{children}
			<div id="create-new-book-modal" />
		</div>
	)
}
