import GamePlugin from '@plugin/GamePlugin'

import { between } from '@utils/math'


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
            'pet_cookie': this.petCookie
        }
    }

    adoptPet(args, user) {
        user.pets.add(args.petId, args.name)
    }

    async getPets(args, user) {
        const owner = this.usersById[args.userId]
        const pets = owner ? owner.pets : await this.db.getPets(args.userId)

        user.send('get_pets', { pets: pets })
    }

    petMove(args, user) {
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
            energy: -between(10, 25),
            health: 10,
            rest: -between(10, 25)
        })

        // Different rest levels play different animation
        const playType = pet.rest > 80 ? 1 : pet.rest > 60 ? 2 : 0

        user.room.send(user, 'pet_play', { id: args.id, energy: pet.energy, health: pet.health, rest: pet.rest, playType: playType }, [])
    }

    petRest(args, user) {
        this.sendInteraction(user, args.id, 'pet_rest', {
            rest: between(15, 40)
        })
    }

    petFeed(args, user) {
        this.sendInteraction(user, args.id, 'pet_feed', {
            energy: between(15, 40)
        })
    }

    petBath(args, user) {
        this.sendInteraction(user, args.id, 'pet_bath', {
            health: between(15, 40),
            rest: between(5, 15)
        })
    }

    petGum(args, user) {
        this.sendInteraction(user, args.id, 'pet_gum', {
            energy: between(15, 40)
        })
    }

    petCookie(args, user) {
        this.sendInteraction(user, args.id, 'pet_cookie', {
            energy: between(15, 40)
        })
    }

    sendInteraction(user, petId, action, updates) {
        if (!user.pets.includes(petId)) return
        const pet = user.pets.get(petId)

        pet.updateStats(updates)

        user.room.send(user, action, { id: petId, energy: pet.energy, health: pet.health, rest: pet.rest }, [])
    }

}
