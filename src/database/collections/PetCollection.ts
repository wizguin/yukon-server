import BaseCollection from '@database/BaseCollection'

import { InsufficientCoinsError, PetLimitError } from '@utils/error'
import Pet, { type Update } from '@objects/pet/Pet'
import Database from '@database/Database'
import type GameUser from '@objects/user/GameUser'
import { pets } from '@data'
import type User from '@objects/user/User'

import { type Pet as PrismaPet } from '../../generated/prisma/client'

interface SendUpdate extends Required<Update> {
    id: number
}

const adoptPostcard = 111
const maxPets = 18
const nameRegex = /^[a-z ]{1,12}$/

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
        if (!(typeId in pets)) {
            return
        }

        if (!nameRegex.test(name)) {
            this.user.send('error', { error: 'Sorry, this name is not available. Please try again' })
            return
        }

        const { cost } = pets[typeId]

        const user = this.user as GameUser
        let record: PrismaPet

        try {
            record = await this.insertPetRecord(typeId, name, cost)

        } catch (error) {
            if (error instanceof PetLimitError) {
                return
            }

            if (error instanceof InsufficientCoinsError) {
                user.send('error', { error: 'You need more coins.' })
                return
            }

            throw error
        }

        const pet = createPet(user, record)

        this.collect(pet)

        // todo: move this to user.addPet, collection should only be creating records and collecting records
        user.send('adopt_pet', { id: record.id, coins: user.coins })
        await user.addSystemMail(adoptPostcard, name)
    }

    private insertPetRecord(typeId: number, name: string, cost: number) {
        return (this.user as GameUser).purchase(cost, async tx => {
            const count = await tx.pet.count({
                where: {
                    userId: this.user.id
                }
            })

            if (count >= maxPets) {
                throw new PetLimitError()
            }

            return tx.pet.create({
                data: {
                    userId: this.user.id,
                    typeId,
                    name
                }
            })
        })
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

            this.uncollect(petId)

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

    toJSON() {
        return [...this.values]
    }

}

function createPet(user: GameUser, { id, userId, typeId, name, adoptionDate, energy, health, rest, feedPostcardId }: PrismaPet) {
    return new Pet(user, id, userId, typeId, name, adoptionDate, energy, health, rest, feedPostcardId)
}
