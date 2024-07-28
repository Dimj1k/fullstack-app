import { Type } from 'class-transformer'
import {
    IsString,
    MaxLength,
    IsDateString,
    IsOptional,
    IsEnum,
    ValidateNested,
} from 'class-validator'
import { GENDER } from '~entities/pg/user.entity'

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
    @MaxLength(60)
    @IsOptional()
    username?: string

    @IsString()
    @MaxLength(40)
    @IsOptional()
    name?: string

    @IsString()
    password: string

    @IsString()
    @IsOptional()
    newPassword?: string

    @ValidateNested()
    @Type(() => UpdateUserInfoDto)
    info: UpdateUserInfoDto
}
