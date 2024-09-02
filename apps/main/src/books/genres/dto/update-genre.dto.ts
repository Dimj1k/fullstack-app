import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, MaxLength, Min } from 'class-validator'

export class UpdateGenreDto {
    @Min(0)
    @IsInt()
    @ApiProperty()
    id: number

    @MaxLength(63)
    @IsString()
    @ApiProperty()
    newGenreName: string
}
