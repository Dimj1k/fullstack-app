import {NextRequest} from 'next/server'
import {addChannel} from './function'

export async function POST(request: NextRequest) {
	const users = (await request.json()) as string[]
	return addChannel(...users)
}
