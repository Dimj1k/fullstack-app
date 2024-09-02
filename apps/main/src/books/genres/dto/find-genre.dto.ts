import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class FindGenreDto {
    @MaxLength(63)
    @IsString()
    @ApiProperty()
    genreName: string

    @Min(0)
    @IsNumber()
    @IsOptional()
    take?: number
}
