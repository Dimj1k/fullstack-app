'use client'
import {TypesNotification, type useRegisterationConfirmMutation} from '@/Rtk'
import Forma from '@/app/Components/Form/Form'
import {FormEvent, HTMLProps, useCallback, useRef} from 'react'
import Button from '@/app/Components/Button/Button'
import {useNotification} from '@/Hooks'
import {CodeInput} from '@/app/Components/CodeInput/CodeInput'

export default function CodeForm({
	sendCode,
	isLoading,
	length = 6,
	...props
}: {
	sendCode: ReturnType<typeof useRegisterationConfirmMutation>[0]
	isLoading: boolean
	length?: number
} & HTMLProps<HTMLInputElement>) {
	const showNotification = useNotification()
	const ref = useRef<HTMLFormElement>(null)

	const onSubmit = useCallback(
		(event?: FormEvent<HTMLFormElement>, pastedCode?: string) => {
			if (event) event.preventDefault()
			if (pastedCode) {
				if (pastedCode.length == length) sendCode({code: pastedCode})
				return
			}
			const childs = ref.current?.childNodes
			if (!childs) return
			const code = Array.from(
				{length},
				(_, idx) => (childs.item(idx) as HTMLInputElement).value,
			).join('')
			if (code.length == length) sendCode({code})
			else
				showNotification({
					typeNotification: TypesNotification.WARNING,
					messages: 'Вы ввели не шестизначный код',
				})
		},
		[length],
	)
	return (
		<>
			<h1>Введите полученный шестизначный код регистрации</h1>
			<Forma gridTemplateAreas={`"a b c d e f""g g g g g g"`} onSubmit={onSubmit} ref={ref}>
				<CodeInput length={length} submit={onSubmit} isLoading={isLoading} />
				<Button gridArea="g" role="row" disabled={isLoading}>
					Отправить код регистрации
				</Button>
			</Forma>
		</>
	)
}
