import { IsDecimal, IsString, Length } from 'class-validator'

type Code = `${number}${number}${number}${number}${number}${number}`

export class RegisterCode {
    @IsDecimal()
    @Length(6, 6)
    @IsString()
    code: Code
}
