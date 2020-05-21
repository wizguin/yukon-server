import Sequelize from 'sequelize'
import Users from './tables/Users'


export default class Database {

    constructor(config) {
        this.sequelize = new Sequelize(
            config.database,
            config.user,
            config.password, {
                host: config.host,
                dialect: config.dialect,
                logging: (config.debug) ? console.log : false
        })

        this.users = Users.init(this.sequelize, Sequelize)

        this.sequelize
            .authenticate()
            .then(() => {
                console.log('[Database] Connected to database')
            })
            .catch(error => {
                console.error(`[Database] Unable to connect to the database: ${error}`)
            })
    }


    getUserByUsername(username) {
        return this.users.findOne({
            where: { username: username },
            attributes: { exclude: ['password'] }

        }).then(function(userData) {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

}
