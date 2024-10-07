import {FormEvent, HTMLProps} from 'react'
import Form from '@/app/Components/Form/Form'
import {Input} from '@/app/Components/Input'
import Button from '@/app/Components/Button/Button'

export const AddChannel: React.FC<
	HTMLProps<HTMLFormElement> & {
		onSubmit: (event: FormEvent<HTMLFormElement>) => void
		nameInput: string
	}
> = ({onSubmit, nameInput, ...props}) => {
	return (
		<Form onSubmit={onSubmit} gridTemplateAreas={`"a""b"`} {...props}>
			<Input name={nameInput} placeholder="Id пользователя" />
			<Button>Добавить комнату</Button>
		</Form>
	)
}
