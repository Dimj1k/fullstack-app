'use client'
import {useAppSelector, useFindBooksQuery, useLazyMeQuery, UserRoles} from '@/Rtk'
import Link from '../Components/Link/Link'
import {useEffect, useState} from 'react'
import {List} from '../Components/List/List'
import Image from 'next/image'
import logo from '../Components/Header/header.logo.png'

export default function BooksPage() {
	const accessToken = useAppSelector(state => state.jwt.accessToken)
	const [me, {data: dataMe, isError: isErrorMe}] = useLazyMeQuery()
	const [onItem, setOnItem] = useState<undefined | number>(0)
	const [take] = useState(5)
	const {data: dataBooks, isError: isErrorBooks} = useFindBooksQuery({
		skip: onItem,
		take,
	})
	useEffect(() => {
		if (accessToken) me()
	}, [accessToken])
	return (
		<>
			{(dataBooks && (
				<List
					data={dataBooks.map((book, idx) => ({
						id: (
							<Link key={book.book_id} href={`/books/${book.name_book}`} prefetch={false}>
								Книга номер {onItem ? idx + onItem : idx}
							</Link>
						),
						nameBook: book.name_book,
						image: (book.image && (
							<Image
								src={`http:/localhost:3002/public/${book.image}`}
								height={300}
								width={200}
								alt={book.name_book}
							/>
						)) || <Image src={logo} height={300} width={200} alt={book.name_book} />,
						genres: book.genres,
						rowId: onItem ? idx + onItem : idx,
					}))}
					itemHeight={300}
					columns={[
						{key: 'id', displayName: 'Номер книги'},
						{key: 'nameBook', displayName: 'Название книги'},
						{key: 'genres', displayName: 'Жанры'},
						{key: 'image', displayName: 'Обложка'},
					]}
					take={take}
					setOnItem={setOnItem}
				/>
			)) ||
				(isErrorBooks && <p>Произошла ошибка при загрузке книг</p>)}
			{(dataMe?.roles.includes(UserRoles.ADMIN) && (
				<>
					<Link href="/books/create-new-book" passHref>
						Прикрепить новую книгу
					</Link>
				</>
			)) ||
				(isErrorMe && accessToken && <p>Произошла ошибка при загрузки роли</p>)}
		</>
	)
}
