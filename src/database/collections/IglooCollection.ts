import BaseCollection from '@database/BaseCollection'

import Database from '@database/Database'
import type User from '@objects/user/User'

import type { IglooInventory } from '../../generated/prisma/client'

export default class IglooCollection extends BaseCollection<IglooInventory> {

    constructor(user: User, records: IglooInventory[]) {
        super(user, records, 'iglooId')
    }

    async add(iglooId: number) {
        try {
            this.collect(await Database.iglooInventory.create({
                data: {
                    userId: this.user.id,
                    iglooId
                }
            }))

        } catch (error) {
            console.error(error)
        }
    }

}
