import Image from 'next/image'
import styles from './Header.module.css'
import Link from '../Link/Link'
import Profile from '../Profile/Profile'

export default function Header() {
	return (
		<header className={styles.header}>
			<div className={styles.content}>
				<Image src="http://localhost:3002/public/logo.png" alt="logo" width={50} height={50} />
				<Link href="/">Главная</Link>
				<Link href="/books">Все книги</Link>
				
				<Profile />
			</div>
		</header>
	)
}
