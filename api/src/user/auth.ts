import Database from '../../../src/database/Database'
import Errors from '../errors/Errors'

import { compare } from 'bcrypt'
import { type } from 'arktype'

const Login = type({
    username: 'string.trim |> 4 <= string <= 12',
    password: '3 <= string <= 128'
})

const TokenLogin = type({
    username: 'string.trim |> 4 <= string <= 12',
    token: 'string'
})

export async function authenticateUser(input: unknown) {
    const body = Login.assert(input)

    const { username, password } = body

    const user = await getUserWithBan(username)

    if (!user) {
        return { error: Errors.UserNotFound }
    }

    const match = await compare(password, user.password)

    if (!match) {
        return { error: Errors.IncorrectPassword }
    }

    const ban = getBan(user)

    if (ban) {
        return { error: ban.error }
    }

    return { user }
}

export async function authenticateToken(input: unknown) {
    const { username, token } = TokenLogin.assert(input)

    const parts = token.split(':')

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return { error: Errors.IncorrectPassword }
    }

    const [selector, validator] = parts
    const user = await getUserWithBan(username)

    if (!user) {
        return { error: Errors.UserNotFound }
    }

    const authToken = await Database.authToken.findUnique({
        where: {
            userId_selector: {
                userId: user.id,
                selector
            }
        }
    })

    if (!authToken) {
        return { error: Errors.IncorrectPassword }
    }

    const match = await compare(validator, authToken.validator)

    if (!match) {
        return { error: Errors.IncorrectPassword }
    }

    const ban = getBan(user)

    if (ban) {
        return { error: ban.error }
    }

    return { user }
}

async function getUserWithBan(username: string) {
    return Database.user.findUnique({
        where: { username },
        include: {
            bans: {
                where: { expires: { gt: new Date() } },
                orderBy: { expires: 'desc' },
                take: 1
            }
        }
    })
}

function getBan(user: NonNullable<Awaited<ReturnType<typeof getUserWithBan>>>) {
    if (user.permaBan) {
        return { error: Errors.BannedForever }
    }

    const ban = user.bans[0]

    if (!ban) {
        return false
    }

    const hours = Math.round((ban.expires.getTime() - Date.now()) / 60 / 60 / 1000)

    return { error: Errors.Banned.replace('{hours}', String(hours)) }
}
