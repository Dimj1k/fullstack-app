import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { CreateUserDto } from '../../registration/dto'

@Injectable()
export class PasswordConfirmRemover implements PipeTransform {
    transform(user: CreateUserDto, metadata: ArgumentMetadata) {
        return (({ passwordConfirm, ...newUser }) => newUser)(user)
    }
}
