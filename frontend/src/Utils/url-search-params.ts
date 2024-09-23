export function paramsToUrl(params: Record<string, string | number> | URLSearchParams) {
	if (params instanceof URLSearchParams) {
		return '?' + new URLSearchParams(params).toString()
	}
	const paramsWithoutNumbers: Record<string, string> = {}
	for (const key in params) {
		paramsWithoutNumbers[key] = `${params[key]}`
	}
	return '?' + new URLSearchParams(paramsWithoutNumbers).toString()
}
