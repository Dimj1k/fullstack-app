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
	return error && typeof error == 'object' && 'error' in error
}
