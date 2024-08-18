import { Transform, Type } from 'class-transformer'
import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'

enum GENDER {
    MALE,
    FEMALE,
    UNKNOWN,
}

export class UserInfoDto {
    @IsDateString()
    @IsOptional()
    birthdayDate?: Date

    @IsEnum(GENDER)
    @IsOptional()
    gender?: GENDER
}

export class CreateUserDto {
    @Transform(({ value }) => value.trim())
    @IsString()
    email: string

    @IsString()
    password: string

    @Type(() => UserInfoDto)
    @ValidateNested()
    @IsOptional()
    info?: UserInfoDto
}
