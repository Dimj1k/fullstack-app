import type {UUID} from 'crypto'

const enum UserRoles {
	USER = 'USER',
	ADMIN = 'ADMIN',
}

export interface IAuth {
	accessToken: string
	refreshToken: string
	lifeTimeAccessToken: number
	userId: UUID
}

export interface ILogin {
	email: string
	password: string
}

export interface InfoUser {
	userId: UUID
	email: string
	roles: UserRoles[]
}
