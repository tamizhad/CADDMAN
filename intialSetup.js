const mysql = require('mysql');
const config = require("./config.js")

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

con.connect(function(err) {
    if (err){
        res.json({"code": 400, "error": "Unable to connect to database"});
    }else{
        console.log("Connected!");
        con.query("CREATE DATABASE "+config.db.dbName+";", function(error, results, fields){
            if(error && error.sqlMessage && !error.sqlMessage.includes('database exists')){
                console.log(error);
            }else{
                con.query("use "+config.db.dbName+";", function(error, results, fields){
                    if(error && error.sqlMessage && !error.sqlMessage.includes('database exists')){
                        console.log(error);
                    }else{
                        con.query("CREATE table "+config.db.userInfo+" (f_name varchar(255), l_name varchar(255), username varchar(255) NOT NULL UNIQUE, password varchar(255), email varchar(255), role varchar(255));", function(error, results, fields){
                            if(error && error.sqlMessage && !error.sqlMessage.includes('already exists')){
                                console.log(error);
                            }else{
                                console.log('('+config.db.dbName+' -> '+config.db.userInfo+') Database and Table created');
                                con.query('insert into '+config.db.userInfo+' values("", "", "admin", "ZAQxsw123", "admin@test.com", "admin");', function(error, results, fields){
                                    if(error && error.sqlMessage && !error.sqlMessage.includes('already exists')){
                                        console.log(error);
                                    }else{
                                        console.log('\n\nusername - admin');
                                        console.log('password - ZAQxsw123');
                                        console.log('email - admin@test.com');
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});