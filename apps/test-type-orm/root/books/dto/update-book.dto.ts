import { IsString, Length } from 'class-validator'

export class UpdateBookDto {
    @Length(1, 100)
    @IsString()
    nameBook: string

    @IsString()
    description: string
}
