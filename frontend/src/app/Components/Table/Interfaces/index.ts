import {MouseEvent} from 'react'

export interface Column<T extends Data> {
	key: keyof T
	displayName: string
}
export type Data = {
	rowId: string | number
	[k: string]: ValueRecord | ValueRecord[] | React.JSX.Element
}
export type ValueRecord = string | number | boolean
type UserPositionWithoutTarget = Pick<MouseEvent<HTMLDivElement>, 'clientX' | 'clientY' | 'target'>
export type UserPosition = UserPositionWithoutTarget & {
	target: EventTarget | (EventTarget & HTMLDivElement)
}

export function isHTMLDivElement(node: ChildNode | HTMLDivElement): node is HTMLDivElement {
	return 'style' in node
}
