export function paramsToUrl(
	params: Record<string, string | number | string[] | number[] | undefined> | URLSearchParams,
) {
	if (params instanceof URLSearchParams) {
		return '?' + params.toString()
	}
	const urlSearchParams = new URLSearchParams()
	for (const key of Object.keys(params)) {
		const param = params[key]
		if (!param) continue
		if (Array.isArray(param)) {
			param.map(v => urlSearchParams.append(key, v.toString()))
		} else {
			urlSearchParams.append(key, param.toString())
		}
	}
	return '?' + urlSearchParams.toString()
}
