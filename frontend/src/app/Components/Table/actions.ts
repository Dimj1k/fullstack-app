'use server'

import {cookies} from 'next/headers'
import {nodeTranslite} from '@/Utils'

export async function setCookieOnTable(titleTable: string, gridTemplateColumns: string[]) {
	cookies().set(`table-${nodeTranslite(titleTable)}`, gridTemplateColumns.join('-'), {
		expires: Date.now() + 60e3 * 60 * 24 * 30,
		secure: false,
		sameSite: 'lax',
		priority: 'low',
	})
}

export async function getCookiesOnTable(titleTable: string) {
	return cookies()
		.get(`table-${nodeTranslite(titleTable)}`)
		?.value.split('-')
}
