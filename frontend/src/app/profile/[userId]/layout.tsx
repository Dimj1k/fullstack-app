import {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getAllUsers, getUserById} from '@/Api'
import styles from './profile.module.css'
import {Splitter} from '../../Components/Splitter/Splitter'

export interface PropsProfile {
	params: {userId: string}
	infoUser: React.JSX.Element
	booksUsers: React.JSX.Element
}

export async function generateStaticParams() {
	const users = await getAllUsers()
	return users.map(({id: userId}) => ({
		userId,
	}))
}

export async function generateMetadata({params}: PropsProfile): Promise<Metadata> {
	const {userId} = params
	const {email} = await getUserById(userId)
	return {title: `Пользователь ${email}`, description: `id пользователя ${userId}`}
}

export default async function ProfileLayout({
	params: {userId},
	infoUser,
	booksUsers,
}: PropsProfile) {
	const {email} = await getUserById(userId)
	if (!email) notFound()
	return (
		<div className={styles.content}>
			{infoUser}
			<Splitter />
			{booksUsers}
		</div>
	)
}
