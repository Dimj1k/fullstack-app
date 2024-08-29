import { CacheUser, CacheUserInfo } from './register.entity'
import { TempUrl } from './temp-url.entity'
import { Token } from './token.entity'

export * from './register.entity'
export * from './temp-url.entity'
export * from './token.entity'

export const MONGO_ENTITIES = [CacheUser, CacheUserInfo, Token, TempUrl]
