'use client'

import Error from 'next/error'

export default function Error500({reset}: {error: Error; reset: () => void}) {
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<h1>
				Что-то произошло не так
				<br />
				Ошибка 500
			</h1>
			<button onClick={reset}>Попробовать загрузить страницу снова</button>
		</div>
	)
}
