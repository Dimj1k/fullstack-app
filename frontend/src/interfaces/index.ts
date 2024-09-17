import {Asserts, ISchema} from 'yup'
/* eslint-disable @typescript-eslint/no-explicit-any */
export type TargetType<T extends ISchema<any>> = EventTarget &
	Record<keyof Asserts<T>, {value: string}>

export type Equal<X, Y> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false
export type Expect<T extends true> = T
/* eslint-disable @typescript-eslint/no-explicit-any */
export type RequireKeys<
	T extends Record<string | number | symbol, any>,
	K extends keyof T,
> = Required<Pick<T, K>> & Omit<T, K>
