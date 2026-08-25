import GamePlugin from '@plugin/GamePlugin'

import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import { type } from 'arktype'

const tourItem = 428
const tourPostcard = 126
const agentItem = 800
const agentPostcard = 127

const slots = ['color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo', 'award']

const UpdatePlayer = type({
    item: 'number'
})

const RemoveItem = type({
    type: 'string'
})

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

    updatePlayer(args: unknown, user: GameUser) {
        const { item: itemId } = UpdatePlayer.assert(args)

        const item = this.items[itemId]

        if (!item || item.type === 10 || !user.inventory.includes(itemId)) {
            return
        }

        const slot = slots[item.type - 1]
        if (slot === 'hand') {
            user.stopWalkingPet()
        }

        user.setItem(slot, itemId)
    }

    addItem(args: unknown, user: GameUser) {
        const { item: itemId } = UpdatePlayer.assert(args)

        const item = user.validatePurchase.item(itemId)

        if (!item) {
            return
        }

        const slot = slots[item.type - 1]

        user.inventory.add(itemId)

        if (itemId === tourItem) {
            user.addSystemMail(tourPostcard)
        }

        if (itemId === agentItem) {
            user.addSystemMail(agentPostcard)
        }

        user.updateCoins(-item.cost)
        user.send('add_item', { item: itemId, name: item.name, slot, coins: user.coins })
    }

    removeItem(args: unknown, user: GameUser) {
        const { type } = RemoveItem.assert(args)

        if (!slots.includes(type)) {
            return
        }

        if (type === 'hand') {
            user.stopWalkingPet()
        }

        user.setItem(type, 0)
    }

}
