import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common'
import { isUUID } from 'class-validator'

@Injectable()
export class UuidPipe implements PipeTransform {
    transform(uuid: unknown, metadata: ArgumentMetadata) {
        if (!uuid) return undefined
        if (isUUID(uuid)) return uuid
        throw new BadRequestException(`${metadata.data} - не uuid`)
    }
}
