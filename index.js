const express = require('express')
const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const app = express()
const port = 3000

app.set('view engine', 'ejs');
app.use('/public', express.static('public'))
app.use(express.json());

const key = fs.readFileSync('key.pem');
const cert = fs.readFileSync('cert.pem');

const server = https.createServer({key: key, cert: cert }, app);
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to database.');
  });

app.get('/', (req, res) => {
    db.all(`SELECT testID, lat, long, location, rssi FROM tests`, [], (err, rows) => {
        res.render('index', {"tests":rows}) 
    });
  
})

app.post('/newLocation', (req, res) => {
    var location = req.body.location;
    var rssi = req.body.rssi;
    var lat = req.body.lat;
    var long = req.body.long;
    if (location && rssi && lat && long){
        db.run(`INSERT INTO tests(location, rssi, lat, long)
            VALUES(?, ?, ?, ?)`, 
            [location, rssi, lat, long])
        res.sendStatus(200)
    } else {
        res.sendStatus(400)
    }
})