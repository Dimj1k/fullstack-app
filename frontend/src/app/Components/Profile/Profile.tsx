'use client'
import Link from '../Link/Link'

export default function Profile() {
	return (
		<Link href="/auth" style={{marginLeft: 'auto'}} additionalhrefs={['/registeration']}>
			Войти/Зарегистрироваться
		</Link>
	)
}
