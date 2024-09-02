import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { AppClusterService } from './cluster.service'
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import {
    TimeoutInterceptor,
    XmlBuilderInterceptor,
} from './shared/interceptors'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.setGlobalPrefix('api')
    app.disable('x-powered-by')
    app.use(cookieParser())
    app.useGlobalInterceptors(
        // new XmlBuilderInterceptor(),
        new TimeoutInterceptor(),
    )
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    const config = new DocumentBuilder()
        .addBearerAuth({
            name: 'Authorization',
            bearerFormat: 'Bearer',
            scheme: 'Bearer',
            type: 'http',
            in: 'Header',
        })
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)
    await app.listen(3002)
}
AppClusterService.clusterize(bootstrap, 2)
// bootstrap()
