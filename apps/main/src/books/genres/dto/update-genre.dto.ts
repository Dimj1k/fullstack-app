import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString } from 'class-validator'

export class UpdateGenreDto {
    @IsInt()
    @ApiProperty()
    id: number

    @IsString()
    @ApiProperty()
    newGenreName: string
}
