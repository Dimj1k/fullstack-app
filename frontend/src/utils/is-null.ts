export function isNull(value: unknown) {
	return !value && typeof value == 'object'
}
