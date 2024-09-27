import {FormEvent, ForwardedRef, forwardRef, HTMLProps, PropsWithChildren} from 'react'
import styles from './Form.module.css'

export default forwardRef(function Forma(
	{onSubmit, children, gridTemplateAreas, ...props}: PropsWithChildren<FormProps>,
	ref: ForwardedRef<HTMLFormElement>,
) {
	return (
		<form
			ref={ref}
			onSubmit={onSubmit}
			className={styles.form}
			{...props}
			style={{gridTemplateAreas, ...props['style']}}>
			{children}
		</form>
	)
})

interface FormProps extends HTMLProps<HTMLFormElement> {
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
	gridTemplateAreas: string
}
