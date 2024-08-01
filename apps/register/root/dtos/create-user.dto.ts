import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsString, ValidateNested } from 'class-validator'

enum GENDER {
    MALE,
    FEMALE,
    UNKNOWN,
}

export class UserInfoDto {
    @IsDateString()
    birthdayDate?: Date

    @IsEnum(GENDER)
    gender?: GENDER
}

export class CreateUserDto {
    @IsString()
    email: string

    @IsString()
    password: string

    @Type(() => UserInfoDto)
    @ValidateNested()
    info: UserInfoDto
}
