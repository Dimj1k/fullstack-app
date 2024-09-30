'use client'
import {useSelector} from 'react-redux'
import Link from '../Link/Link'
import {RootState, useRefreshTokensMutation} from '@/Rtk'
import {useEffect} from 'react'

export default function Profile() {
	const {accessToken, lifeTimeAccessToken, userId} = useSelector((state: RootState) => state.jwt)
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
