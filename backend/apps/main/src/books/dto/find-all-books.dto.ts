import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

export class FindAllBooksDto {
    @IsInt()
    @Min(0)
    @IsOptional()
    @ApiProperty({ minimum: 0 })
    skip: number

    @IsInt()
    @Max(500)
    @Min(0)
    @IsOptional()
    @ApiProperty({ maximum: 500, minimum: 0 })
    limit: number
}
