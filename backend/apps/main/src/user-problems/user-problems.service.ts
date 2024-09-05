import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { UUID } from 'node:crypto'
import { lastValueFrom, take } from 'rxjs'
import { JwtController } from '../shared/interfaces'
import { TempUrlController } from '../shared/interfaces'
import { ClientGrpc } from '@nestjs/microservices'

@Injectable()
export class UserProblemsService implements OnModuleInit {
    private tempUrlService: TempUrlController
    private authService: JwtController

    constructor(
        @Inject('MONGO_DB_MICROSERVICE') private readonly client: ClientGrpc,
    ) {}

    onModuleInit() {
        this.tempUrlService =
            this.client.getService<TempUrlController>('TempUrlController')
        this.authService =
            this.client.getService<JwtController>('AuthController')
    }

    async forgotPassword(email: string) {
        return lastValueFrom(
            this.tempUrlService
                .createTempUrlByAction({
                    email,
                    action: 'forgot-password',
                })
                .pipe(take(1)),
        ).then(({ url }) => url)
    }

    async deleteAllTokens(email: { email: string }) {
        return lastValueFrom(
            this.authService.deleteAllTokens(email).pipe(take(1)),
        )
    }

    //\\
    async getInfoByUrl(url: UUID): Promise<{ email: string; expires: Date }> {
        return lastValueFrom(
            this.tempUrlService.getEmailAndExpiresByUrl({ url }).pipe(take(1)),
        ).then(({ email, expires }) => ({ email, expires: new Date(expires) }))
    }

    async deleteTempUrl(url: { url: UUID }) {
        return lastValueFrom(
            this.tempUrlService.deleteTempUrl(url).pipe(take(1)),
        )
    }
}
