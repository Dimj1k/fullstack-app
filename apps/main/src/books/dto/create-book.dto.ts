import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, Length } from 'class-validator'
import { IsFile } from '../../shared/decorators'
import { Transform } from 'class-transformer'
import { BadRequestException } from '@nestjs/common'
import { Genre } from '../../shared/entities/genres'

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
            if (typeof value == 'string')
                return value[0] == '[' && value.at(-1) == ']'
                    ? JSON.parse(value.replaceAll("'", '"'))
                    : value.split(',')
            return value
        } catch {
            return value
        }
    })
    genres: string[]

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsFile({
        mimetype: ['image/gif', 'image/jpeg', 'image/png', 'image/webp'],
    })
    @IsOptional()
    image?: Express.Multer.File
}
