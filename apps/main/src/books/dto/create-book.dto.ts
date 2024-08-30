import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, Length } from 'class-validator'
import { IsFile } from '../../shared/decorators'
import { Transform } from 'class-transformer'
import { BadRequestException } from '@nestjs/common'

export class CreateBookDto {
    @ApiProperty()
    @Length(1, 100)
    @IsString()
    nameBook: string

    @ApiProperty()
    @IsString()
    description: string

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        try {
            return typeof value == 'string'
                ? JSON.parse(value.replaceAll("'", '"'))
                : value
        } catch {
            return value
        }
    })
    genre: string[]

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsFile({
        mimetype: ['image/gif', 'image/jpeg', 'image/png', 'image/webp'],
    })
    @IsOptional()
    image?: Express.Multer.File
}
