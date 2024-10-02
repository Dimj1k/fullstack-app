'use client'
import Link from '../Link/Link'
import {useAppSelector, useRefreshTokensMutation} from '@/Rtk'
import {useEffect} from 'react'

export default function Profile() {
	const {accessToken, lifeTimeAccessToken, userId} = useAppSelector(state => state.jwt)
	const [refreshTokens, {isUninitialized, isLoading, isSuccess}] = useRefreshTokensMutation()
	useEffect(() => {
		if (lifeTimeAccessToken) {
			const timeoutId = setTimeout(() => refreshTokens(), lifeTimeAccessToken)
			return () => {
				clearTimeout(timeoutId)
			}
		} else {
			if (userId) refreshTokens()
		}
	}, [accessToken, refreshTokens])
	if (isLoading) return <p>Загрузка</p>
	return (
		<>
			{(!isUninitialized && isSuccess) || accessToken ? (
				<Link href={`/profile/${userId}`}>Ваш профиль</Link>
			) : (
				<Link href="/auth" additionalhrefs={['/registeration']}>
					Войти/Зарегистрироваться
				</Link>
			)}
		</>
	)
}
