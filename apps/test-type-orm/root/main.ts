import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { AppClusterService } from './cluster.service'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.setGlobalPrefix('api')
    app.disable('x-powered-by')
    app.enableShutdownHooks()
    app.useGlobalPipes(new ValidationPipe())
    await app.listen(3000)
}
AppClusterService.clusterize(bootstrap, 2)
// bootstrap()
