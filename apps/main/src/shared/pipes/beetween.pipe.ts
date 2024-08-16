import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    ConflictException,
    BadRequestException,
} from '@nestjs/common'

export const Beetween = (
    leftSide: number = -Infinity,
    rightSide: number = Infinity,
) => {
    @Injectable()
    class Beetween implements PipeTransform {
        transform(value: number, metadata: ArgumentMetadata) {
            if (!value) return undefined
            value = +value
            if (isNaN(value))
                throw new BadRequestException('value is not number')
            if (value < leftSide || value > rightSide)
                throw new ConflictException(
                    value > rightSide
                        ? `${value} > ${rightSide}`
                        : `${value} < ${leftSide}`,
                )
            return value
        }
    }
    return Beetween
}
