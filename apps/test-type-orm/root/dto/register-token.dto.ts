import { IsDecimal, IsString, Length } from 'class-validator'

type Token = `${number}${number}${number}${number}${number}${number}`

export class RegisterToken {
    @IsDecimal()
    @Length(6, 6)
    @IsString()
    token: Token
}
