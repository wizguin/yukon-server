import GamePlugin from '@plugin/GamePlugin'

import type User from '@objects/user/User'

import { type } from 'arktype'

const JoinTable = type({
    table: 'number.integer'
})

export default class Table extends GamePlugin {

    events = {
        get_tables: this.getTables,
        join_table: this.joinTable,
        leave_table: this.leaveTable
    }

    getTables(args: unknown, user: User) {
        if (!user.room) {
            return
        }

        const tables = Object.fromEntries(Object.values(user.room.tables).map(table => {
            const users = table.users.map(user => user.username)

            return [table.id, users]
        }))

        user.send('get_tables', { tables })
    }

    joinTable(args: unknown, user: User) {
        const { table: tableId } = JoinTable.assert(args)

        if (!user.room) {
            return
        }

        const table = user.room.tables[tableId]

        user.joinTable(table)
    }

    leaveTable(args: unknown, user: User) {
        if (user.minigameRoom) {
            user.minigameRoom.remove(user)
        }
    }

}
