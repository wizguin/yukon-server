import type GameUser from '@objects/user/GameUser'

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

    add(user: GameUser) {
        if (!this.includes(user.id)) {
            this.list.push({ id: user.id, username: user.username })
        }
    }

    remove(user: GameUser) {
        if (this.includes(user.id)) {
            this.list = this.list.filter(igloo => igloo.id != user.id)
        }
    }

    toJSON() {
        return this.list
    }

}
