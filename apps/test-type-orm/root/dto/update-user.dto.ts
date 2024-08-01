import { Type } from 'class-transformer'
import {
    IsString,
    IsDateString,
    IsOptional,
    IsEnum,
    ValidateNested,
} from 'class-validator'
import { GENDER } from '../entities/user/user.entity'

export class UpdateUserInfoDto {
    @IsDateString()
    @IsOptional()
    birthdayDate?: Date

    @IsEnum(GENDER)
    @IsOptional()
    gender?: GENDER
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    email?: string

    @IsString()
    password: string

    @IsString()
    @IsOptional()
    newPassword?: string

    @ValidateNested()
    @Type(() => UpdateUserInfoDto)
    info: UpdateUserInfoDto
}
