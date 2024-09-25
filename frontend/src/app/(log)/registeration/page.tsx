'use client'
import {RootState, useRegisterationConfirmMutation, useRegisterationMutation} from '@/Rtk'
import RegistrationForm from './RegistrationForm/RegistrationForm'
import {useEffect, useState} from 'react'
import Button from '../../Components/Button/Button'
import {useRouter} from 'next/navigation'
import {useSelector} from 'react-redux'
import dynamic from 'next/dynamic'

const LazyCodeForm = dynamic(() => import('./CodeForm/CodeForm'), {
	loading: () => <p>Загрузка...</p>,
})

export default function PageRegisteration() {
	const [
		sendRegisteration,
		{isSuccess: isSuccessRegisteration, isLoading: isLoadingRegisteration},
	] = useRegisterationMutation()
	const userId = useSelector((state: RootState) => state.jwt.userId)
	const [sendCode, {isSuccess: isSuccessCode, isLoading: isLoadingCode}] =
		useRegisterationConfirmMutation()
	const [toCode, switchToCode] = useState(false)
	const router = useRouter()
	useEffect(() => {
		if (userId) router.replace('/')
		if (isSuccessCode) router.replace('/auth')
	}, [isSuccessCode, userId, router])
	return (
		<>
			<h1>Регистрация профиля</h1>
			{(!toCode && !isSuccessRegisteration && (
				<RegistrationForm
					sendRegisteration={sendRegisteration}
					isLoading={isLoadingRegisteration || isLoadingCode}
				/>
			)) ||
				((toCode || isSuccessRegisteration) && (
					<LazyCodeForm isLoading={isLoadingCode} sendCode={sendCode} />
				))}
			{!isSuccessRegisteration && (
				<Button onClick={() => switchToCode(state => !state)}>
					{!toCode ? 'У меня есть код регистрации' : 'У меня нет кода регистрации'}
				</Button>
			)}
		</>
	)
}
