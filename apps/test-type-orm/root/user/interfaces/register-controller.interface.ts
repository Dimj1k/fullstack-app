import { CreateUserDto } from '../dto/create-user.dto'

type urlId = string

export interface RegisterController {
    createInCacheUser(createUserDto: CreateUserDto): { url: urlId }
}
