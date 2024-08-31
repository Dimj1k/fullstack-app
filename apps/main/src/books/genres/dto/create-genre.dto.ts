import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString } from 'class-validator'

export class CreateGenreDto {
    @IsInt()
    @ApiProperty()
    id: number

    @IsString()
    @ApiProperty()
    genre: string
}
