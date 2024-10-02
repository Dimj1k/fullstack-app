import {NextRequest} from 'next/server'

export const searchParams = (request: NextRequest) => {
	const url = new URL(request.url)
	return Object.fromEntries(url.searchParams.entries())
}
