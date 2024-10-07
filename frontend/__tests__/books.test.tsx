import {cleanup, findByText, fireEvent, render, RenderResult, screen} from '@testing-library/react'
import BooksPage from '@/app/books/page'
import StoreProvider from '../src/Rtk/provider'
import {mockServer, searchParams} from './mocks/api.mock'
import {mockBooks} from './mocks/data/books.mock'
import {authApi, baseApi, store} from '../src/Rtk'

const getTakeAndSkip = () => {
	return new Promise<{take: string; skip: string}>(resolve => {
		server.events.on('request:start', ({request}) => {
			resolve(searchParams(request.clone()) as {take: string; skip: string})
		})
	})
}

jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
	}),
	usePathname: () => ({}),
}))

const server = mockServer()

let booksPage: RenderResult
beforeEach(() => {
	store.dispatch(authApi.endpoints.me.initiate())
	booksPage = render(
		<StoreProvider>
			<BooksPage />
		</StoreProvider>,
	)
})

afterEach(() => {
	store.dispatch(baseApi.util.resetApiState())
	cleanup()
})

describe('Запрос книг', () => {
	test('Книги загружены', async () => {
		const {take} = await getTakeAndSkip()
		const book0 = await booksPage.findByText(mockBooks[0].name_book)
		expect(book0).toBeInTheDocument()
		const list = book0.parentElement
		const totalColumns = parseInt(list?.style.gridTemplateColumns.replace('repeat(', '') ?? '4')
		const totalItems = (+take + 1) * totalColumns
		expect([totalItems, totalItems + totalColumns]).toContain(list?.childNodes.length)
	})
	test('Прокрутка списка вниз', async () => {
		const {take: beginTake} = await getTakeAndSkip()
		expect(await booksPage.findByText(mockBooks[0].name_book)).toBeInTheDocument()
		expect(screen.queryByText(mockBooks[+beginTake - 1].name_book)).toBeInTheDocument()
		const list = booksPage.getByTestId('List')
		fireEvent.scroll(list, {target: {scrollTop: (+beginTake - 1) * 300}})
		const {take: endTake, skip} = await getTakeAndSkip()
		const bookEnd = await booksPage.findByText(mockBooks[+endTake + +skip - 1].name_book)
		expect(booksPage.queryByText(mockBooks[0].name_book)).not.toBeInTheDocument()
		booksPage.getByText(mockBooks[+beginTake - 1].name_book)
		expect(bookEnd).toBeInTheDocument()
	})
	test('Прокрутка списка вниз и вверх', async () => {
		const {take: beginTake} = await getTakeAndSkip()
		await booksPage.findByText(mockBooks[0].name_book)
		const list = booksPage.getByTestId('List')
		fireEvent.scroll(list, {target: {scrollTop: (+beginTake - 1) * 300}})
		const {take: endTake, skip} = await getTakeAndSkip()
		const bookEnd = await booksPage.findByText(mockBooks[+endTake + +skip - 1].name_book)
		expect(bookEnd).toBeInTheDocument()
		fireEvent.scroll(list, {target: {scrollTop: (+beginTake - 2) * 300}})
		await booksPage.findByText(mockBooks[0].name_book)
		expect(booksPage.queryByText(mockBooks[+endTake + +skip - 1].name_book)).not.toBeInTheDocument()
	})
})
