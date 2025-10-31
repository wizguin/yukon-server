import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import { isNumber } from '@utils/validation'

export default class Table extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            get_tables: this.getTables,
            join_table: this.joinTable,
            leave_table: this.leaveTable
        }
    }

    getTables(args: Args, user: GameUser) {
        if (!user.room) {
            return
        }

        const tables = Object.fromEntries(Object.values(user.room.tables).map(table => {
            const users = table.users.map(user => user.username)

            return [table.id, users]
        }))

        user.send('get_tables', { tables })
    }

    joinTable(args: Args, user: GameUser) {
        if (!isNumber(args.table)) {
            return
        }

        if (!user.room) {
            return
        }

        const table = user.room.tables[args.table]

        user.joinTable(table)
    }

    leaveTable(args: Args, user: GameUser) {
        if (user.minigameRoom) {
            user.minigameRoom.remove(user)
        }
    }

}
