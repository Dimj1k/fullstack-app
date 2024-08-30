import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, Length } from 'class-validator'
import { IsFile } from '../../shared/decorators'
import { Transform } from 'class-transformer'
import { BadRequestException } from '@nestjs/common'

export class UpdateBookDto {
    @Length(1, 100)
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    nameBook?: string

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    description?: string

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Transform(({ value }) => {
        try {
            return typeof value == 'string'
                ? JSON.parse(value.replaceAll("'", '"'))
                : value
        } catch {
            return value
        }
    })
    @ApiProperty({ required: false })
    genre?: string[]

    @IsOptional()
    @IsFile({
        mimetype: ['image/gif', 'image/jpeg', 'image/png', 'image/webp'],
    })
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    image?: Express.Multer.File
}
