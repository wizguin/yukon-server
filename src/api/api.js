import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import express from 'express'

import config from '../../config/config.json'


const app = express()

app.use(cors({ origin: config.cors.origin }))

for (let world in config.worlds) {
    let proxy = config.worlds[world]

    let path = `/world/${world.toLowerCase()}`

    app.use(path, createProxyMiddleware(path, {
        target: `http://${proxy.host}:${proxy.port}`,
        changeOrigin: true,
        ws: true
    }))
}

app.listen(config.api.port, () => {
    console.log(`[API] Started API on port ${config.api.port}`)
})
