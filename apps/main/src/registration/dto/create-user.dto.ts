import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { Match } from '../../shared/decorators'
import { GENDER } from '../../shared/entities/user'
import { Transform, Type } from 'class-transformer'
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
    @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
    @IsEmail()
    @ApiProperty()
    email: string

    @Transform(({ value }) => value.trim())
    @IsString()
    @ApiProperty()
    password: string

    @Match(CreateUserDto, (user) => user.password)
    @Transform(({ value }) => value.trim())
    @IsString()
    @ApiProperty()
    passwordConfirm: string

    @Type(() => UserInfoDto)
    @ValidateNested()
    @IsOptional()
    @ApiProperty()
    info?: UserInfoDto
}
