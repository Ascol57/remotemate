
const express = require('express')
const app = express()
const port = 3000

castmateConfig = {
    host: "localhost",
    port: "8181"
}

app.use(express.static('public'))

app.get('/config/:hostname/:port', (req, res) => {
    castmateConfig.host = req.params.hostname
    castmateConfig.port = req.params.port
    res.send('OK')
})

app.get('/proxy/*', (req, res) => {
    url = req.originalUrl.split('/').slice(2).join('/')
    fetch(`http://${castmateConfig.host}:${castmateConfig.port}/${url}`)
        .then(async (response) => {
            return await response.text()
        })
        .then((data) => {
            res.send(data)
        })
        .catch(function (err) {
            res.status(404)
        });
})

app.post('/proxy/*', (req, res) => {
    url = req.originalUrl.split('/').slice(2).join('/')
    fetch(`http://${castmateConfig.host}:${castmateConfig.port}/${url}`, { method: "POST" })
        .then(async (response) => {
            return await response.text()
        })
        .then((data) => {
            res.send(data)
        })
        .catch(function (err) {
            res.status(404)
        });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})