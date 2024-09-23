'use client'
import cn from 'classnames'
import _Link, {LinkProps} from 'next/link'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {CSSProperties, KeyboardEvent, PropsWithChildren} from 'react'
import styles from './Link.module.css'
import {Url} from 'next/dist/shared/lib/router/router'
import {paramsToUrl} from '@/Utils/url-search-params'

export default function Link({
	href,
	children,
	additionalhrefs,
	...props
}: PropsWithChildren<LinkProps & {style?: CSSProperties; additionalhrefs?: Url[]}>) {
	const pathName = usePathname()
	const router = useRouter()
	const searchParams = useSearchParams()
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
				[styles.here]:
					href == pathName + (searchParams ? paramsToUrl(searchParams) : '') ||
					href == pathName ||
					additionalhrefs?.some(v => v == pathName),
			})}
			{...props}>
			{children}
		</_Link>
	)
}
