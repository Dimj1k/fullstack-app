import * as sharp from 'sharp'

export type ResizeOptions = sharp.ResizeOptions & {
    width: number
    height: number
}
