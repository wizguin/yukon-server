import Collection from '../Collection'


export default class BuddyCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'buddies', 'buddyId')

        this.usersById = this.handler.usersById
    }

    add(id) {
        super.add({ userId: this.user.id, buddyId: id })
    }

    isOnline(id) {
        return id in this.usersById
    }

    sendOnline(id) {
        let user = this.usersById[id]

        user.send('buddy_online', { id: this.user.id })
    }

    sendOffline() {
        for (let buddy in this.collection) {
            if (this.isOnline(buddy)) {
                let user = this.usersById[buddy]

                user.send('buddy_offline', { id: this.user.id })
            }
        }
    }

    toJSON() {
        let buddies = []

        for (let buddy in this.collection) {
            let online = this.isOnline(buddy)
            let username = this.collection[buddy].user.username

            buddies.push({ id: parseInt(buddy), username: username, online: online })

            if (online) {
                this.sendOnline(buddy)
            }
        }

        return buddies
    }

}
