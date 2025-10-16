import GamePlugin from '@plugin/GamePlugin'


const tourItem = 428
const tourPostcard = 126
const agentItem = 800
const agentPostcard = 127

export default class Item extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'update_player': this.updatePlayer,
            'add_item': this.addItem,
            'remove_item': this.removeItem
        }

        this.items = this.crumbs.items
    }

    updatePlayer(args, user) {
        const item = this.items[args.item]

        if (!item || item.type === 10 || !user.inventory.includes(args.item)) {
            return
        }

        const slot = this.db.slots[item.type - 1]
        if (slot === 'hand') {
            user.stopWalkingPet()
        }

        user.setItem(slot, args.item)
    }

    addItem(args, user) {
        const item = user.validatePurchase.item(args.item)

        if (!item) {
            return
        }

        const slot = this.db.slots[item.type - 1]
        user.inventory.add(args.item)

        if (args.item === tourItem) {
            user.addSystemMail(tourPostcard)
        }

        if (args.item === agentItem) {
            user.addSystemMail(agentPostcard)
        }

        user.updateCoins(-item.cost)
        user.send('add_item', { item: args.item, name: item.name, slot: slot, coins: user.coins })
    }

    removeItem(args, user) {
        if (!this.db.slots.includes(args.type)) {
            return
        }

        if (args.type === 'hand') {
            user.stopWalkingPet()
        }

        user.setItem(args.type, 0)
    }

}
