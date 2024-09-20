import {HTMLProps} from 'react'
import styles from './Input.module.css'
import {RequireKeys} from '@/Interfaces'
import cn from 'classnames'
import React from 'react'

export function Input({gridArea, onChange, ...props}: NoControllingInputProps): React.JSX.Element
export function Input({
	gridArea,
	onChange,
	value,
	valid,
	...props
}: ControllingInputProps): React.JSX.Element
export function Input({gridArea, ...props}: InputProps) {
	const prepend =
		'prepend' in props ? (
			<p>{props.prepend}</p>
		) : 'placeholder' in props ? (
			<p>{props.placeholder}</p>
		) : (
			<></>
		)
	if (isControllingInputProps(props)) {
		const {value, onChange, valid} = props
		return (
			<div style={{gridArea}}>
				{prepend}
				<input
					className={cn(styles.input, {[styles.invalid]: !valid})}
					{...props}
					onChange={onChange}
					value={value}
				/>
			</div>
		)
	}
	return (
		<div style={{gridArea}}>
			{prepend}
			<input className={styles.input} {...props} />
		</div>
	)
}

type GridArea = {
	gridArea?: string
	prepend?: string
}
type NoControllingInputProps = Omit<HTMLProps<HTMLInputElement>, 'value'> & GridArea
type ControllingInputProps = RequireKeys<HTMLProps<HTMLInputElement>, 'onChange' | 'value'> &
	GridArea & {
		valid: 1 | 0
	}
type InputProps = NoControllingInputProps | ControllingInputProps

function isControllingInputProps(inputProps: InputProps): inputProps is ControllingInputProps {
	return 'value' in inputProps && 'valid' in inputProps
}
