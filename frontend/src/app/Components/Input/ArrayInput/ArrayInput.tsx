import {HTMLProps, useState} from 'react'
import {Input} from '../Input'
import styles from './ArrayInput.module.css'

export function ArrayInput({
	maxLength = 10,
	add,
	name,
	...props
}: {
	maxLength?: number
	add: string
	name: string
} & HTMLProps<HTMLInputElement>) {
	const [numInputs, setNumInputs] = useState(1)
	const [resValue, setResValue] = useState<string[]>([''])

	const addInput = () => {
		if (maxLength > numInputs) {
			setNumInputs(state => state + 1)
			setResValue(state => [...state, ''])
		}
	}

	const deleteInput = () => {
		if (numInputs > 1) {
			setNumInputs(state => state - 1)
			setResValue(resValue.filter((_, idx) => idx !== numInputs - 1))
		}
	}

	return (
		<div>
			<input type="hidden" value={resValue} name={name} {...props} />
			<p>{add}ы</p>
			<div className={styles['inputs-div']}>
				{Array.from({length: numInputs < maxLength ? numInputs : maxLength}, (_, id) => (
					<Input
						key={`${name}-${id}`}
						onChange={event => {
							const target = event.target as EventTarget & HTMLInputElement
							setResValue(resValue.map((v, idx) => (idx === id ? target.value : v)))
						}}
					/>
				))}
				{numInputs < maxLength && (
					<div
						role="button"
						className={styles.button}
						tabIndex={0}
						onKeyDown={event => {
							if (event.key == ' ' || event.key == 'Enter') {
								event.preventDefault()
								addInput()
							}
						}}
						onClick={addInput}>
						Добавить {add.toLowerCase()}
					</div>
				)}
				{numInputs !== 1 && (
					<div
						role="button"
						className={styles.button}
						tabIndex={0}
						onKeyDown={event => {
							if (event.key == ' ' || event.key == 'Enter') {
								event.preventDefault()
								deleteInput()
							}
						}}
						onClick={deleteInput}>
						Удалить {add.toLowerCase()}
					</div>
				)}
			</div>
		</div>
	)
}
