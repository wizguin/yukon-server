import BaseCollection from '@database/BaseCollection'

import { isLength, isString } from '@utils/validation'
import Pet, { type Update } from '@objects/pet/Pet'
import type GameUser from '@objects/user/GameUser'
import { pets } from '@data'
import Database from '@database/Database'
import type User from '@objects/user/User'

import { type Pet as PrismaPet } from '../../generated/prisma/client'

interface SendUpdate extends Required<Update> {
    id: number
}

const adoptPostcard = 111
const maxPets = 18
const nameRegex = /^[a-z ]+$/i

// 3.6 minutes
const updateInterval = 3.6 * 60000

export default class PetCollection extends BaseCollection<Pet> {

    petUpdate: NodeJS.Timeout

    constructor(user: User, records: PrismaPet[]) {
        const pets = records.map(record => createPet(user as GameUser, record))

        super(user, pets, 'id')

        // First update happens immediately
        this.petUpdate = setTimeout(() => this.updatePets(), 1)
    }

    async add(typeId: number, name: string) {
        // todo: max check

        if (!(typeId in pets)) {
            return
        }

        if (!this.checkName(name)) {
            this.user.send('error', { error: 'Sorry, this name is not available. Please try again' })
            return
        }

        const { cost } = pets[typeId]

        if (this.user.coins < cost) {
            this.user.send('error', { error: 'You need more coins.' })
            return
        }

        try {
            const record = await Database.pet.create({
                data: {
                    userId: this.user.id,
                    typeId,
                    name
                }
            })

            // todo: no casting
            const user = this.user as GameUser

            const pet = createPet(user, record)

            this.collect(pet)

            user.updateCoins(-cost)
            user.send('adopt_pet', { id: record.id, coins: user.coins })
            user.addSystemMail(adoptPostcard, name)

        } catch (error) {
            console.error(error)
        }
    }

    async remove(petId: number) {
        if (!this.includes(petId)) {
            return
        }

        try {
            await Database.pet.delete({
                where: {
                    id: petId
                }
            })

            super.remove(petId)

        } catch (error) {
            console.error(error)
        }
    }

    async updatePets() {
        const updates: SendUpdate[] = []

        for (const pet of this.values) {
            const update = await pet.update()

            if (update) {
                updates.push(update)
            }
        }

        if (updates.length) {
            this.sendUpdates(updates)
        }

        // Schedule next update
        this.petUpdate = setTimeout(() => this.updatePets(), updateInterval)
    }

    sendUpdates(updates: SendUpdate[]) {
        const user = this.user as GameUser

        if (user.inOwnIgloo() && user.room) {
            user.room.send(user, 'update_pets', { updates }, [])
        }
    }

    stopPetUpdate() {
        clearTimeout(this.petUpdate)
    }

    checkName(name: string) {
        return isString(name) && isLength(name, 1, 12) && nameRegex.test(name)
    }

    toJSON() {
        return [...this.values]
    }

}

function createPet(user: GameUser, { id, userId, typeId, name, adoptionDate, energy, health, rest, feedPostcardId }: PrismaPet) {
    return new Pet(user, id, userId, typeId, name, adoptionDate, energy, health, rest, feedPostcardId)
}
