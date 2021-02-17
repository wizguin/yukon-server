import Plugin from '../Plugin'


export default class Chat extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'update_player': this.updatePlayer,
            'add_item': this.addItem,
            'remove_item': this.removeItem
        }
    }

    updatePlayer(args, user) {
        if (!user.inventory.includes(args.item)) return

        let item = this.items[args.item]
        //if (!item || item.bait || item.award) return
        if (!item || item.award) return

        let slot = this.items.slots[item.type - 1]
        user.setItem(slot, args.item)
    }

    addItem(args, user) {
        user.addItem(args.item)
    }

    removeItem(args, user) {
        if (!this.items.slots.includes(args.type)) return

        user.setItem(args.type, 0)
    }

}
