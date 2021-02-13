export default class Ignore {

    constructor(user) {
        this.user = user
        this.db = user.db

        // Ignore list
        this.list = []
    }

    get flat() {
        return this.list.map(buddy => buddy.id)
    }

    async init(ignores) {
        for (let ignore of ignores) {
            let user = await this.db.getUserById(ignore)
            this.list.push({ id: user.id, username: user.username })
        }
    }

    includes(ignore) {
        return this.flat.includes(ignore)
    }

    addIgnore(id, username) {
        this.list.push({ id: id, username: username })
        this.user.send('ignore_add', { id: id, username: username })
    }

    removeIgnore(id) {
        // Filter ignore out of list
        this.list = this.list.filter(obj => obj.id != id)
        this.user.send('ignore_remove', { id: id })
    }

}
