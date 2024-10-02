import {Centrifuge, UnauthorizedError} from 'centrifuge'
import {useAppSelector, useRefreshTokensMutation} from '@/Rtk'
import {useRouter} from 'next/navigation'
import {createContext, useEffect} from 'react'

export const CentrifugeContext = createContext<{centrifuge?: Centrifuge; userId?: string}>({})

export const useCentrifugeConnect = (replaceRouter = '/') => {
	const [refreshToken] = useRefreshTokensMutation()
	const userId = useAppSelector(state => state.jwt.userId)
	const router = useRouter()
	useEffect(() => {
		if (!userId) {
			router.replace(replaceRouter)
		}
	}, [userId])
	if (!userId) return undefined
	const centrifuge = new Centrifuge(process.env.CENTRIFUGE || '', {
		getToken: async () => {
			const {data, error} = await refreshToken()
			if (error) throw new UnauthorizedError('token не обновился')
			const [bearer, token] = data.accessToken.split(' ')
			if (!bearer || !token) throw new UnauthorizedError('token нет')
			return token
		},
		debug: true,
	})
	return centrifuge
}
