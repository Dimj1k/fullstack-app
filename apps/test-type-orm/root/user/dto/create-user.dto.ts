import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { Match } from '../../decorators/match.decorator'
import { GENDER } from '../../entities/user/user.entity'
import { Type } from 'class-transformer'

export class UserInfoDto {
    @IsDateString()
    @IsOptional()
    birthdayDate?: Date

    @IsEnum(GENDER)
    @IsOptional()
    gender?: GENDER
}

export class CreateUserDto {
    @IsString()
    email: string

    @IsString()
    password: string

    @Match(CreateUserDto, (user) => user.password)
    @IsString()
    passwordConfirm: string

    @Type(() => UserInfoDto)
    @ValidateNested()
    info: UserInfoDto
}
