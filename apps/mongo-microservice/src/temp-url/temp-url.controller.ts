import {
    BadGatewayException,
    ConflictException,
    Injectable,
    NotFoundException,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { MongoRepository } from 'typeorm'
import { TempUrl } from './temp-url.entity'
import { GrpcMethod, RpcException } from '@nestjs/microservices'
import { ActionDto } from '../dtos/action.dto'
import { randomUUID } from 'crypto'
import { InjectRepository } from '@nestjs/typeorm'
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import { UuidDto } from '../dtos/uuid.dto'
import { addHours } from 'date-fns'

@UsePipes(
    new ValidationPipe({
        whitelist: true,
        transform: true,
    }),
)
@Injectable()
export class TempUrlController {
    constructor(
        @InjectRepository(TempUrl)
        private readonly tempUrlRepository: MongoRepository<TempUrl>,
    ) {}

    @GrpcMethod('TempUrlController', 'createTempUrlByAction')
    async createTempUrlByAction(
        { action, email }: ActionDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        let url = this.generateUrl()
        let tempUrl = this.tempUrlRepository.create({ action, url, email })
        await this.tempUrlRepository
            .updateOne({ action, email }, { $set: tempUrl }, { upsert: true })
            .catch((err) => {
                throw new RpcException(new ConflictException(err))
            })
        return { url }
    }

    @GrpcMethod('TempUrlController', 'getEmailAndExpiresByUrl')
    async getEmailAndActionFromTempUrl(
        url: UuidDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        let { email, createdAt } = await this.tempUrlRepository
            .findOneByOrFail(url)
            .catch((err) => {
                throw new RpcException(new NotFoundException(err))
            })
        createdAt = addHours(createdAt, 2)
        return { email, expires: createdAt.toString() }
    }

    @GrpcMethod('TempUrlController', 'deleteTempUrl')
    async deleteTempUrl(
        url: UuidDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        this.tempUrlRepository.deleteOne(url)
        return { message: 'url удалён' }
    }

    private generateUrl() {
        let uuid = randomUUID()
        return uuid
    }
}
