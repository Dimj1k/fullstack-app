import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { CreateUserDto } from '../user/dto/create-user.dto'

const assert = require('node:assert')

@Injectable()
export class BirthdayDateCheck implements PipeTransform {
    transform(user: CreateUserDto, metadata: ArgumentMetadata) {
        if (metadata.type !== 'body') return user
        if (user.info)
            assert(
                new Date(user.info.birthdayDate).getTime() <
                    new Date().getTime(),
                new HttpException(
                    'bithdayDate > now()',
                    HttpStatus.BAD_REQUEST,
                ),
            )

        return user
    }
}
