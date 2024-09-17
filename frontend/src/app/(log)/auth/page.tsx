import LoginForm from './LoginForm/LoginForm'
import styles from './auth.module.css'

export default function Home() {
	return (
		<div className={styles.content}>
			<h1 className={styles.h1}>Войти в профиль</h1>
			<LoginForm />
		</div>
	)
}
