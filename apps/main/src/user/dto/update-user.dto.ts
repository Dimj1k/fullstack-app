import { Transform, Type } from 'class-transformer'
import {
    IsString,
    IsDateString,
    IsOptional,
    IsEnum,
    ValidateNested,
} from 'class-validator'
import { GENDER } from '../../shared/entities/user'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserInfoDto {
    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional()
    birthdayDate?: Date

    @IsEnum(GENDER)
    @IsOptional()
    @ApiPropertyOptional({ enum: GENDER })
    gender?: GENDER
}

export class UpdateUserDto {
    @Transform(({ value }) => value.trim())
    @IsString()
    @ApiProperty()
    password: string

    @Transform(({ value }) => value.trim())
    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    newPassword?: string

    @ValidateNested()
    @Type(() => UpdateUserInfoDto)
    @ApiPropertyOptional({ type: UpdateUserInfoDto })
    info?: UpdateUserInfoDto
}
