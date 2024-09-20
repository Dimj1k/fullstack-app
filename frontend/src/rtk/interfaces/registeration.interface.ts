import {ILogin} from './auth.interface'

export enum Gender {
	MALE,
	FEMALE,
	UNKNOWN,
}

export interface IRegisteration extends ILogin {
	passwordConfirm: string
	birthdayDate?: Date
	gender: Gender
}

export interface IMessage {
	message: string
}

export interface ICode {
	code: string
}
