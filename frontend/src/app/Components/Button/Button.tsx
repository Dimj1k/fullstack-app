import {HTMLProps, PropsWithChildren} from 'react'

export default function Button({children, gridArea, ...props}: PropsWithChildren<ButtonProps>) {
	return (
		<button style={{gridArea}} {...props}>
			{children}
		</button>
	)
}

interface ButtonProps extends HTMLProps<HTMLButtonElement> {
	type?: 'reset' | 'submit' | 'button'
	gridArea?: string
}
