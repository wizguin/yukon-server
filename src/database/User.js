import Buddy from './Buddy'
import Inventory from './Inventory'


export default class User {

    constructor(socket, handler) {
        this.socket = socket
        this.handler = handler
        this.db = handler.db

        this.data = null
        this.room = null
        this.x = 0
        this.y = 0
        this.frame = 1

        this.buddy = null
        this.inventory = null
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

    get items() {
        return this.handler.items
    }

    async setBuddies(buddies) {
        this.buddy = new Buddy(this.db)
        await this.buddy.init(buddies)
    }

    setInventory(inventory) {
        this.inventory = new Inventory(this.items, inventory)
    }

    setItem(slot, item) {
        if (this.data[slot] == item) return

        this.data[slot] = item
        this.room.send(this, 'update_player', { id: this.data.id, item: item, slot: slot }, [])

        this.db.users.update({ [slot]: item }, { where: { id: this.data.id }})
    }

    send(action, args = {}) {
        this.socket.emit('message', JSON.stringify({ action: action, args: args }))
    }

    close() {
        this.socket.disconnect(true)
    }

}
