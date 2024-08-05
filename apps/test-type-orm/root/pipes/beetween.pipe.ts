import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    ConflictException,
} from '@nestjs/common'

export const Beetween = (
    leftSide: number = -Infinity,
    rightSide: number = Infinity,
) => {
    @Injectable()
    class Beetween implements PipeTransform {
        transform(value: number, metadata: ArgumentMetadata) {
            if (metadata.type !== 'query') return value
            if (value < leftSide || value > rightSide)
                throw new ConflictException()
            return value
        }
    }
    return Beetween
}
