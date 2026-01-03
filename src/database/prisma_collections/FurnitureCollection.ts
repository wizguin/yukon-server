import PrismaCollection from '@database/PrismaCollection'

import { furniture } from '@data'
import PrismaDatabase from '@database/PrismaDatabase'
import type User from '@objects/user/User'

import type { FurnitureInventory } from '../../generated/prisma/client'

export default class FurnitureCollection extends PrismaCollection<FurnitureInventory> {

    constructor(user: User, records: FurnitureInventory[]) {
        super(user, records, 'itemId')
    }

    async add(itemId: number) {
        if (!(itemId in furniture)) {
            return false
        }

        if (this.getQuantity(itemId) >= furniture[itemId].max) {
            return false
        }

        try {
            const record = this.includes(itemId)
                ? await this.incrementExisting(itemId)
                : await this.createNew(itemId)

            this.collect(record)

            return true

        } catch (error) {
            console.error(error)

            return false
        }
    }

    async createNew(itemId: number) {
        return PrismaDatabase.furnitureInventory.create({
            data: {
                userId: this.user.id,
                itemId,
                quantity: 1
            }
        })
    }

    async incrementExisting(itemId: number) {
        return PrismaDatabase.furnitureInventory.update({
            data: {
                quantity: { increment: 1 }
            },
            where: {
                userId_itemId: {
                    userId: this.user.id,
                    itemId
                }
            }
        })
    }

    getQuantity(itemId: number) {
        return this.get(itemId)?.quantity ?? 0
    }

    toJSON() {
        const furniture: Record<number, number> = {}

        for (const itemId of this.keys) {
            furniture[itemId] = this.getQuantity(itemId)
        }

        return furniture
    }

}
