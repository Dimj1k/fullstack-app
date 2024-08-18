import { Global, Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { MONGO_DB_LOCATION } from './shared/constants'
import { UserProblemsModule } from './user-problems/user-problems.module'

@Global()
@Module({
    imports: [
        UserProblemsModule,
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
    exports: [ClientsModule],
})
export class GlobalClientsWrapperModule {}
