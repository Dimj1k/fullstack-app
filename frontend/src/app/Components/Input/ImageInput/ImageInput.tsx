import {FormEvent, HTMLProps, memo, useRef, useState} from 'react'
import styles from './ImageInput.module.css'
import stylesButton from '../ArrayInput/ArrayInput.module.css'
import Image from 'next/image'
import {RequireKeys} from '@/Interfaces'

export const ImageInput = memo(function ImageInput(
	props: RequireKeys<HTMLProps<HTMLInputElement>, 'name'>,
) {
	const [image, setImage] = useState<File | null>(null)
	const ref = useRef<HTMLInputElement | null>(null)

	const onChange = (event: FormEvent<HTMLInputElement>) => {
		const image = (event.target as EventTarget & HTMLInputElement).files?.[0]
		if (!image) return setImage(null)
		setImage(image)
	}
	return (
		<div className={styles['image-div']}>
			<label
				htmlFor="image-uploads"
				role="button"
				className={stylesButton.button}
				tabIndex={0}
				onKeyDown={event => {
					if (event.key == ' ' || event.key == 'Enter') {
						event.preventDefault()
						ref.current?.click()
					}
				}}>
				Выберите изображение
			</label>
			<input
				type="file"
				ref={ref}
				onChange={onChange}
				accept="image/png, image/jpeg, image/gif, image/webp"
				id="image-uploads"
				className={styles['image-uploads']}
				{...props}
			/>

			{image && (
				<div className={styles['image-info']}>
					<p>
						Название изображения {returnFileName(image.name)}
						<br />
						Размер изображения {returnFileSize(image.size)}
					</p>
					<Image
						src={URL.createObjectURL(image)}
						alt="Ваше изображение обложки"
						width={64}
						height={64}
						priority={true}
					/>
				</div>
			)}
		</div>
	)
})

function returnFileSize(fileSize: number) {
	if (fileSize < 1 << 10) {
		return fileSize + 'Б'
	}
	if (fileSize > 1 << 10 && fileSize < 1 << 20) {
		return (fileSize / (1 << 10)).toFixed(1) + 'КБ'
	}
	if (fileSize > 1 << 20) {
		return (fileSize / (1 << 20)).toFixed(1) + 'МБ'
	}
}

function returnFileName(fileName: string) {
	const {length} = fileName
	if (length - 3 < 10) return fileName
	return fileName.slice(0, 4) + '...' + fileName.slice(-3)
}
