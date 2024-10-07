import {Mutex} from 'async-mutex'
import {ConnectionStates, connect, connection} from 'mongoose'

const mutex = new Mutex()
export async function connectToMongo() {
	if (connection.readyState === ConnectionStates.connected) {
		return
	}
	const mongoURI = process.env.MONGO_DB
	if (!mongoURI) return
	await mutex.runExclusive(async () => {
		if (connection.readyState === ConnectionStates.connected) {
			return
		}
		await connect(mongoURI, {dbName: 'test'})
	})
}

connectToMongo()
