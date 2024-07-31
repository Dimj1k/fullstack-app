import { Transform, Type } from 'class-transformer'
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
    // @Transform((params) => params.value.trim())
    email: string

    @IsString()
    // @Transform((params) => params.value.trim())
    password: string

    @Type(() => UserInfoDto)
    @ValidateNested()
    info: UserInfoDto
}
