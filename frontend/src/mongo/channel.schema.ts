import {model, models, MongooseError, Schema} from 'mongoose'

interface Channel {
	channelName: string
	members: string[]
}

const channelSchema = new Schema<Channel>(
	{
		channelName: {type: String, index: true, unique: true},
		members: {type: [String], index: true},
	},
	{_id: true, timestamps: true, collection: 'channels'},
)

channelSchema.pre('save', function (next) {
	const canSave = this.members.every(member =>
		member.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
	)
	if (canSave) {
		next()
	} else {
		next(new MongooseError('Неверный id пользователя'))
	}
})

export const Channels = models.Channel<Channel> || model<Channel>('Channel', channelSchema)
