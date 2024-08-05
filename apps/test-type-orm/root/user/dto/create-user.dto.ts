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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UserInfoDto {
    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional()
    birthdayDate?: Date

    @IsEnum(GENDER)
    @IsOptional()
    @ApiPropertyOptional({ enum: GENDER })
    gender?: GENDER
}

export class CreateUserDto {
    @IsString()
    @ApiProperty()
    email: string

    @IsString()
    @ApiProperty()
    password: string

    @Match(CreateUserDto, (user) => user.password)
    @IsString()
    @ApiProperty()
    passwordConfirm: string

    @Type(() => UserInfoDto)
    @ValidateNested()
    @ApiProperty()
    info: UserInfoDto
}
