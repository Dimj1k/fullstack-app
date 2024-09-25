import {Gender} from '@/Rtk'
import {paramsToUrl} from '@/Utils'
import {notFound} from 'next/navigation'

export interface User {
	id: React.JSX.Element
	email: string
	role: ['ADMIN', 'USER']
}

export interface FullUser extends User {
	info: {
		birthdayDate: null | Date
		gender: Gender
	}
	books: Record<string, string>
}

export async function getAllUsers(take?: string, page?: string): Promise<User[]> {
	const res = await fetch(
		`${process.env.API}/users/find-all${take && page ? paramsToUrl({take, skip: `${(+page - 1) * +take}`}) : ''}`,
		{
			next: {revalidate: 5},
		},
	)
	if (!res.ok) throw new Error()
	return res.json()
}

export async function getUserById(userId: string): Promise<FullUser> {
	const res = await fetch(`${process.env.API}/users/find/${userId}`)
	if (!res.ok) throw new Error()
	if (res.headers.get('content-length') == '0') notFound()
	return res.json()
}
