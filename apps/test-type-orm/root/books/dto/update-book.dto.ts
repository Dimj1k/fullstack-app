import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length } from 'class-validator'

export class UpdateBookDto {
    @Length(1, 100)
    @IsString()
    @ApiProperty()
    nameBook: string

    @IsString()
    @ApiProperty()
    description: string
}
