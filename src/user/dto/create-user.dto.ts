import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'
import { Match } from '~decorators/match.decorator'
import { GENDER } from '~entities/pg/user.entity'

export class CreateUserDto {
    @IsString()
    @MaxLength(60)
    username: string

    @IsString()
    @MaxLength(40)
    name: string

    @IsString()
    password: string

    @Match(CreateUserDto, (user) => user.password)
    passwordConfirm: string

    @IsDateString()
    @IsOptional()
    birthdayDate?: Date

    @IsEnum(GENDER)
    @IsOptional()
    gender?: GENDER
}
