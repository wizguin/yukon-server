export default function(socket, config) {
    let headers = socket.handshake.headers

    let ipAddressHeader = config.rateLimit.ipAddressHeader

    if (ipAddressHeader && headers[ipAddressHeader]) {
        return headers[ipAddressHeader]
    }

    if (headers['x-forwarded-for']) {
        return headers['x-forwarded-for'].split(',')[0]
    }

    return socket.handshake.address
}
