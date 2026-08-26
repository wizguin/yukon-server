import GamePlugin from '@plugin/GamePlugin'

import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import { type } from 'arktype'

const JoinTable = type({
    table: 'number'
})

export default class Table extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            get_tables: this.getTables,
            join_table: this.joinTable,
            leave_table: this.leaveTable
        }
    }

    getTables(args: unknown, user: GameUser) {
        if (!user.room) {
            return
        }

        const tables = Object.fromEntries(Object.values(user.room.tables).map(table => {
            const users = table.users.map(user => user.username)

            return [table.id, users]
        }))

        user.send('get_tables', { tables })
    }

    joinTable(args: unknown, user: GameUser) {
        const { table: tableId } = JoinTable.assert(args)

        if (!user.room) {
            return
        }

        const table = user.room.tables[tableId]

        user.joinTable(table)
    }

    leaveTable(args: unknown, user: GameUser) {
        if (user.minigameRoom) {
            user.minigameRoom.remove(user)
        }
    }

}
