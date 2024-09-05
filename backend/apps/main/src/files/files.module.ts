import { Global, Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { FilesService } from './file-services'
import { MemoryStorageFilesService } from './file-services'
import { DiskStorageFilesService } from './file-services'
import { uploadDir } from '../shared/constants'

@Global()
@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: uploadDir,
            serveRoot: '/public',
        }),
    ],
    providers: [
        FilesService,
        MemoryStorageFilesService,
        DiskStorageFilesService,
    ],
    exports: [FilesService, MemoryStorageFilesService, DiskStorageFilesService],
})
export class FilesModule {}
