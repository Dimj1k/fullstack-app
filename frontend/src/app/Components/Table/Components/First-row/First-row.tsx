import {Dispatch, SetStateAction, useEffect, useMemo, useRef} from 'react'
import {setCookieOnTable} from '../../actions'
import {Column, Data, UserPosition} from '../../Interfaces'
import styles from '../../Table.module.css'
import {useChangesWindowSize} from '@/Hooks'
import cn from 'classnames'

export function FirstRow<T extends Data>({
	columns: keys,
	title,
	gridTemplateColumnsState: [gridTemplateColumns, setGridTemplateColumns],
}: {
	columns: Column<T>[]
	title: string
	gridTemplateColumnsState: [string[], Dispatch<SetStateAction<string[]>>]
}) {
	const setCookieOnThisTable = setCookieOnTable.bind(null, title)
	const arrayFirstRowRef = useRef<(HTMLDivElement | null)[]>([])
	const startXSeparators = useMemo<(number | undefined)[]>(
		() => new Array(keys.length),
		[keys.length],
	)
	const {windowWidth} = useChangesWindowSize()
	useEffect(() => {
		if (gridTemplateColumns.every(v => v == '1fr')) {
			const width = arrayFirstRowRef.current[0]?.clientWidth
			setGridTemplateColumns(new Array(keys.length).fill(width ? `${width}px` : '1fr'))
		}
	}, [keys.length])
	const onDragSeparatorStart = (event: UserPosition, separatorId: number) => {
		startXSeparators[separatorId] =
			event.clientX - (arrayFirstRowRef.current[separatorId]?.clientWidth ?? 0)
	}
	const onDragSeparator = (event: UserPosition, separatorId: number) => {
		if (event.clientX && startXSeparators[separatorId]) {
			gridTemplateColumns[separatorId] = `${event.clientX - startXSeparators[separatorId]}px`
			if (
				gridTemplateColumns.reduce((prev, curr) => prev + parseInt(curr), 0) <=
				(windowWidth || 1080)
			)
				setGridTemplateColumns([...gridTemplateColumns])
		}
	}
	return (
		<>
			<div className={styles['first-row']}></div>
			{keys.map(({key, displayName}, id) => (
				<div
					key={key as string}
					className={styles['first-row']}
					ref={ref => {
						arrayFirstRowRef.current.push(ref)
					}}>
					{displayName}
					<div
						className={cn(styles['column-separator'], {[styles.draggable]: startXSeparators[id]})}
						onTouchStart={event => onDragSeparatorStart(event.changedTouches[0], id)}
						onTouchMove={event => onDragSeparator(event.changedTouches[0], id)}
						onTouchEnd={() => {
							startXSeparators[id] = undefined
							setCookieOnThisTable(gridTemplateColumns)
						}}
						onDragStart={event => onDragSeparatorStart(event, id)}
						onDrag={event => onDragSeparator(event, id)}
						onDragEnd={() => {
							startXSeparators[id] = undefined
							setCookieOnThisTable(gridTemplateColumns)
						}}
					/>
				</div>
			))}
		</>
	)
}
