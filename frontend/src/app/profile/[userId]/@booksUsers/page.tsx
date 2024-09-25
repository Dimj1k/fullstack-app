import {getUserById} from '@/Api'
import {PropsProfile} from '../layout'

export default async function BooksUser({params: {userId}}: {params: PropsProfile['params']}) {
	const {books} = await getUserById(userId)
	return <div>Книги пользователя</div>
}
