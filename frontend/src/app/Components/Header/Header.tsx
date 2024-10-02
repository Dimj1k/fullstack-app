'use client'
import Image from 'next/image'
import styles from './Header.module.css'
import Link from '../Link/Link'
import logo from './header.logo.png'
import Profile from '../Profile/Profile'
import {useAppSelector} from '@/Rtk'

export default function Header() {
	const accessToken = useAppSelector(state => state.jwt.accessToken)
	return (
		<header className={styles.header}>
			<div className={styles.content}>
				<Image src={logo} alt="logo" width={50} height={50} />
				<Link href="/">Главная</Link>
				<Link href="/profile">Все пользователи</Link>
				<Link href="/books">Все книги</Link>
				{accessToken && <Link href="/chat">Сообщения</Link>}
				<Profile />
			</div>
		</header>
	)
}
