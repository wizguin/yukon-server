export default class OpenIgloos {

    constructor() {
        this.list = []
    }

    get flat() {
        return this.list.map(igloo => igloo.id)
    }

    includes(igloo) {
        return this.flat.includes(igloo)
    }

    add(user) {
        if (!this.includes(user.data.id)) {
            this.list.push({ id: user.data.id, username: user.data.username })
        }
    }

    remove(user) {
        if (this.includes(user.data.id)) {
            this.list = this.list.filter(igloo => igloo.id != user.data.id)
        }
    }

}
