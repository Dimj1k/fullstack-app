'use client'
import {ForwardedRef, forwardRef, HTMLProps, useState} from 'react'
import {RequireKeys} from '@/Interfaces'

export default forwardRef(function CodeInput(
	{onKeyDown, ...props}: CodeInputProps,
	ref: ForwardedRef<HTMLInputElement>,
) {
	const [codeValue, setCodeValue] = useState<string>('')
	const numbers = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
	return (
		<input
			onChange={() => {}}
			onKeyDown={event => {
				const {key} = event
				if (key.includes('Arrow')) {
					onKeyDown(event)
				} else if (key == 'Delete' || key == 'Backspace') {
					setCodeValue('')
					onKeyDown(event)
				} else if (numbers.has(key)) {
					setCodeValue(event.key)
					onKeyDown(event)
				}
			}}
			value={codeValue}
			ref={ref}
			{...props}
		/>
	)
})

interface CodeInputProps extends RequireKeys<HTMLProps<HTMLInputElement>, 'onKeyDown'> {}
