export * from './disk-storage-file.service'
export * from './memory-storage-file.service'

import { Injectable } from '@nestjs/common'
import * as sharp from 'sharp'
import { DiskStorageFilesService } from './disk-storage-file.service'
import { MemoryStorageFilesService } from './memory-storage-file.service'
import { ResizeOptions } from './interfaces'

sharp.cache(false) //\\

@Injectable()
export class FilesService {
    constructor(
        private readonly memoryStorageFilesService: MemoryStorageFilesService,
        private readonly diskStorageFilesServices: DiskStorageFilesService,
    ) {}

    async convertImageToWebp(
        image: Express.Multer.File,
        sizes?: Omit<{ [key in string]: ResizeOptions }, 'default'>,
        options: sharp.SharpOptions = {},
        webpOptions: sharp.WebpOptions = {},
    ) {
        if (!image) return undefined
        let fileService = this.switchFileService(image)
        return fileService.convertImageToWebp(
            image,
            sizes,
            options,
            webpOptions,
        )
    }

    private switchFileService(file: Express.Multer.File) {
        return file.buffer
            ? this.memoryStorageFilesService
            : this.diskStorageFilesServices
    }
}
