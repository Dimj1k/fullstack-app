import React, {useEffect, useRef} from 'react'
import {createPortal} from 'react-dom'
import styles from './Modal.module.css'

export const Modal: React.FC<ModalProps> = ({
	children,
	closeCb,
	parent = document?.body,
	modalWidth = 400,
}) => {
	const modalRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		const content = modalRef.current
		if (!content) return
		const escapeListener = (event: KeyboardEvent) => {
			if (event.key == 'Escape' && typeof closeCb == 'function') {
				closeCb()
			}
		}
		content.scrollTo(0, content.scrollHeight)
		parent.addEventListener('keydown', escapeListener)
		return () => {
			parent.removeEventListener('keydown', escapeListener)
		}
	}, [modalRef.current, closeCb, parent])
	return createPortal(
		<div
			className={styles.modal}
			ref={modalRef}
			onClick={({target}) => {
				if (target == modalRef.current) {
					if (typeof closeCb == 'function') {
						closeCb()
					}
				}
			}}>
			<div className={styles.container} role="dialog" style={{width: modalWidth}}>
				<span
					className={styles.close}
					onClick={() => typeof closeCb == 'function' && closeCb()}
					role="button"
					tabIndex={0}
					onKeyDown={event => {
						if (event.key == 'Enter' || event.key == ' ') {
							event.preventDefault()
							if (typeof closeCb == 'function') {
								closeCb()
							}
						}
					}}
				/>
				{children}
			</div>
		</div>,
		parent,
	)
}

type ModalProps = {
	children: React.JSX.Element | React.JSX.Element[]
	closeCb?: (...args: unknown[]) => void
	parent?: HTMLElement
	modalWidth?: number
}
