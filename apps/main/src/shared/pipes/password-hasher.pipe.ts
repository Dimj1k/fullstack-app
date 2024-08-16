import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { CreateUserDto } from '../../registration/dto'
import { crypt } from '../utils'

@Injectable()
export class PasswordHasher implements PipeTransform {
    async transform(
        user: Omit<CreateUserDto, 'passwordConfirm'>,
        metadata: ArgumentMetadata,
    ) {
        if (metadata.type !== 'body') return user
        return { ...user, password: await crypt(user.password.trim()) }
    }
}
