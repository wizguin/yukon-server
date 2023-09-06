import CardInstance from '@objects/instance/card/CardInstance'
import MatchmakerPlayer from './MatchmakerPlayer'


export default class CardMatchmaker {

    constructor(matchmaker, room) {
        Object.assign(this, matchmaker)

        this.room = room

        this.maxPlayers = 2
        this.matchEvery = 10

        this.players = {}

        this.start()
    }

    start() {
        setInterval(this.tick.bind(this), 1000)
    }

    tick() {
        let values = Object.values(this.players)

        let matchesLength = values.length - values.length % this.maxPlayers

        if (!matchesLength) return

        this.sort(values)
        let matches = values.filter((p, i) => i < matchesLength)

        for (let i = 0; i < matchesLength; i += this.maxPlayers) {
            let matched = matches.slice(i, i + this.maxPlayers)

            this.updateMatched(matched)
        }
    }

    updateMatched(matched) {
        let ready = matched.some(player => player.tick == -1)

        if (!ready) {
            this.onTick(matched)
            this.decreaseTick(matched)

            return
        }

        this.onMatch(matched)
    }

    onTick(matched) {
        let users = matched.map(player => player.user.username)

        for (let player of matched) {
            player.send('tick_matchmaking', { tick: player.tick, users: users })
        }
    }

    onMatch(matched) {
        for (let player of matched) {
            this.remove(player.user)
        }

        let users = matched.map(player => player.user)
        let instance = new CardInstance({ users: users })

        instance.init()
    }

    decreaseTick(matched) {
        for (let player of matched) {
            player.tick -= 1
        }
    }

    add(user) {
        if (!user.cards.hasCards) {
            return
        }

        this.players[user.id] = new MatchmakerPlayer(user, this.matchEvery)

        user.send('join_matchmaking')
    }

    remove(user) {
        delete this.players[user.id]
    }

    includes(user) {
        return user.id in this.players
    }

    sort(values) {
        values.sort((a, b) => a.user.ninjaRank - b.user.ninjaRank)
    }

}
