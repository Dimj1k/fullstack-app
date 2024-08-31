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
        if (user.info)
            if (
                user.info.birthdayDate &&
                new Date(user.info.birthdayDate).getTime() > Date.now()
            )
                throw new HttpException(
                    'bithdayDate > now()',
                    HttpStatus.BAD_REQUEST,
                )

        return user
    }
}
