import GamePlugin from '@plugin/GamePlugin'


export default class Table extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'get_tables': this.getTables,
            'join_table': this.joinTable,
            'leave_table': this.leaveTable
        }
    }

    getTables(args, user) {
        let tables = Object.fromEntries(Object.values(user.room.tables).map(table => {
            let users = table.users.map(user => user.username)

            return [table.id, users]
        }))

        user.send('get_tables', { tables: tables })
    }

    joinTable(args, user) {
        let table = user.room.tables[args.table]

        user.joinTable(table)
    }

    leaveTable(args, user) {
        if (user.minigameRoom) {
            user.minigameRoom.remove(user)
        }
    }

}
