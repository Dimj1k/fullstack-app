import { IsInt, IsOptional, Max, Min } from 'class-validator'

export class FindAllBooksDto {
    @IsInt()
    @Min(0)
    @IsOptional()
    skip: number

    @IsInt()
    @Max(500)
    @Min(0)
    @IsOptional()
    limit: number
}
