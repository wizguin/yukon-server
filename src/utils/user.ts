import type { UserSelect, UserWhereUniqueInput } from '../generated/prisma/models'
import Database from '@database/Database'

export async function getUserById(id: number) {
    if (!id) {
        return null
    }

    return getUser({ id })
}

export async function getUserByUsername(username: string) {
    if (!username) {
        return null
    }

    return getUser({ username })
}

export async function userIdExists(userId: number) {
    if (!userId) {
        return false
    }

    const user = await getUser({ id: userId }, { id: true })

    return user !== null
}

export async function usernameExists(username: string) {
    if (!username) {
        return false
    }

    const user = await getUser({ username }, { id: true })

    return user !== null
}

async function getUser(where: UserWhereUniqueInput, select?: UserSelect) {
    return Database.user.findUnique({
        where,
        select
    })
}

export async function getUsername(userId: number) {
    const user = await getUser({ id: userId }, { username: true })

    return user?.username ?? ''
}
