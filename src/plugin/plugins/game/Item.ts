import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

const tourItem = 428
const tourPostcard = 126
const agentItem = 800
const agentPostcard = 127

const slots = ['color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo', 'award']

export default class Item extends GamePlugin {

    items: Record<string, any>

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            update_player: this.updatePlayer,
            add_item: this.addItem,
            remove_item: this.removeItem
        }

        this.items = this.crumbs.items
    }

    updatePlayer(args: Args, user: GameUser) {
        const item = this.items[args.item]

        if (!item || item.type === 10 || !user.inventory.includes(args.item)) {
            return
        }

        const slot = slots[item.type - 1]
        if (slot === 'hand') {
            user.stopWalkingPet()
        }

        user.setItem(slot, args.item)
    }

    addItem(args: Args, user: GameUser) {
        const item = user.validatePurchase.item(args.item)

        if (!item) {
            return
        }

        const slot = slots[item.type - 1]
        user.inventory.add(parseInt(args.item))

        if (args.item === tourItem) {
            user.addSystemMail(tourPostcard)
        }

        if (args.item === agentItem) {
            user.addSystemMail(agentPostcard)
        }

        user.updateCoins(-item.cost)
        user.send('add_item', { item: args.item, name: item.name, slot, coins: user.coins })
    }

    removeItem(args: Args, user: GameUser) {
        if (!slots.includes(args.type)) {
            return
        }

        if (args.type === 'hand') {
            user.stopWalkingPet()
        }

        user.setItem(args.type, 0)
    }

}
