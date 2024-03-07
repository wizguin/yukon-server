import GamePlugin from '@plugin/GamePlugin'

import { hasProps, isNumber, isInRange } from '@utils/validation'


// Frames allowed to be sent in pet_frame
const allowedFrames = [26, 32, 33]

export default class Pet extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'adopt_pet': this.adoptPet,
            'get_pets': this.getPets,
            'pet_move': this.petMove,
            'pet_play': this.petPlay,
            'pet_rest': this.petRest,
            'pet_feed': this.petFeed,
            'pet_bath': this.petBath,
            'pet_gum': this.petGum,
            'pet_cookie': this.petCookie,
            'pet_frame': this.petFrame,
            'pet_start_walk': this.petStartWalk
        }
    }

    adoptPet(args, user) {
        if (!hasProps(args, 'petId', 'name')) return

        user.pets.add(args.petId, args.name)
    }

    async getPets(args, user) {
        if (!hasProps(args, 'userId')) return
        if (!isNumber(args.userId)) return

        const owner = this.usersById[args.userId]
        const pets = owner ? owner.pets.values : await this.db.getPets(args.userId)

        user.send('get_pets', { pets: pets })
    }

    petMove(args, user) {
        if (!hasProps(args, 'x', 'y')) return
        if (!isInRange(args.x, 0, 1520)) return
        if (!isInRange(args.y, 0, 960)) return

        if (user.pets.includes(args.id)) {
            const pet = user.pets.get(args.id)

            pet.x = args.x
            pet.y = args.y

            user.room.send(user, 'pet_move', args)
        }
    }

    petPlay(args, user) {
        if (!user.pets.includes(args.id)) return
        const pet = user.pets.get(args.id)

        // Angry
        if (pet.rest < 20 || pet.happiness < 10) return

        pet.updateStats({
            energy: -10,
            health: 100,
            rest: -10
        })

        // Different rest levels play different animation
        const playType = pet.rest > 80 ? 1 : pet.rest > 60 ? 2 : 0

        user.room.send(user, 'pet_play', { id: args.id, energy: pet.energy, health: pet.health, rest: pet.rest, playType: playType }, [])
    }

    petRest(args, user) {
        this.sendInteraction(user, args.id, 'pet_rest', {
            energy: -10,
            rest: 100,
        })
    }

    petFeed(args, user) {
        this.sendInteraction(user, args.id, 'pet_feed', {
            energy: 100
        })
    }

    petBath(args, user) {
        this.sendInteraction(user, args.id, 'pet_bath', {
            energy: -20,
            health: 100,
            rest: 100,
        })
    }

    petGum(args, user) {
        this.sendInteraction(user, args.id, 'pet_gum', {
            health: -10
        })
    }

    petCookie(args, user) {
        this.sendInteraction(user, args.id, 'pet_cookie', {
            health: -10
        })
    }

    petFrame(args, user) {
        if (!user.pets.includes(args.id)) return
        if (!allowedFrames.includes(args.frame)) return

        user.room.send(user, 'pet_frame', { id: args.id, frame: args.frame }, [])
    }

    petStartWalk(args, user) {
        user.startWalkingPet(args.id)
    }

    sendInteraction(user, petId, action, updates) {
        if (!user.pets.includes(petId)) return
        const pet = user.pets.get(petId)

        pet.updateStats(updates)

        user.room.send(user, action, { id: petId, energy: pet.energy, health: pet.health, rest: pet.rest }, [])
    }

}
