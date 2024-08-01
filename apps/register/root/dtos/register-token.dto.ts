import { IsDecimal, IsString, Length } from 'class-validator'

export type Token = `${number}${number}${number}${number}${number}${number}`

export class RegisterTokenDto {
    @IsDecimal()
    @Length(6, 6)
    @IsString()
    token: Token
}
