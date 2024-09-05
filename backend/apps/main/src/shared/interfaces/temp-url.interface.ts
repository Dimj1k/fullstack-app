import { Metadata } from '@grpc/grpc-js'
import { UUID } from 'crypto'
import { Observable } from 'rxjs'

interface ResTempUrl {
    url: string
}

type urlUUID = { url: UUID }

export interface TempUrlController {
    createTempUrlByAction(
        { email, action }: { email: string; action: string },
        metadata?: Metadata,
        callback?: Function,
    ): Observable<ResTempUrl>

    getEmailAndExpiresByUrl(
        { url }: urlUUID,
        metadata?: Metadata,
        callback?: Function,
    ): Observable<{
        email: string
        expires: string
    }>

    deleteTempUrl(
        { url }: urlUUID,
        metadata?: Metadata,
        callback?: Function,
    ): Observable<void>
}
