export default class User {

    constructor(socket, db) {
        this.socket = socket
        this.db = db

        this.data = null
        this.inventory = null
        this.room = null
        this.x = 0
        this.y = 0
        this.frame = 1
    }

    get string() {
        return {
            id: this.data.id,
            username: this.data.username,
            color: this.data.color,
            head: this.data.head,
            face: this.data.face,
            neck: this.data.neck,
            body: this.data.body,
            hand: this.data.hand,
            feet: this.data.feet,
            flag: this.data.flag,
            photo: this.data.photo,
            coins: this.data.coins,
            x: this.x,
            y: this.y,
            frame: this.frame
        }
    }

    setItem(slot, item) {
        this.data[slot] = item
        this.room.send(this, 'update_player', { id: this.data.id, item: item, slot: slot }, [])
    }

    send(action, args = {}) {
        this.socket.emit('message', JSON.stringify({ action: action, args: args }))
    }

}
