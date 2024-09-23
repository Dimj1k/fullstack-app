import {Suspense, useState} from 'react'
import styles from './Select-page.module.css'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import Link from '../../../Link/Link'
import {paramsToUrl} from '@/Utils/url-search-params'

export function SelectPage({datalength}: {datalength: number}) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const router = useRouter()
	const [take, setTake] = useState(Number(searchParams.get('take')) ?? 5)
	const pages = new Array(Math.ceil(datalength / take)).fill(<></>)
	return (
		<Suspense fallback={<p>Загрузка...</p>}>
			<div className={styles.pages}>
				{pages.map((v, page) => (
					<Link
						replace={true}
						key={page}
						href={`${pathname}${paramsToUrl({page: page + 1, take})}`}
						here={searchParams.get('page') === `${page + 1}`}
						prefetch={false}>
						<div className={styles['div-page']}>{page + 1}</div>
					</Link>
				))}
				<select
					className={styles.select}
					defaultValue={`${take}`}
					onChange={event => {
						const newTake = +event.target.value
						const page = Number(searchParams.get('page')) ?? 1
						const newPage = Math.ceil((page * take) / newTake)
						router.push(
							`${pathname}${paramsToUrl({page: newPage * newTake > datalength ? Math.ceil(datalength / newTake) : newPage, take: event.target.value})}`,
						)
						setTake(+event.target.value)
					}}>
					<option value="1">1 / page</option>
					<option value="2">2 / page</option>
					<option value="3">3 / page</option>
					<option value="5">5 / page</option>
					<option value="10">10 / page</option>
				</select>
			</div>
		</Suspense>
	)
}
