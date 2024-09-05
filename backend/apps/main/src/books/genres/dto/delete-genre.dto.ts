import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Min } from 'class-validator'

export class DeleteGenreDto {
    @Min(0)
    @IsNumber()
    @ApiProperty()
    id: number
}
