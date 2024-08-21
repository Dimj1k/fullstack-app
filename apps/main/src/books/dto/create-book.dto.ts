import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator'
import { IsFile } from '../../shared/decorators'

export class CreateBookDto {
    @Length(1, 100)
    @ApiProperty()
    @IsString()
    nameBook: string

    @IsString()
    @ApiProperty()
    description: string

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsFile({
        mimetype: ['image/gif', 'image/jpeg', 'image/png', 'image/webp'],
    })
    @IsOptional()
    image?: Express.Multer.File
}
