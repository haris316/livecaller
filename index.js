const express = require('express');
const https = require("https");
const axios = require("axios");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const port = process.env.PORT || 7000;
const app = express();
app.use(express.json());
const agent = new https.Agent({
    rejectUnauthorized: false
})

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    next();
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

setInterval(function () {
    fetch("https://fantasydraft-beta.vercel.app/api/cron/live", { agent }).then((res) => {
        console.log(res.statusText);
    })
}, 60 * 1000);

app.get('/', (req, res) => {
    res.send('Hello World');
});