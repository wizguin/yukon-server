import BaseCollection from '@database/BaseCollection'

import type GameUser from '@objects/user/GameUser'
import type User from '@objects/user/User'

import type { IglooInventory } from '../../generated/prisma/client'

export default class IglooCollection extends BaseCollection<IglooInventory> {

    constructor(user: User, records: IglooInventory[]) {
        super(user, records, 'iglooId')
    }

    async add(iglooId: number, cost: number) {
        const record = await (this.user as GameUser).purchase(cost, tx =>
            tx.iglooInventory.create({
                data: {
                    userId: this.user.id,
                    iglooId
                }
            })
        )

        this.collect(record)

        return record
    }

}
