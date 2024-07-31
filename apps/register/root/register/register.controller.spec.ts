import { Test, TestingModule } from '@nestjs/testing'
import { RegisterController } from './register.controller'
import { RegisterService } from './register.service'

describe('RegisterController', () => {
    let registerController: RegisterController

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [RegisterController],
            providers: [RegisterService],
        }).compile()

        registerController = app.get<RegisterController>(RegisterController)
    })

    describe('root', () => {})
})
