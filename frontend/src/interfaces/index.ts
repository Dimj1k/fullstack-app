import {Asserts, ISchema} from 'yup'
export type TargetType<T extends ISchema<unknown>> = EventTarget &
	Record<keyof Asserts<T>, {value: string}>

export type RequireKeys<
	T extends Record<string | number | symbol, T[keyof T]>,
	K extends keyof T,
> = Required<Pick<T, K>> & Omit<T, K>
