'use client'
import {useSelector} from 'react-redux'
import Link from '../Link/Link'
import {RootState, useRefreshTokensMutation} from '@/Rtk'
import {useEffect} from 'react'

export default function Profile() {
	const accessToken = useSelector((state: RootState) => state.jwt.accessToken)
	const [refreshTokens, {isUninitialized, isLoading}] = useRefreshTokensMutation({
		fixedCacheKey: 'refresh',
	})
	useEffect(() => {
		if (!accessToken) {
			refreshTokens()
		}
	}, [])
	if (isUninitialized || isLoading) return <p>Загрузка...</p>
	return (
		<>
			{accessToken && <Link href="/profile">Ваш профиль</Link>}
			{!accessToken && (
				<Link href="/auth" additionalhrefs={['/registeration']}>
					Войти/Зарегистрироваться
				</Link>
			)}
		</>
	)
}
