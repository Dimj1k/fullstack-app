import { Global, Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { Mailer } from './mailer'
import { MONGO_DB_LOCATION } from './shared/constants'

@Global()
@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'MONGO_DB_MICROSERVICE',
                transport: Transport.GRPC,
                options: {
                    url: MONGO_DB_LOCATION,
                    package: 'mongo',
                    protoPath: join(__dirname, 'protos', 'mongo.proto'),
                },
            },
        ]),
    ],
    providers: [
        { provide: 'Mailer', useClass: Mailer },
        { provide: '$ENABLE_MAILER$', useValue: false },
    ],
    exports: [ClientsModule, { provide: 'Mailer', useClass: Mailer }],
})
export class GlobalWrapperModules {}
