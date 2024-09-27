import {Metadata} from 'next'
import {PropsWithChildren} from 'react'

export const metadata: Metadata = {
	title: 'Книги',
	description: 'Все книги',
}

export default async function ProfileLayout({children}: PropsWithChildren) {
	return <div>{children}</div>
}
