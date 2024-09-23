'use client'
import cn from 'classnames'
import _Link, {LinkProps} from 'next/link'
import {usePathname, useRouter} from 'next/navigation'
import {CSSProperties, KeyboardEvent, PropsWithChildren} from 'react'
import styles from './Link.module.css'
import {Url} from 'next/dist/shared/lib/router/router'

export default function Link({
	href,
	children,
	additionalhrefs,
	here,
	...props
}: PropsWithChildren<
	LinkProps & {style?: CSSProperties; additionalhrefs?: Url[]; here?: boolean}
>) {
	const pathName = usePathname()
	const router = useRouter()
	const onKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
		if (e.key == ' ' || e.key == 'Enter') {
			e.preventDefault()
			router.push(href as string)
		}
	}
	return (
		<_Link
			href={href}
			onKeyDown={onKeyDown}
			className={cn(styles.link, {
				[styles.here]: href == pathName || additionalhrefs?.some(v => v == pathName) || here,
			})}
			{...props}>
			{children}
		</_Link>
	)
}
