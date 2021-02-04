export default class Buddy {

    constructor(db) {
        this.db = db
        this.list = []
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

}
