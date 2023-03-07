const config = require("./config.js")
// import { config } from './config.js'
const express = require('express')
const path = require('path')
const mysql = require('mysql');
const app = express()
const port = 7000

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/client.html'));
})

app.get('/authenticate', function(req, res){
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "my_db"
    });

    con.connect(function(err) {
        if (err){
            res.json({"code": 400, "error": "Unable to connect to database"});
        }else{
            console.log("Connected!");
            con.query("select * from "+config.db.userInfo, function(error, results, fields){
                if(err){
                    res.json({"code": 400, "error": "Unable to execute query"});
                }else{
                    console.log(error+results+fields);
                }                
            });
        }            
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})