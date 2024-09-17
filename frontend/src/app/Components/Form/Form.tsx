'use client'
import {FormEvent, HTMLProps, PropsWithChildren} from 'react'
import styles from './Form.module.css'

export default function Forma({
	onSubmit,
	children,
	gridTemplateAreas,
	...props
}: PropsWithChildren<FormProps>) {
	return (
		<form onSubmit={onSubmit} className={styles.form} style={{gridTemplateAreas}} {...props}>
			{children}
		</form>
	)
}

interface FormProps extends HTMLProps<HTMLFormElement> {
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
	gridTemplateAreas: string
}
