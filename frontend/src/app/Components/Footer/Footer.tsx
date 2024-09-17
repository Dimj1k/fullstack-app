import cn from 'classnames'
import styles from '../Header/Header.module.css'
import stylesFooter from './Footer.module.css'

export default function Footer() {
	return (
		<footer className={cn(styles.header, stylesFooter.footer)}>
			<div className={styles.content}>
				<p>
					Саратов Дмитрий Александрович
					<br />
					Тамбов 2024.
				</p>
			</div>
		</footer>
	)
}
