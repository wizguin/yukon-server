import CardInstance from '@objects/instance/card/CardInstance'
import type Handler from '../../../handler/Handler'
import MatchmakerPlayer from './MatchmakerPlayer'
import type Room from '../Room'
import type User from '@objects/user/User'

const maxPlayers = 2
const matchEvery = 10

export default class CardMatchmaker {

    handler: Handler
    room: Room
    players: Record<number, MatchmakerPlayer> = {}

    constructor(matchmaker: any, room: Room, handler: Handler) {
        Object.assign(this, matchmaker)

        this.handler = handler
        this.room = room

        this.start()
    }

    start() {
        setInterval(() => {
            try {
                this.tick()
            } catch (error) {
                this.handler.handleError(error)
            }
        }, 1000)
    }

    tick() {
        const values = Object.values(this.players)

        const matchesLength = values.length - values.length % maxPlayers

        if (!matchesLength) {
            return
        }

        this.sort(values)
        const matches = values.filter((p, i) => i < matchesLength)

        for (let i = 0; i < matchesLength; i += maxPlayers) {
            const matched = matches.slice(i, i + maxPlayers)

            this.updateMatched(matched)
        }
    }

    updateMatched(matched: MatchmakerPlayer[]) {
        const ready = matched.some(player => player.tick == -1)

        if (!ready) {
            this.onTick(matched)
            this.decreaseTick(matched)

            return
        }

        this.onMatch(matched)
    }

    onTick(matched: MatchmakerPlayer[]) {
        const users = matched.map(player => player.user.username)

        for (const player of matched) {
            player.send('tick_matchmaking', { tick: player.tick, users })
        }
    }

    onMatch(matched: MatchmakerPlayer[]) {
        for (const player of matched) {
            this.remove(player.user)
        }

        const users = matched.map(player => player.user)
        const instance = new CardInstance(users)

        instance.init()
    }

    decreaseTick(matched: MatchmakerPlayer[]) {
        for (const player of matched) {
            player.tick -= 1
        }
    }

    add(user: User) {
        if (!user.cards.hasCards) {
            return
        }

        this.players[user.id] = new MatchmakerPlayer(user, matchEvery)

        user.send('join_matchmaking')
    }

    remove(user: User) {
        delete this.players[user.id]
    }

    includes(user: User) {
        return user.id in this.players
    }

    sort(values: MatchmakerPlayer[]) {
        values.sort((a, b) => a.user.ninjaRank - b.user.ninjaRank)
    }

}
