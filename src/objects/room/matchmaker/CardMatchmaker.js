export default class CardMatchmaker {

    constructor(matchmaker, room) {
        Object.assign(this, matchmaker)

        this.room = room

        this.users = []
    }

    add(user) {
        this.users.push(user)

        user.send('join_matchmaking')
    }

    remove(user) {
        this.users = this.users.filter(u => u != user)
    }

    includes(user) {
        return this.users.includes(user)
    }

}
