import PrismaCollection from '@database/PrismaCollection'

import PrismaDatabase from '@database/PrismaDatabase'
import type User from '@objects/user/User'

import type { IglooInventory } from '../../generated/prisma/client'

export default class IglooCollection extends PrismaCollection<IglooInventory> {

    constructor(user: User, records: IglooInventory[]) {
        super(user, records, 'iglooId')
    }

    async add(iglooId: number) {
        try {
            this.collect(await PrismaDatabase.iglooInventory.create({
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
