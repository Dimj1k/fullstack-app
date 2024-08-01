import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { hash } from 'bcrypt'

@Injectable()
export class PasswordHasher implements PipeTransform {
    async transform(user: CreateUserDto, metadata: ArgumentMetadata) {
        if (metadata.type !== 'body') return user
        return { ...user, password: await hash(user.password, 10) }
    }
}
