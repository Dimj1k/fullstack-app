import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length } from 'class-validator'

export class CreateBookDto {
    @Length(1, 100)
    @ApiProperty()
    @IsString()
    nameBook: string

    @IsString()
    @ApiProperty()
    description: string
}
