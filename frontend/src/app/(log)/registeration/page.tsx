'use client'
import {RootState, useRegisterationConfirmMutation, useRegisterationMutation} from '@/Rtk'
import styles from '../log.module.css'
import RegistrationForm from './RegistrationForm/RegistrationForm'
import {useEffect, useState} from 'react'
import Button from '../../Components/Button/Button'
import CodeForm from './CodeForm/CodeForm'
import {useRouter} from 'next/navigation'
import {useSelector} from 'react-redux'

export default function Home() {
	const [
		sendRegisteration,
		{isSuccess: isSuccessRegisteration, isLoading: isLoadingRegisteration},
	] = useRegisterationMutation()
	const accessToken = useSelector((state: RootState) => state.jwt.accessToken)
	const [sendCode, {isSuccess: isSuccessCode, isLoading: isLoadingCode}] =
		useRegisterationConfirmMutation()
	const [toCode, switchToCode] = useState(false)
	const router = useRouter()
	useEffect(() => {
		if (accessToken) router.push('/profile')
		if (isSuccessCode) router.push('/auth')
	}, [isSuccessCode, accessToken, router])
	return (
		<>
			<h1 className={styles.h1}>Регистрация профиля</h1>
			{(!toCode && !isSuccessRegisteration && (
				<RegistrationForm
					sendRegisteration={sendRegisteration}
					isLoading={isLoadingRegisteration || isLoadingCode}
				/>
			)) ||
				((toCode || isSuccessRegisteration) && (
					<CodeForm isLoading={isLoadingCode} sendCode={sendCode} />
				))}
			{!isSuccessRegisteration && (
				<Button onClick={() => switchToCode(state => !state)}>
					{!toCode ? 'У меня есть код регистрации' : 'У меня нет кода регистрации'}
				</Button>
			)}
		</>
	)
}
