import {Equal, Expect} from '@/interfaces'
import loginSchema from './login.schema'
import {Asserts} from 'yup'

export const enum TypeActions {
	onChangeEmail,
	onChangePassword,
}
type State = Partial<Asserts<typeof loginSchema>>
type Actions = {type: TypeActions; payload: Partial<State>}

export default function LoginReducer(
	state: State & {isValid: Record<keyof State, boolean>},
	action: Actions,
): State & {isValid: Record<keyof State, boolean>} {
	switch (action.type) {
		case TypeActions.onChangeEmail:
			const {email} = action.payload
			return {
				...state,
				email,
				isValid: {
					...state.isValid,
					email: email ? loginSchema.pick(['email']).isValidSync({email}) : true,
				},
			}
		case TypeActions.onChangePassword:
			const {password} = action.payload
			return {
				...state,
				password,
				isValid: {
					...state.isValid,
					password: password ? loginSchema.pick(['password']).isValidSync({password}) : true,
				},
			}
		default:
			type maybeNever = typeof action.type
			/* eslint-disable @typescript-eslint/no-unused-vars */
			type isNever = Expect<Equal<maybeNever, never>>
			return state
	}
}
