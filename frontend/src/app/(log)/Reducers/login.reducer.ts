import {Asserts} from 'yup'
import {loginSchema} from '../Schemas'

export const enum TypeActions {
	onChangeEmail,
	onChangePassword,
}
type State = Partial<Asserts<typeof loginSchema>>
type Actions = {type: TypeActions; payload: Partial<State>}

export function loginReducer(
	state: State & {isValid: Record<keyof State, boolean>},
	{type, payload}: Actions,
): State & {isValid: Record<keyof State, boolean>} {
	switch (type) {
		case TypeActions.onChangeEmail:
			const {email} = payload
			return {
				...state,
				email,
				isValid: {
					...state.isValid,
					email: email ? loginSchema.pick(['email']).isValidSync({email}) : true,
				},
			}
		case TypeActions.onChangePassword:
			const {password} = payload
			return {
				...state,
				password,
				isValid: {
					...state.isValid,
					password: password ? loginSchema.pick(['password']).isValidSync({password}) : true,
				},
			}
		default:
			throw Error(
				'Обнаружен неизвестный тип действия: ' + (type satisfies never) + ' в функции loginReducer',
			)
	}
}
