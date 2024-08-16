import { compare } from 'bcrypt'

export const comparePasswords = async (
    password: string,
    hashPassword: string,
) => {
    let isPasswordCorrect = await compare(password, hashPassword)
    return isPasswordCorrect
}
