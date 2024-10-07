import {type NextRequest, NextResponse} from 'next/server'
import {getChannelsByUserId} from './function'
import {searchParams} from '../../utils'

export async function GET(request: NextRequest) {
	const {userId} = searchParams(request)
	if (!userId) return NextResponse.json({error: 'Bad Request'}, {status: 400})
	return getChannelsByUserId(userId)
}
