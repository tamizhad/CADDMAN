const config = require("./config.js")
const express = require('express')
const fs = require('fs')
const cheerio = require('cheerio')
const path = require('path')
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
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
            var row =   '<tr id="'+(userObj.results[i].id)+'">'+
                            '<td class="data-sno">'+(i+1)+'</td>'+
                            '<td class="data-clientId">'+(userObj.results[i].client_id)+'</td>'+
                            '<td class="data-client-name">'+(userObj.results[i].client_name)+'</td>'+
                            '<td class="data-client-contact-person">'+(userObj.results[i].contact_person)+'</td>'+
                            '<td class="data-role">'+(userObj.results[i].role)+'</td>'+
                            '<td class="data-contact-no">'+(userObj.results[i].contact_no)+'</td>'+
                            '<td class="data-email">'+(userObj.results[i].email_id)+'</td>'+
                            '<td class="data-client-website">'+(userObj.results[i].website_link)+'</td>'+
                            '<td class="data-client-address">'+(userObj.results[i].address)+'</td>'+
                            '<td class="data-client-state">'+(userObj.results[i].state)+'</td>'+
                            '<td class="data-client-sales">'+(userObj.results[i].sales)+'</td>'+
                            '<td class="data-client-lead-status">'+(userObj.results[i].lead_status)+'</td>'+
                            '<td class="data-due-date" class="text-nowrap">'+(userObj.results[i].due_date)+'</td>'+
                            '<td class="data-action" class="text-center"><span class="glyphicon glyphicon-edit edit" data-toggle="modal" data-target="#addClient"></span><span class="glyphicon glyphicon-trash delete" query-type="delete-row"></span></td>'+
                        '</tr>'
            $('table tbody').append(row);
        }


        res.send($.html());
    }catch(err){
        console.log(err);
        res.sendFile(path.join(__dirname, 'public/internal-error.html'));
    }
})

app.post('/authenticate', async function(req, res){
    try{
        var username = req.body.username;
        var password = req.body.password;
        var query = 'select * from '+config.db.userList;
        var userObj = await executeQuery(query);

        for(user of userObj["results"]){
            if((user.username == username || user.email == username) && user.password == password){
                res.json({"code": 200, "success": "user authenticated", "user": user}).end();
                return;
            }
        }
        res.json({"code": 400, "error": "user not authenticated"}).end();
    }catch(err){
        console.log(err);
        res.json({"code": 400, "error": "/authenticate - internal error"}).end();
    }
})

app.post('/update-db', async function(req, res){
    try{
        var queryType = req.body.queryType;
        
        var query = config.db.query[queryType];
        for(var key in req.body){
            query = query.replace('{{'+key+'}}', req.body[key]);
        }

        if(req.body.dataType){
            query = query.replace('{{tableName}}', req.body.dataType+"_list");    
        }        

        query = query.replace('{{table}}', config.db[config.db.table[queryType]]);
        query = query.replace('{{id}}', uuidv4());
        query = query.replace('{{createdTime}}', new Date());

        if(/{{\w+}}/.test(query)){
            res.json({"code": 400, "error": "value not replace properly"}).end();
            return;
        }
        
        var resultObj = await executeQuery(query);
        if(resultObj && resultObj.status == 'success'){
            res.json({"code": 200, "message": "db updated"}).end();
            return;
        }
        if(queryType == 'add-user' && resultObj && resultObj.status == 'failed' && resultObj.error && resultObj.error.code == 'ER_DUP_ENTRY'){
            res.json({"code": 400, "message": "duplicate username"}).end();
            return;
        }
        res.json({"code": 400, "error": "db not updated"}).end();
    }catch(err){
        console.log(err);
        res.json({"code": 400, "error": "/update-db - internal error"}).end();
    }
})

async function getDbConnection(req, res){   
    return new Promise(async function(resolve, reject){
        try{
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
            console.log(err);
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
                    resolve({"error": error, "results": results, "fields": fields, "status": "failed"});
                }else{
                    resolve({"error": error, "results": results, "fields": fields, "status": "success"});
                }                
            });
        }catch(err){
            console.log(err);
            resolve({"error": error, "results": results, "fields": fields, "status": "failed"});
        }
    });
}

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
})