import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { crypt } from '../utils/crypt.util'

@Injectable()
export class PasswordHasher implements PipeTransform {
    async transform(
        user: Omit<CreateUserDto, 'passwordConfirm'>,
        metadata: ArgumentMetadata,
    ) {
        if (metadata.type !== 'body') return user
        return { ...user, password: await crypt(user.password) }
    }
}
