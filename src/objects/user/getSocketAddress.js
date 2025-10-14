export default function(socket, config) {
    let headers = socket.handshake.headers
    let ipAddressHeader = config.rateLimit.ipAddressHeader

    // Validate IP address format
    const isValidIP = (ip) => {
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
        return ipv4Regex.test(ip) || ipv6Regex.test(ip)
    }

    // Get IP from configured header
    if (ipAddressHeader && headers[ipAddressHeader]) {
        const ip = headers[ipAddressHeader].split(',')[0].trim()
        if (isValidIP(ip)) return ip
    }

    // Get IP from X-Forwarded-For header
    if (headers['x-forwarded-for']) {
        const ips = headers['x-forwarded-for'].split(',').map(ip => ip.trim())
        // Get the first valid IP from the list
        for (const ip of ips) {
            if (isValidIP(ip)) return ip
        }
    }

    // Fallback to socket address
    const socketAddress = socket.handshake.address
    if (isValidIP(socketAddress)) return socketAddress

    // If no valid IP is found, return a default or throw an error
    throw new Error('Invalid IP address detected')
}
