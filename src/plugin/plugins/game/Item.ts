import GamePlugin from '@plugin/GamePlugin'

import type GameUser from '@objects/user/GameUser'
import { items } from '@data'

import { type } from 'arktype'

const slots = ['color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo', 'award']

const UpdatePlayer = type({
    item: 'number'
})

const AddItem = type({
    item: 'number.integer'
})

const RemoveItem = type({
    type: 'string'
})

export default class Item extends GamePlugin {

    events = {
        update_player: this.updatePlayer,
        add_item: this.addItem,
        remove_item: this.removeItem
    }

    updatePlayer(args: unknown, user: GameUser) {
        const { item: itemId } = UpdatePlayer.assert(args)

        const item = items[itemId]

        if (!item || item.type === 10 || !user.inventory.includes(itemId)) {
            return
        }

        const slot = slots[item.type - 1]
        if (slot === 'hand') {
            user.stopWalkingPet()
        }

        user.setItem(slot, itemId)
    }

    async addItem(args: unknown, user: GameUser) {
        const { item: itemId } = AddItem.assert(args)

        await user.addItem(itemId)
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
