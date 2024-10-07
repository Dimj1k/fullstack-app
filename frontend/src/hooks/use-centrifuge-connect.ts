import {Centrifuge, UnauthorizedError} from 'centrifuge'
import {useAppSelector, useRefreshTokensMutation} from '@/Rtk'
import {useRouter} from 'next/navigation'
import {createContext, useEffect, useMemo} from 'react'

export const CentrifugeContext = createContext<{centrifuge?: Centrifuge; userId?: string}>({})

export const useCentrifugeConnect = (replaceRouter = '/') => {
	const [refreshToken] = useRefreshTokensMutation()
	const userId = useAppSelector(state => state.jwt.userId)
	const router = useRouter()
	const centrifuge = useMemo(
		() =>
			userId
				? new Centrifuge(process.env.CENTRIFUGE || '', {
						getToken: async () => {
							const {data, error} = await refreshToken()
							if (error) throw new UnauthorizedError('token не обновился')
							const [bearer, token] = data.accessToken.split(' ')
							if (!bearer || !token) throw new UnauthorizedError('token нет')
							return token
						},
						debug: true,
					})
				: undefined,
		[userId, refreshToken],
	)
	useEffect(() => {
		if (centrifuge) {
			centrifuge.connect()
		} else {
			router.replace(replaceRouter)
		}
		return () => {
			if (centrifuge) {
				centrifuge.disconnect()
			}
		}
	}, [centrifuge, router, replaceRouter])
	return centrifuge
}
