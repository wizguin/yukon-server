export default class Buddy {

    constructor(user) {
        this.user = user
        this.usersById = user.handler.usersById
        this.db = user.db

        // Buddy list
        this.list = []
        // Pending requests that the user has received
        this.requests = []
    }

    get flat() {
        return this.list.map(buddy => buddy.id)
    }

    async init(buddies) {
        for (let buddy of buddies) {
            let user = await this.db.getUserById(buddy)
            let online = this.isOnline(user.id)

            // Online status here is only used on initial load or adding of a new buddy,
            // further requests should use isOnline to stay updated.
            this.list.push({ id: user.id, username: user.username, online: online })

            // Send online status to buddy
            if (online) this.sendOnline(user.id)
        }
    }

    includes(buddy) {
        return this.flat.includes(buddy)
    }

    addRequest(id, username) {
        if (this.user.data.id == id) return
        // If user is ignored
        if (this.user.ignore.includes(id)) return
        // If buddy already added
        if (this.includes(id)) return
        // If request has already been received
        if (this.requests.includes(id)) return

        this.requests.push(id)
        this.user.send('buddy_request', { id: id, username: username })
    }

    addBuddy(id, username, requester = false) {
        let online = this.isOnline(id)

        this.list.push({ id: id, username: username, online: online })
        this.user.send('buddy_accept', { id: id, username: username, requester: requester, online: online })
    }

    removeBuddy(id) {
        // Filter buddy out of list
        this.list = this.list.filter(obj => obj.id != id)
        this.user.send('buddy_remove', { id: id })
    }

    /*========== Online status ==========*/

    isOnline(id) {
        return id in this.usersById
    }

    sendOnline(id) {
        let user = this.usersById[id]

        user.send('buddy_online', { id: this.user.data.id })
    }

    sendOffline() {
        for (let buddy of this.list) {
            if (this.isOnline(buddy.id)) {
                let user = this.usersById[buddy.id]

                user.send('buddy_offline', { id: this.user.data.id })
            }
        }
    }

}
