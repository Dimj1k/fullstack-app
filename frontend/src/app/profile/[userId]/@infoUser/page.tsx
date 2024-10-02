import {getUserById} from '@/backendApi'
import {PropsProfile} from '../layout'

export default async function InfoUser({params: {userId}}: {params: PropsProfile['params']}) {
	const {info} = await getUserById(userId)
	return (
		<div style={{flexBasis: '40%'}}>
			<p>Пол: {info.gender}</p>
			<p>Дата рождения: {info.birthdayDate?.toLocaleDateString('ru-Ru') ?? 'не указана'}</p>
		</div>
	)
}
