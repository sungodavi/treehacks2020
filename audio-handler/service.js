
const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')


// parse application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({
    extended: false
}))

let cur;
app.post('/', (req, res) => {
    console.log(req.body);
    cur = req.body;
    res.json(req.body);

})

app.get('/', (req, res) => {
    res.json(cur);
})

app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))