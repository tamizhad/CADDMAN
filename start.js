const config = require("./config.js")
const express = require('express')
const fs = require('fs')
const cheerio = require('cheerio')
const path = require('path')
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const app = express()
const port = process.env.APP_PORT;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'atg237gyjhf4jgdghs7jw8wjp',
    resave: false,
    saveUninitialized: false
}))

var staffList;

var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get('/', (req, res) => {
    res.writeHead(302, {'Location': 'login'});
    res.end();
    return;
})

app.get('/login', (req, res) => {
    if(req.session.isAutheticated){
        res.writeHead(302, {'Location': 'home'});
        res.end();
        return;
    }else{
        res.sendFile(path.join(__dirname, 'public/login.html'));
    }    
})

app.post('/logout', (req, res) => {
    try{
        delete req.session.fname;
        delete req.session.lname;
        delete req.session.username;
        delete req.session.email;
        delete req.session.password;
        delete req.session.role;
        delete req.session.userId;
        req.session.isAutheticated = false;
        res.json({"code": 200, "success": "user logged out"}).end();
    }catch(err){
        res.json({"code": 404, "error": "/logout - internal error"}).end();
    }
})

async function convertJsonToHTML(jsonObj, dataType, selector){
    var html = fs.readFileSync(path.join(__dirname, 'public/client.html'));
    var $ = cheerio.load(html);
    var cnt = 1;
    
    //To get staff list
    if( (selector && /{{sales}}/.test($(selector).toString())) || /{{sales}}/.test($.html())){
        if(staffList){
            $ = await updateTemplateForStaffList($, staffList);
        }else{
            var query = await getQuery('', '', 'get-staff', 'user');
            staffList = await executeQuery(query);
            $ = await updateTemplateForStaffList($, staffList);
        }
    }

    for(var i =0 ;i<jsonObj.results.length;i++){
        var template = $('.main-panel#'+dataType+' #'+dataType+'-list-template').toString();
        for(var key in jsonObj.results[i]){
            var replace = "{{"+key+"}}";
            var re = new RegExp(replace,"g");
            template = template.replace(re, jsonObj.results[i][key]);
        }
        template = template.replace('{{sno}}', (cnt++));
        $('table tbody').append($(template).removeClass('hide').attr('id', jsonObj.results[i].id));
    }

    $('.main-panel .count .value').text(jsonObj.results.length);

    //To set overdue for due-dates
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let curDate = date+"-"+month+"-"+year;
    $('tr:not(.hide):not(.search) td.data-due-date input').each(function(i, ele){
        if($(ele).val()<curDate){
            $(ele).closest('tr').addClass('overdue');
        }else{
            $(ele).closest('tr').removeClass('overdue');
        }
    })
    if(selector){
        return $(selector).toString();
    }
    return $.html();
}

async function updateTemplateForStaffList($, jsonObj){
    for(var i =0 ;i<jsonObj.results.length;i++){
        var name = jsonObj.results[i].f_name+" "+jsonObj.results[i].l_name;
        $('.main-panel [id*=list-template] .data-client-sales .dropdown-menu,.modal-body #client-sales .dropdown-menu').append('<li><a href="#" username="'+jsonObj.results[i].username+'" id="'+jsonObj.results[i].id+'">'+name.replace(/^\s|\s$/g,'')+'</a></li>');
    }
    return $;
}

app.get('/home', async function(req, res){
    try{
        
        if(!req.session.isAutheticated){
            res.writeHead(302, {'Location': 'login'});
            res.end();
            return;
        }

        req.body.dataType = req.body.dataType ? req.body.dataType : 'client';
        req.body.queryType = req.body.queryType ? req.body.queryType : 'get-rows';
        req.body.username = req.body.username ? req.body.username : req.session.username;

        if(/staff/i.test(req.session.role)){
            req.body.queryType += '-'+req.body.dataType;
        }

        var query = await getQuery(req, res, req.body.queryType, req.body.dataType);
        var userObj = await executeQuery(query);
        var html = await convertJsonToHTML(userObj, req.body.dataType);

        const $ = cheerio.load(html);
        $('.userobj #user-fname-name').text(req.session.fname);
        $('.userobj #user-lname-name').text(req.session.lname);
        $('.userobj #user-email').text(req.session.email);
        $('.userobj #user-name').text(req.session.username);

        res.send($.html());
    }catch(err){
        console.log(err);
        res.sendFile(path.join(__dirname, 'public/internal-error.html'));
    }
})

app.post('/get-data', async function(req, res){
    try{

        req.body.dataType = req.body.dataType ? req.body.dataType : 'client';
        req.body.queryType = req.body.queryType ? req.body.queryType : 'get-rows';

        req.body.username = req.body.username ? req.body.username : req.session.username;

        if(/staff/i.test(req.session.role)){
            req.body.queryType += '-'+req.body.dataType;
        }

        var query = await getQuery(req, res, req.body.queryType, req.body.dataType);
        var userObj = await executeQuery(query);
        
        var html = await convertJsonToHTML(userObj, req.body.dataType);
        
        res.json({'code':200, 'status': 'success', 'html':html});
    }catch(err){
        console.log(err);
        res.sendFile(path.join(__dirname, 'public/internal-error.html'));
    }
})

app.post('/update-db', async function(req, res){
    try{
        req.body.curRowId = (req.body.curRowId) ? req.body.curRowId : uuidv4();
        var id = req.body.curRowId;
        var query = await getQuery(req, res, req.body.queryType, req.body.dataType, id);

        if(/{{\w+}}/.test(query)){
            res.json({"code": 400, "error": "value not replace properly"}).end();
            return;
        }
        
        var resultObj = await executeQuery(query);
        if(resultObj && resultObj.status == 'success'){

            var html = '';
            if(/^(add\-|update\-)/i.test(req.body.queryType)){
                var query = await getQuery(req, res, 'get-row-by-id', req.body.dataType, id);
                if(/{{\w+}}/.test(query)){
                    res.json({"code": 400, "error": "value not replace properly"}).end();
                    return;
                }  
                resultObj = await executeQuery(query);
                html = await convertJsonToHTML(resultObj, req.body.dataType, '.main-panel#'+req.body.dataType+' .table tr#'+id);
            }

            res.json({"code": 200, "message": "db updated", 'new_row': html}).end();
            return;
        }
        if(req.body.queryType == 'add-user' && resultObj && resultObj.status == 'failed' && resultObj.error && resultObj.error.code == 'ER_DUP_ENTRY'){
            res.json({"code": 400, "message": "duplicate username"}).end();
            return;
        }
        res.json({"code": 400, "error": "db not updated"}).end();
    }catch(err){
        console.log(err);
        res.json({"code": 400, "error": "/update-db - internal error"}).end();
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
                req.session.fname = user.f_name;
                req.session.lname = user.l_name;
                req.session.username = user.username;
                req.session.email = user.email;
                req.session.password = user.password;
                req.session.role = user.role;
                req.session.userId = user.id;
                req.session.isAutheticated = true;

                res.json({"code": 200, "success": "user authenticated", "user": user}).end();
                return;
            }
        }
        res.json({"code": 400, "error": "user not authenticated"}).end();
    }catch(err){
        console.log(err);
        res.json({"code": 404, "error": "/authenticate - internal error"}).end();
    }
})

async function getQuery(req, res, queryType, dataType, id){
        id = id?id: uuidv4();
        var query = config.db.query[queryType];
        if(req && req.body){
            for(var key in req.body){
                query = query.replace('{{'+key+'}}', req.body[key]);
            }
        }

        if(dataType){
            query = query.replace('{{tableName}}', dataType+"_list");    
        }

        query = query.replace('{{table}}', config.db[config.db.table[queryType]]);
        query = query.replace('{{id}}', id);
        query = query.replace('{{createdTime}}', new Date());

        if(/{{clientId}}/.test(query)){
            var tempQuery = await getQuery(req, res, "get-all-rows", "client", "");
            var tempObj = await executeQuery(tempQuery);
            query = query.replace('{{clientId}}', 'C'+(''+(tempObj["results"].length+1)).padStart(5, "0"));
        }
        return query;
}

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
                if (error || (/^(insert|delete|update)/i.test(queryStr) && results.affectedRows<1)){
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
  console.log(`\n\nExample app listening on http://localhost:${port}\n`);
})