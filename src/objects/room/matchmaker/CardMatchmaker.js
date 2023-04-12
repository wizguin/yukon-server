export default class CardMatchmaker {

    constructor(matchmaker, room) {
        Object.assign(this, matchmaker)

        this.room = room

        this.users = []
    }

}
