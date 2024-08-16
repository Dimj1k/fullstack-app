import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { CreateUserDto } from '../../registration/dto'

@Injectable()
export class BirthdayDateCheck implements PipeTransform {
    transform(user: CreateUserDto, metadata: ArgumentMetadata) {
        if (metadata.type !== 'body') return user
        if (user.info)
            if (
                new Date(user.info.birthdayDate).getTime() >
                new Date().getTime()
            )
                throw new HttpException(
                    'bithdayDate > now()',
                    HttpStatus.BAD_REQUEST,
                )

        return user
    }
}
