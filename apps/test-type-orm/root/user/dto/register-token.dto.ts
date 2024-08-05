import { ApiProperty } from '@nestjs/swagger'
import { IsDecimal, IsString, Length } from 'class-validator'

type Code = `${number}${number}${number}${number}${number}${number}`

export class RegisterCode {
    @IsDecimal()
    @Length(6, 6)
    @IsString()
    @ApiProperty({
        maxLength: 6,
        minLength: 6,
        example: '123456',
    })
    code: Code
}
