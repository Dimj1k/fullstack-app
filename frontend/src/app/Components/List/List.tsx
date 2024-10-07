'use client'
import {Column, Data} from '../Table/Interfaces'
import {useLayoutEffect, useRef, useState} from 'react'
import styles from '../List/List.module.css'

export function List<T extends Data>({
	data,
	columns,
	setOnItem,
	itemHeight,
	take,
}: {
	data: T[]
	columns: Column<T>[]
	setOnItem: ReturnType<typeof useState<number>>[1]
	itemHeight: number
	take: number
}) {
	take -= 2
	const [scrollTop, setScrollTop] = useState(0)
	const refOnList = useRef<HTMLDivElement>(null)
	const onElement = Math.ceil(scrollTop / itemHeight)
	const startIndex = Math.floor((onElement - 1) / take)
	useLayoutEffect(() => {
		if (!isNaN(startIndex) && startIndex >= 0) {
			setOnItem(startIndex * take)
		}
	}, [startIndex, setOnItem, take])
	return (
		<div
			data-testid="List"
			onScroll={event => {
				const target = event.target as EventTarget & HTMLDivElement
				setScrollTop(target.scrollTop)
			}}
			ref={refOnList}
			className={styles.list}
			style={{
				gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
				height: 400,
			}}>
			{columns.map((_, idx) => (
				<div
					key={idx}
					style={{
						height: startIndex * itemHeight * take,
					}}
				/>
			))}
			{columns.map(column => (
				<div key={`${column.key as string}`} className={styles.column}>
					{column.displayName}
				</div>
			))}
			{data.map(row =>
				columns.map(({key}) => {
					const value = row[key]
					return (
						<div key={`${row.rowId}-${key as string}`} className={styles.row}>
							{value}
						</div>
					)
				}),
			)}
			{/* <div
				style={{
					height: 0,
				}}>
				{!!invisibleHeight && 'Загрузка...'}
			</div> */}
		</div>
	)
}
