import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'
import { Match } from '../../shared/decorators'

export class EmailDto {
    @IsEmail()
    @ApiProperty({ name: 'email' })
    email: string
}

export class ChangePasswordDto {
    @IsString()
    @ApiProperty({ name: 'password' })
    password: string

    @Match(ChangePasswordDto, (dto) => dto.password)
    @ApiProperty({ name: 'passwordConfirm' })
    passwordConfirm: string
}
