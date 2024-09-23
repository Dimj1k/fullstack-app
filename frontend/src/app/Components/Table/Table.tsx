'use client'
import {useEffect, useMemo, useState} from 'react'
import styles from './Table.module.css'
import {Column, Data, isHTMLDivElement, UserPosition} from './Interfaces'
import cn from 'classnames'
import {FirstRow, SelectPage} from './Components'
import {useSearchParams} from 'next/navigation'

type MoveRow = {
	startY: number
	boundaryUp: number
	boundaryDown: number
}

export default function Table<T extends Data>({
	data,
	columns: keys,
	title,
	optionsTable,
}: {
	data: T[]
	columns: Column<T>[]
	title: string
	optionsTable?: string[]
}) {
	const gridTemplateColumnsState = useState<string[]>(
		!optionsTable ? new Array(keys.length).fill('1fr') : optionsTable,
	)
	const [startDragRow, setStartDragRow] = useState<(MoveRow | undefined)[]>(
		new Array(data.length).fill(undefined),
	)
	const searchParams = useSearchParams()
	const maxSiblings = useMemo<number[]>(() => ({...new Array(data.length).fill(0)}), [data.length])
	const [orderData, setOrderData] = useState<T[]>(data)
	useEffect(() => setOrderData(data), [searchParams])
	if (!data) return <></>
	const onDragStartRow = (event: UserPosition, idRow: number) => {
		if (!('clientHeight' in event.target)) return
		const {clientHeight} = event.target
		startDragRow[idRow] = {
			startY: event.clientY,
			boundaryDown: (data.length - idRow - 1) * clientHeight + 10,
			boundaryUp: -idRow * clientHeight - 10,
		}
		setStartDragRow([...startDragRow])
	}
	const onDragRow = (event: UserPosition, idRow: number) => {
		if (!startDragRow[idRow] || !('clientHeight' in event.target)) return
		const {clientY, target} = event
		if (!clientY) return
		const rowHeight = target.clientHeight
		const {startY, boundaryDown, boundaryUp} = startDragRow[idRow]
		const diff = clientY - startY
		const maxElSibling = diff > 0 ? Math.floor(diff / rowHeight) : Math.ceil(diff / rowHeight)
		const isInBoundaries = boundaryDown >= diff && boundaryUp <= diff
		let sibling: Element | HTMLElement | null = target.parentElement
		if (isInBoundaries && sibling) {
			if (maxElSibling > 0) {
				if (maxSiblings[idRow] <= maxElSibling) {
					maxSiblings[idRow] = maxElSibling
					for (let elSibling = 0; elSibling != maxElSibling; elSibling++) {
						if (sibling) {
							sibling = sibling.nextElementSibling
						} else {
							break
						}
					}
					if (sibling) {
						sibling.childNodes.forEach(node => {
							if (isHTMLDivElement(node)) node.style.transform = `translate(0, ${-rowHeight}px)`
						})
					}
				} else {
					maxSiblings[idRow] = maxElSibling
					for (let elSibling = 0; elSibling != maxElSibling + 1; elSibling++) {
						if (sibling) {
							sibling = sibling.nextElementSibling
						} else {
							break
						}
					}
					if (sibling) {
						sibling.childNodes.forEach(node => {
							if (isHTMLDivElement(node)) node.style.transform = ''
						})
					}
				}
			} else if (maxElSibling < 0) {
				if (maxSiblings[idRow] >= maxElSibling) {
					maxSiblings[idRow] = maxElSibling
					for (let elSibling = 0; elSibling != maxElSibling; elSibling--) {
						if (sibling) {
							sibling = sibling.previousElementSibling
						} else {
							break
						}
					}
					if (sibling) {
						sibling.childNodes.forEach(node => {
							if (isHTMLDivElement(node)) node.style.transform = `translate(0, ${rowHeight}px)`
						})
					}
				} else {
					maxSiblings[idRow] = maxElSibling
					for (let elSibling = 0; elSibling != maxElSibling - 1; elSibling--) {
						if (sibling) {
							sibling = sibling.previousElementSibling
						} else {
							break
						}
					}
					if (sibling) {
						sibling.childNodes.forEach(node => {
							if (isHTMLDivElement(node)) node.style.transform = ''
						})
					}
				}
			} else if (maxElSibling == 0) {
				maxSiblings[idRow] = maxElSibling
				if (sibling.previousElementSibling)
					sibling.previousElementSibling.childNodes.forEach(node => {
						if (isHTMLDivElement(node)) node.style.transform = ''
					})
				if (sibling.nextElementSibling)
					sibling.nextElementSibling.childNodes.forEach(node => {
						if (isHTMLDivElement(node)) node.style.transform = ''
					})
			}
			target.parentElement?.childNodes.forEach(node => {
				if (isHTMLDivElement(node)) node.style.transform = `translate(0, ${diff}px)`
			})
		} else if (isInBoundaries) {
			target.parentElement?.childNodes.forEach(node => {
				if (isHTMLDivElement(node)) node.style.transform = `translate(0, ${diff}px)`
			})
		}
	}
	const onDragEndRow = (event: UserPosition, idRow: number) => {
		if (!('parentElement' in event.target)) return
		const {parentElement} = event.target
		const dragged = maxSiblings[idRow]
		if (!dragged) {
			startDragRow[idRow] = undefined
			maxSiblings[idRow] = 0
			parentElement?.childNodes.forEach(node => {
				if (isHTMLDivElement(node)) node.style.transform = ''
			})
			setStartDragRow([...startDragRow])
			return
		}
		let sibling: Element | HTMLElement | null | undefined = parentElement
		if (dragged > 0) {
			for (let drag = 0; drag != dragged; drag++) {
				sibling = sibling?.nextElementSibling
				if (sibling) {
					sibling.childNodes.forEach(node => {
						if (isHTMLDivElement(node)) node.style.transform = ''
					})
				}
			}
		} else {
			for (let drag = 0; drag != dragged; drag--) {
				sibling = sibling?.previousElementSibling
				if (sibling) {
					sibling.childNodes.forEach(node => {
						if (isHTMLDivElement(node)) node.style.transform = ''
					})
				}
			}
		}
		let affectedData: T[]
		if (dragged > 0) {
			affectedData = orderData.slice(idRow, dragged + idRow + 1)
			affectedData = orderData.slice(0, idRow).concat(
				affectedData
					.splice(1)
					.concat(affectedData)
					.concat(orderData.slice(dragged + idRow + 1)),
			)
		} else {
			affectedData = orderData.slice(dragged + idRow, idRow + 1)
			affectedData = orderData.slice(0, dragged + idRow).concat(
				affectedData
					.splice(-1)
					.concat(affectedData)
					.concat(orderData.slice(idRow + 1)),
			)
		}
		startDragRow[idRow] = undefined
		maxSiblings[idRow] = 0
		parentElement?.childNodes.forEach(node => {
			if (isHTMLDivElement(node)) node.style.transform = ''
		})
		setOrderData([...affectedData])
		setStartDragRow([...startDragRow])
	}
	return (
		<>
			<h1>{title}</h1>
			<div
				className={styles.table}
				style={{gridTemplateColumns: `30px ${gridTemplateColumnsState[0].join(' ')}`}}>
				<FirstRow title={title} keys={keys} gridTemplateColumnsState={gridTemplateColumnsState} />
				{orderData.map((v, idx) => (
					<div
						key={v.rowId}
						className={cn(styles['row-wrapper'], {[styles.draggable]: startDragRow[idx]})}>
						<div
							className={cn(styles.cell)}
							onDragStart={event => onDragStartRow(event, idx)}
							onDrag={event => onDragRow(event, idx)}
							onDragEnd={event => onDragEndRow(event, idx)}
							onTouchStart={event => onDragStartRow(event.touches[0], idx)}
							onTouchMove={event => onDragRow(event.touches[0], idx)}
							onTouchEnd={event => onDragEndRow(event.changedTouches[0], idx)}
							draggable>
							::
						</div>
						{keys.map(({key}) => {
							const value = v[key]
							return (
								<div key={`${v.rowId}-${key as string}`} className={styles.cell}>
									{Array.isArray(value) ? value.join(',') : value}
								</div>
							)
						})}
					</div>
				))}
			</div>
			<SelectPage datalength={4} />
		</>
	)
}
