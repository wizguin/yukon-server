import { config } from '@config'

import type { Socket } from 'socket.io'

export default function(socket: Socket) {
    const headers = socket.handshake.headers

    const ipAddressHeader = config.rateLimit.ipAddressHeader

    if (ipAddressHeader && headers[ipAddressHeader]) {
        return getHeaderValue(headers[ipAddressHeader])
    }

    if (headers['x-forwarded-for']) {
        return getHeaderValue(headers['x-forwarded-for']).split(',')[0]
    }

    return socket.handshake.address
}

function getHeaderValue(header: string | string[]) {
    return Array.isArray(header)
        ? header[0]
        : header
}
