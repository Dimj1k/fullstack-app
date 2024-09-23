import {Metadata} from 'next'
import {notFound} from 'next/navigation'

interface Props {
	params: {userId: string}
}

export async function generateStaticParams() {
	const users = (await fetch(`${process.env.API}/users/find-all`, {next: {revalidate: 5}}).then(
		res => res.json(),
	)) as {
		id: string
		email: string
	}[]
	return users.map(({id: userId}) => ({
		userId,
	}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
	const {userId} = params
	const {email} = await fetch(`${process.env.API}/users/find/${userId}`).then(res => res.json())
	return {title: `Пользователь ${email}`, description: `id пользователя ${userId}`}
}

export default async function ProfilePage({params}: Props) {
	const {userId} = params
	const {email} = await fetch(`${process.env.API}/users/find/${userId}`).then(res => res.json())
	if (!email) notFound()
	return (
		<>
			asdaaqqwedqweqewq{userId} {email}
		</>
	)
}
