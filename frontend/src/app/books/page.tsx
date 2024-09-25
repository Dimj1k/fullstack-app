'use client'
import {useMeQuery, UserRoles} from '@/Rtk'
import Link from '../Components/Link/Link'

export default function BooksPage() {
	const {data /*isUninitialized, isError, isSuccess, isLoading*/} = useMeQuery()
	return (
		<>
			{data?.roles.includes(UserRoles.ADMIN) && (
				<>
					<Link href="/books/create-new-book" passHref>
						Прикрепить новую книгу
					</Link>
				</>
			)}
		</>
	)
}
