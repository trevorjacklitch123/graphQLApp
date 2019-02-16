const express = require('express');
const bodyParser = require('body-parser');
const graphQL = require('graphql');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json("Hello World");
})

app.listen(4000);