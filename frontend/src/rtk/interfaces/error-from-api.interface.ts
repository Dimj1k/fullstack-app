export interface IError {
	status: number
	data: {
		message: string
		statusCode: number
		error: string
	}
}

export function isErrorFromApi(error: unknown): error is IError {
	if (!error) return false
	if (typeof error != 'object') return false
	if ('status' in error && typeof error.status != 'string') return true
	return false
}
