import { Metadata } from '@grpc/grpc-js'
import { CreateUserDto } from '../dto/user/create-user.dto'
import { RegisterToken } from '../dto/user/register-token.dto'
import { Observable } from 'rxjs'
import { User } from '../entities/user/user.entity'

export interface RegisterController {
    createInCacheUser(
        createUserDto: CreateUserDto,
        metadata?: Metadata,
        callback?: Function,
    ): Observable<RegisterToken>

    returnByTokenUser(
        token: RegisterToken,
        metadata?: Metadata,
        callback?: Function,
    ): Observable<Omit<User, 'createdDate' | 'updatedDate' | 'infoId'>>
}
