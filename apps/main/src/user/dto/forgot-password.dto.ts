import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { Match } from '../../shared/decorators'

export class EmailDto {
    @IsString()
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
