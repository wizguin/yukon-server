import Buddy from './Buddy'
import FurnitureInventory from './FurnitureInventory'
import Ignore from './Ignore'
import Inventory from './Inventory'


export default class User {

    constructor(socket, handler) {
        this.socket = socket
        this.handler = handler
        this.crumbs = handler.crumbs
        this.db = handler.db

        this.data = null
        this.room = null
        this.x = 0
        this.y = 0
        this.frame = 1

        this.buddy = null
        this.ignore = null
        this.inventory = null

        // Game server authentication
        this.authenticated = false
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

    async setBuddies(buddies) {
        this.buddy = new Buddy(this)
        await this.buddy.init(buddies)
    }

    async setIgnores(ignores) {
        this.ignore = new Ignore(this)
        await this.ignore.init(ignores)
    }

    setInventory(inventory) {
        this.inventory = new Inventory(this, inventory)
    }

    setFurnitureInventory(inventory) {
        this.furnitureInventory = new FurnitureInventory(this, inventory)
    }

    setItem(slot, item) {
        if (this.data[slot] == item) return

        this.data[slot] = item
        this.room.send(this, 'update_player', { id: this.data.id, item: item, slot: slot }, [])

        this.update({ [slot]: item })
    }

    addItem(id) {
        let item = this.inventory.validateItem(id)
        if (!item) return

        let slot = this.crumbs.items.slots[item.type - 1]

        this.data.coins -= item.cost
        this.inventory.add(id, slot)

        this.send('add_item', { item: id, name: item.name, slot: slot, coins: this.data.coins })

        this.update({ coins: this.data.coins })
    }

    update(query) {
        this.db.users.update(query, { where: { id: this.data.id }})
    }

    send(action, args = {}) {
        this.socket.emit('message', JSON.stringify({ action: action, args: args }))
    }

    close() {
        this.socket.disconnect(true)
    }

}
