import { IsString, IsUUID } from 'class-validator'
import { UUID } from 'crypto'

export class EmailUrlDto {
    @IsString()
    email: string

    @IsUUID()
    url: UUID
}
