const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const trains = {}
function trainPing(request, response) {
    console.log('recieved', request.body)
    trains[request.body.macAddress] = request.body
    trains[request.body.macAddress].ip = request.ip
    response.send('ok')
}

function getTrains(request, response) {
    response.send(trains)
}
app.put('/api/train', trainPing)
app.get('/api/trains', getTrains)
app.use(express.static('../MobileController'))
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))