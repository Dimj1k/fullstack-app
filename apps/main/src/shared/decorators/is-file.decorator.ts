import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator'

export function IsFile(
    options?: ValidationOptions & { mimetype?: string | string[] },
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsFile',
            target: object.constructor,
            propertyName: propertyName,
            options: { ...options },
            validator: {
                validate(
                    value: Express.Multer.File,
                    args: ValidationArguments,
                ) {
                    if (!value) return false
                    let mimetype = options ? options.mimetype : undefined
                    if (mimetype && Array.isArray(mimetype))
                        return mimetype.some((mt) => mt === value.mimetype)
                    if (mimetype && typeof mimetype == 'string')
                        return mimetype === value.mimetype
                    return !!value.mimetype
                },
                defaultMessage(validationArguments: ValidationArguments) {
                    return messageCreator(
                        options,
                        validationArguments.value || {},
                    )
                },
            },
        })
    }
}

function messageCreator(
    { mimetype }: { mimetype?: string | string[] },
    { originalname }: ValidationArguments['value'],
) {
    if (!originalname) return 'Файла нет'
    if (!mimetype) return `${originalname} не файл`
    if (Array.isArray(mimetype))
        return `${originalname} файл не поддерживается для загрузки. Доступные типы файлов: ${mimetype.join(', ')}`
    return `${originalname} файл не поддерживается. Доступный тип файла для загрузки: ${mimetype}`
}
