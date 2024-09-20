import LoginForm from './LoginForm/LoginForm'
import styles from '../log.module.css'

export default function Home() {
	return (
		<>
			<h1 className={styles.h1}>Войти в профиль</h1>
			<LoginForm />
		</>
	)
}
