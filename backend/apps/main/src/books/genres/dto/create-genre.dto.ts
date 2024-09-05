import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

export class CreateGenreDto {
    @MaxLength(63)
    @IsString()
    @ApiProperty()
    genre: string
}
