import { hash } from 'bcrypt'

export const salt = 10

export const crypt = async (str: string) => {
    return hash(str, salt)
}
