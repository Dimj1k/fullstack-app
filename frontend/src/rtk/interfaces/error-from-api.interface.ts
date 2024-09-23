export interface IError {
	error: {
		status: number
		data: {
			message: string
			statusCode: number
			error: string
		}
	}
}

export function isErrorFromApi(error: unknown): error is IError {
	if (!error) return false
	if (typeof error != 'object') return false
	if ('status' in error) return false
	if ('error' in error) {
		if (error.error && typeof error.error == 'object' && 'status' in error.error) {
			return typeof error.error.status != 'string'
		}
	}
	return false
}
