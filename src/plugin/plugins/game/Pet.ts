import GamePlugin from '@plugin/GamePlugin'

import { X, Y } from '@utils/validation'
import Database from '@database/Database'
import type GameUser from '@objects/user/GameUser'
import type { PetModel } from '../../../generated/prisma/models'

import { type } from 'arktype'

const AdoptPet = type({
    typeId: 'number.integer',
    name: 'string'
})

const GetPets = type({
    userId: 'number.integer'
})

const PetMove = type({
    id: 'number.integer',
    x: X,
    y: Y
})

const PetFrame = type({
    id: 'number.integer',
    frame: '26 | 32 | 33'
})

const PetId = type({
    id: 'number.integer'
})

export default class Pet extends GamePlugin {

    events = {
        adopt_pet: this.adoptPet,
        get_pets: this.getPets,
        pet_move: this.petMove,
        pet_play: this.petPlay,
        pet_rest: this.petRest,
        pet_feed: this.petFeed,
        pet_bath: this.petBath,
        pet_gum: this.petGum,
        pet_cookie: this.petCookie,
        pet_frame: this.petFrame,
        pet_start_walk: this.petStartWalk
    }

    async adoptPet(args: unknown, user: GameUser) {
        const { typeId, name } = AdoptPet.assert(args)

        await user.pets.add(typeId, name)
    }

    async getPets(args: unknown, user: GameUser) {
        const { userId } = GetPets.assert(args)

        const owner = this.usersById[userId]

        const pets = owner ? owner.pets : await this.getOfflinePets(userId)

        user.send('get_pets', { pets })
    }

    petMove(args: unknown, user: GameUser) {
        const { id, x, y } = PetMove.assert(args)

        const pet = user.pets.get(id)

        if (!pet) {
            return
        }

        pet.x = x
        pet.y = y

        if (user.room) {
            user.room.send(user, 'pet_move', { id, x, y })
        }
    }

    petPlay(args: unknown, user: GameUser) {
        const { id } = PetId.assert(args)

        const pet = user.pets.get(id)

        if (!pet) {
            return
        }

        // Angry
        if (pet.rest < 20 || pet.happiness < 10) {
            return
        }

        pet.updateStats({
            energy: -10,
            health: 100,
            rest: -10
        })

        // Different rest levels play different animation
        const playType = pet.rest > 80 ? 1 : pet.rest > 60 ? 2 : 0

        if (user.room) {
            user.room.send(user, 'pet_play', { id, energy: pet.energy, health: pet.health, rest: pet.rest, playType }, [])
        }
    }

    petRest(args: unknown, user: GameUser) {
        const { id } = PetId.assert(args)

        this.sendInteraction(user, id, 'pet_rest', {
            energy: -10,
            rest: 100
        })
    }

    petFeed(args: unknown, user: GameUser) {
        const { id } = PetId.assert(args)

        this.sendInteraction(user, id, 'pet_feed', {
            energy: 100
        })
    }

    petBath(args: unknown, user: GameUser) {
        const { id } = PetId.assert(args)

        this.sendInteraction(user, id, 'pet_bath', {
            energy: -20,
            health: 100,
            rest: 100
        })
    }

    petGum(args: unknown, user: GameUser) {
        const { id } = PetId.assert(args)

        this.sendInteraction(user, id, 'pet_gum', {
            health: -10
        })
    }

    petCookie(args: unknown, user: GameUser) {
        const { id } = PetId.assert(args)

        this.sendInteraction(user, id, 'pet_cookie', {
            health: -10
        })
    }

    petFrame(args: unknown, user: GameUser) {
        const { id, frame } = PetFrame.assert(args)

        if (!user.pets.includes(id)) {
            return
        }

        if (user.room) {
            user.room.send(user, 'pet_frame', { id, frame }, [])
        }
    }

    async petStartWalk(args: unknown, user: GameUser) {
        const { id } = PetId.assert(args)

        await user.startWalkingPet(id)
    }

    sendInteraction(user: GameUser, petId: number, action: string, updates: Record<string, number>) {
        const pet = user.pets.get(petId)

        if (!pet) {
            return
        }

        pet.updateStats(updates)

        if (user.room) {
            user.room.send(user, action, { id: petId, energy: pet.energy, health: pet.health, rest: pet.rest }, [])
        }
    }

    async getOfflinePets(userId: number) {
        const records = await Database.pet.findMany({
            where: {
                userId
            }
        })

        return records.map(record => this.formatOfflinePet(record))
    }

    formatOfflinePet({ id, typeId, name, energy, health, rest }: PetModel) {
        return {
            id,
            typeId,
            name,
            energy,
            health,
            rest,
            x: 0,
            y: 0,
            walking: false
        }
    }

}
