import { UnauthorizedException } from '@nestjs/common'
import { compare } from 'bcrypt'

export const comparePasswords = async (
    password: string,
    hashPassword: string,
) => {
    let isPasswordCorrect = await compare(password, hashPassword)
    if (!isPasswordCorrect)
        throw new UnauthorizedException('incorrect password')
}
