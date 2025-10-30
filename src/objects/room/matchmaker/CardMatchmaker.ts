import CardInstance from '@objects/instance/card/CardInstance'
import type GameUser from '@objects/user/GameUser'
import MatchmakerPlayer from './MatchmakerPlayer'
import type Room from '../Room'


const maxPlayers = 2
const matchEvery = 10

export default class CardMatchmaker {

    room: Room
    players: Record<number, MatchmakerPlayer> = {}

    constructor(matchmaker: any, room: Room) {
        Object.assign(this, matchmaker)

        this.room = room

        this.start()
    }

    start() {
        setInterval(this.tick.bind(this), 1000)
    }

    tick() {
        let values = Object.values(this.players)

        let matchesLength = values.length - values.length % maxPlayers

        if (!matchesLength) return

        this.sort(values)
        let matches = values.filter((p, i) => i < matchesLength)

        for (let i = 0; i < matchesLength; i += maxPlayers) {
            let matched = matches.slice(i, i + maxPlayers)

            this.updateMatched(matched)
        }
    }

    updateMatched(matched: MatchmakerPlayer[]) {
        let ready = matched.some(player => player.tick == -1)

        if (!ready) {
            this.onTick(matched)
            this.decreaseTick(matched)

            return
        }

        this.onMatch(matched)
    }

    onTick(matched: MatchmakerPlayer[]) {
        let users = matched.map(player => player.user.username)

        for (let player of matched) {
            player.send('tick_matchmaking', { tick: player.tick, users: users })
        }
    }

    onMatch(matched: MatchmakerPlayer[]) {
        for (let player of matched) {
            this.remove(player.user)
        }

        let users = matched.map(player => player.user)
        let instance = new CardInstance({ users: users })

        instance.init()
    }

    decreaseTick(matched: MatchmakerPlayer[]) {
        for (let player of matched) {
            player.tick -= 1
        }
    }

    add(user: GameUser) {
        if (!user.cards.hasCards) {
            return
        }

        this.players[user.id] = new MatchmakerPlayer(user, matchEvery)

        user.send('join_matchmaking')
    }

    remove(user: GameUser) {
        delete this.players[user.id]
    }

    includes(user: GameUser) {
        return user.id in this.players
    }

    sort(values: MatchmakerPlayer[]) {
        values.sort((a, b) => a.user.ninjaRank - b.user.ninjaRank)
    }

}
