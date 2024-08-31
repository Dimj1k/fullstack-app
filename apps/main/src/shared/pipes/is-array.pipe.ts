import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { isArray } from 'class-validator'

@Injectable()
export class ArrayPipe implements PipeTransform {
    transform(arr: unknown, metadata: ArgumentMetadata) {
        if (!arr) return undefined
        if (isArray(arr)) return arr
        else return [arr]
    }
}
