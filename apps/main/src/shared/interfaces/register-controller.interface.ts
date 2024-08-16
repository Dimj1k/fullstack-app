import { Metadata } from '@grpc/grpc-js'
import { CreateUserDto } from '../../registration/dto/create-user.dto'
import { RegisterCode } from '../../registration/dto/register-token.dto'
import { Observable } from 'rxjs'
import { User } from '../entities/user/user.entity'

export interface RegisterController {
    createInCacheUser(
        createUserDto: CreateUserDto,
        metadata?: Metadata,
        callback?: Function,
    ): Observable<RegisterCode>

    returnByTokenUser(
        token: RegisterCode,
        metadata?: Metadata,
        callback?: Function,
    ): Observable<Omit<User, 'createdDate' | 'updatedDate' | 'infoId'>>
}
