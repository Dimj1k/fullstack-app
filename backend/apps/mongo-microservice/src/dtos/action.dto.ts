import { IsString } from 'class-validator'

export class ActionDto {
    @IsString()
    action: string

    @IsString()
    email: string
}
