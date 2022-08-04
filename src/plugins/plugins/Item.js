import Plugin from '../Plugin'


export default class Item extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'update_player': this.updatePlayer,
            'add_item': this.addItem,
            'remove_item': this.removeItem
        }

        this.items = this.crumbs.items
    }

    updatePlayer(args, user) {
        let item = this.items[args.item]
        if (!item || item.type == 10 || !user.inventory.includes(args.item)) {
            return
        }

        let slot = this.items.slots[item.type - 1]
        user.setItem(slot, args.item)
    }

    addItem(args, user) {
        args.item = parseInt(args.item)

        let item = user.validatePurchase.item(args.item)
        if (!item) {
            return
        }

        let slot = this.items.slots[item.type - 1]
        user.inventory.add(args.item)

        user.updateCoins(-item.cost)
        user.send('add_item', { item: args.item, name: item.name, slot: slot, coins: user.data.coins })
    }

    removeItem(args, user) {
        if (!this.items.slots.includes(args.type)) {
            return
        }

        user.setItem(args.type, 0)
    }

}
