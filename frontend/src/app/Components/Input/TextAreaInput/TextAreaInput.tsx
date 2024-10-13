import {HTMLProps, useId} from 'react'
import styles from './TextAreaInput.module.css'

export function TextAreaInput(props: HTMLProps<HTMLTextAreaElement>) {
	const inputId = useId()
	return (
		<div>
			{'placeholder' in props && (
				<label htmlFor={inputId}>
					<p>{props.placeholder}</p>
				</label>
			)}
			<textarea id={inputId} className={styles.textarea} {...props} />
		</div>
	)
}
