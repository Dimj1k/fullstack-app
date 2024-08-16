import { availableParallelism } from 'node:os'
import { Injectable, Logger } from '@nestjs/common'
import { Cluster } from 'node:cluster'
import { createIndexesFortemplates } from './shared/utils/create-indexes-template.util'
import { join } from 'node:path'

const cluster = require('node:cluster') as Cluster
const numCPUs = availableParallelism()

const logger = new Logger('AppClusterService')

@Injectable()
export class AppClusterService {
    static clusterize(callback: Function, cpuLimit: number = numCPUs): void {
        if (cluster.isPrimary) {
            cluster.schedulingPolicy = cluster.SCHED_RR
            if (cpuLimit > numCPUs || cpuLimit < 1) cpuLimit = numCPUs
            logger.log(`Primary server started on ${process.pid}`)
            for (let i = 0; i < cpuLimit; i++) {
                cluster.fork()
            }
            cluster.on('exit', (worker) => {
                logger.error(`Worker ${worker.process.pid} died. Restarting`)
                cluster.fork()
            })
            createIndexesFortemplates(join(__dirname, 'mailer', 'templates'))
        } else {
            logger.log(`Worker server started on ${process.pid}`)
            callback()
        }
    }
}
