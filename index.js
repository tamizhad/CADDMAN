const config = require("./config.js")
const express = require('express')
const fs = require('fs')
const cheerio = require('cheerio')
const path = require('path')
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express()
const port = process.env.APP_PORT;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get('/', (req, res) => {
    res.writeHead(302, {'Location': 'login'});
    res.end();
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
})


app.get('/home', async function(req, res){
    try{
        var html = fs.readFileSync(path.join(__dirname, 'public/client.html'));
        const $ = cheerio.load(html);

        var query = 'select * from '+config.db.clientList;
        var userObj = await executeQuery(query);
        for(var i =0 ;i<userObj.results.length;i++){
            var row =   '<tr id="client-list-'+(i+1)+'">'+
                            '<td>'+(i+1)+'</td>'+
                            '<td>'+(userObj.results[i].client_id)+'</td>'+
                            '<td>'+(userObj.results[i].client_name)+'</td>'+
                            '<td>'+(userObj.results[i].contact_person)+'</td>'+
                            '<td>'+(userObj.results[i].role)+'</td>'+
                            '<td>'+(userObj.results[i].contact_no)+'</td>'+
                            '<td>'+(userObj.results[i].email_id)+'</td>'+
                            '<td>'+(userObj.results[i].website_link)+'</td>'+
                            '<td>'+(userObj.results[i].address)+'</td>'+
                            '<td>'+(userObj.results[i].state)+'</td>'+
                            '<td>'+(userObj.results[i].sales)+'</td>'+
                            '<td>'+(userObj.results[i].lead_status)+'</td>'+
                            '<td>'+(userObj.results[i].due_date)+'</td>'+
                        '</tr>'
            $('table#client-list').append(row);
        }
        res.send($.html());
    }catch(err){
        res.sendFile(path.join(__dirname, 'public/internal-error.html'));
    }
})

app.post('/authenticate', async function(req, res){
    try{
        var username = req.body.username;
        var password = req.body.password;
        var query = 'select * from '+config.db.userInfo;
        var userObj = await executeQuery(query);

        for(user of userObj["results"]){
            if((user.username == username || user.email == username) && user.password == password){
                res.json({"code": 200, "success": "user authenticated", "user": user}).end();
                return;
            }
        }
        res.json({"code": 400, "error": "user not authenticated"}).end();
    }catch(err){
        res.json({"code": 400, "error": "/authenticate - internal error"}).end();
    }
})

async function getDbConnection(req, res){   
    return new Promise(async function(resolve, reject){
        try{
            console.log("getDbConnection");
            if(con && con.state == "authenticated"){
                resolve(con);
            }else{
                await con.connect(async function(err) {
                    if (err){
                        resolve(null);
                    }else{
                        resolve(con);
                    }                    
                });
            }
        }catch(err){
            resolve(null);
        }  
    })
}

async function executeQuery(queryStr){
    return new Promise(async function(resolve, reject){
        try{
            var dbCon = await getDbConnection();            
            await dbCon.query(queryStr, function(error, results, fields){
                if (error){
                    resolve(null);
                }else{
                    resolve({"error": error, "results": results, "fields": fields});
                }                
            });
        }catch(err){
            resolve(null);
        }
    });
}

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
})