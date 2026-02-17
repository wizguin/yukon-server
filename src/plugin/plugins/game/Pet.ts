import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'
import type { PetModel } from '../../../generated/prisma/models'
import Database from '@database/Database'

import { hasProps, isInRange, isNumber } from '@utils/validation'

// Frames allowed to be sent in pet_frame
const allowedFrames = [26, 32, 33]

export default class Pet extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
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
    }

    adoptPet(args: Args, user: GameUser) {
        if (!hasProps(args, 'typeId', 'name')) {
            return
        }

        user.pets.add(args.typeId, args.name)
    }

    async getPets(args: Args, user: GameUser) {
        if (!hasProps(args, 'userId')) {
            return
        }

        if (!isNumber(args.userId)) {
            return
        }

        const owner = this.usersById[args.userId]

        const pets = owner ? owner.pets : await this.getOfflinePets(args.userId)

        user.send('get_pets', { pets })
    }

    petMove(args: Args, user: GameUser) {
        if (!hasProps(args, 'x', 'y')) {
            return
        }

        if (!isInRange(args.x, 0, 1520)) {
            return
        }

        if (!isInRange(args.y, 0, 960)) {
            return
        }

        const pet = user.pets.get(args.id)

        if (!pet) {
            return
        }

        pet.x = args.x
        pet.y = args.y

        if (user.room) {
            user.room.send(user, 'pet_move', args)
        }
    }

    petPlay(args: Args, user: GameUser) {
        const pet = user.pets.get(args.id)

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
            user.room.send(user, 'pet_play', { id: args.id, energy: pet.energy, health: pet.health, rest: pet.rest, playType }, [])
        }
    }

    petRest(args: Args, user: GameUser) {
        this.sendInteraction(user, args.id, 'pet_rest', {
            energy: -10,
            rest: 100
        })
    }

    petFeed(args: Args, user: GameUser) {
        this.sendInteraction(user, args.id, 'pet_feed', {
            energy: 100
        })
    }

    petBath(args: Args, user: GameUser) {
        this.sendInteraction(user, args.id, 'pet_bath', {
            energy: -20,
            health: 100,
            rest: 100
        })
    }

    petGum(args: Args, user: GameUser) {
        this.sendInteraction(user, args.id, 'pet_gum', {
            health: -10
        })
    }

    petCookie(args: Args, user: GameUser) {
        this.sendInteraction(user, args.id, 'pet_cookie', {
            health: -10
        })
    }

    petFrame(args: Args, user: GameUser) {
        if (!user.pets.includes(args.id)) {
            return
        }
        if (!allowedFrames.includes(args.frame)) {
            return
        }

        if (user.room) {
            user.room.send(user, 'pet_frame', { id: args.id, frame: args.frame }, [])
        }
    }

    petStartWalk(args: Args, user: GameUser) {
        user.startWalkingPet(args.id)
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
