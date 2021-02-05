export default class Buddy {

    constructor(user) {
        this.user = user
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
            this.list.push({ id: user.id, username: user.username, online: this.getOnline(user.id) })
        }
    }

    getOnline(id) {
        return false
    }

    includes(buddy) {
        return this.flat.includes(buddy)
    }

    addRequest(id, username) {
        if (this.user.data.id == id) return
        // If buddy already added
        if (this.includes(id)) return
        // If request has already been received
        if (this.requests.includes(id)) return

        this.requests.push(id)
        this.user.send('buddy_request', { id: id, username: username })
    }

    addBuddy(id, username, requester = false) {
        let online = this.getOnline(id)

        this.list.push({ id: id, username: username, online: online })
        this.user.send('buddy_accept', { id: id, username: username, requester: requester, online: online })
    }

}
