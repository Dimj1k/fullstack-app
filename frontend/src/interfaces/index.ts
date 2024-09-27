import {Asserts, ISchema} from 'yup'
export type TargetType<T extends ISchema<unknown>> = EventTarget &
	Record<keyof Asserts<T>, {value: string}>

/* eslint-disable  @typescript-eslint/no-explicit-any */
export type RequireKeys<
	T extends Record<string | number | symbol, any>,
	K extends keyof T,
> = Required<Pick<T, K>> & Omit<T, K>

export type PickType<T, K extends keyof T> = Pick<T, K>[K]
