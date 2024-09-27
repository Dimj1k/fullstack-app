import {HTMLProps, useState} from 'react'
import {Input} from '../Input'
import styles from './ArrayInput.module.css'

export function ArrayInput({
	maxLength,
	add,
	name,
	...props
}: {
	maxLength?: number
	add: string
	name: string
} & HTMLProps<HTMLInputElement>) {
	maxLength ??= 10
	const [numInputs, setNumInputs] = useState(1)
	const [resValue, setResValue] = useState<Record<number, string>>({})

	const addInput = () => {
		if (maxLength > numInputs) {
			setNumInputs(state => state + 1)
		}
	}

	const deleteInput = () => {
		if (numInputs > 1) {
			setNumInputs(state => state - 1)
			delete resValue[numInputs - 1]
			setResValue(resValue)
		}
	}

	return (
		<div>
			<input type="hidden" value={Object.values(resValue)} name={name} {...props} />
			<p>{add}ы</p>
			<div className={styles['inputs-div']}>
				{Array.from({length: numInputs < maxLength ? numInputs : maxLength}, (_, id) => (
					<Input
						key={`${name}-${id}`}
						onChange={event => {
							setResValue({
								...resValue,
								[id]: (event.target as EventTarget & {value: string}).value,
							})
						}}
					/>
				))}
				{numInputs < maxLength && (
					<div
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
