import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class AuthDto {
    @IsString()
    @ApiProperty({ name: 'email' })
    email: string

    @IsString()
    @ApiProperty({ name: 'password' })
    password: string
}
