import { IsDecimal, IsString, Length } from 'class-validator'

export type Code = `${number}${number}${number}${number}${number}${number}`

export class RegisterCodeDto {
    @IsDecimal()
    @Length(6, 6)
    @IsString()
    code: Code
}
