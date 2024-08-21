import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, Length } from 'class-validator'
import { IsFile } from '../../shared/decorators'

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

    @IsOptional()
    @IsFile({
        mimetype: ['image/gif', 'image/jpeg', 'image/png', 'image/webp'],
    })
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    image?: Express.Multer.File
}
