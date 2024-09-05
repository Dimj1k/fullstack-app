import { IsUUID } from 'class-validator'
import { UUID } from 'crypto'

export class UuidDto {
    @IsUUID()
    url: UUID
}
