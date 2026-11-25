import type User from '@objects/user/User'

interface OpenIgloo {
    id: number
    username: string
}

export default class OpenIgloos {

    list: OpenIgloo[] = []

    get flat() {
        return this.list.map(igloo => igloo.id)
    }

    includes(igloo: number) {
        return this.flat.includes(igloo)
    }

    add(user: User) {
        if (!this.includes(user.id)) {
            this.list.push({ id: user.id, username: user.username })
        }
    }

    remove(user: User) {
        if (this.includes(user.id)) {
            this.list = this.list.filter(igloo => igloo.id != user.id)
        }
    }

    toJSON() {
        return this.list
    }

}
