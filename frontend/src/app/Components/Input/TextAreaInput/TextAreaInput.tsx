import {HTMLProps} from 'react'
import styles from './TextAreaInput.module.css'

export function TextAreaInput(props: HTMLProps<HTMLTextAreaElement>) {
	return (
		<div>
			{'placeholder' in props && <p>{props.placeholder}</p>}
			<textarea className={styles.textarea} {...props} />
		</div>
	)
}
