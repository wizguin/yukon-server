import Plugin from '@plugin/Plugin'

import { items } from '@data'
import type User from '@objects/user/User'

import { type } from 'arktype'

const slots = ['color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo', 'award']

const UpdatePlayer = type({
    item: 'number.integer'
})

const AddItem = type({
    item: 'number.integer'
})

const RemoveItem = type({
    type: 'string'
})

export default class Item extends Plugin {

    events = {
        update_player: this.updatePlayer,
        add_item: this.addItem,
        remove_item: this.removeItem
    }

    updatePlayer(args: unknown, user: User) {
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

    async addItem(args: unknown, user: User) {
        const { item: itemId } = AddItem.assert(args)

        await user.addItem(itemId)
    }

    removeItem(args: unknown, user: User) {
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
