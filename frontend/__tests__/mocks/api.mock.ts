import {setupServer} from 'msw/node'
import {DefaultBodyType, http, HttpResponse, StrictRequest} from 'msw'
import {mockBooks} from './data/books.mock'
import {IncomingMessage} from 'http'

const api = process.env.API
export const handlers = [
	http.get(`${api}/users/me`, () => {
		return HttpResponse.json({
			roles: ['USER', 'ADMIN'],
		})
	}),
	http.get(`${api}/books/find-all`, ({request}) => {
		const {skip, take} = searchParams(request)
		return HttpResponse.json(mockBooks.slice(+skip, +skip + +take))
	}),
]

export const mockServer = () => {
	const server = setupServer(...handlers)

	beforeAll(() => server.listen({onUnhandledRequest: 'warn'}))
	afterEach(() => {
		server.events.removeAllListeners()
		server.resetHandlers()
	})
	afterAll(() => server.close())

	return server
}

export const searchParams = (request: StrictRequest<DefaultBodyType>) => {
	const url = new URL(request.url)
	return Object.fromEntries(url.searchParams.entries())
}
