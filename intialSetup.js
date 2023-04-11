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
                        con.query("CREATE table "+config.db.userList+" (row_id int NOT NULL AUTO_INCREMENT, id varchar(255) NOT NULL UNIQUE, f_name varchar(255) NOT NULL, l_name varchar(255), username varchar(255) NOT NULL UNIQUE, password NOT NULL varchar(255), email varchar(255), role NOT NULL varchar(255), created_time varchar(255));", function(error, results, fields){
                            if(error && error.sqlMessage && !error.sqlMessage.includes('already exists')){
                                console.log(error);
                            }else{
                                console.log('('+config.db.dbName+' -> '+config.db.userList+') Database and Table created');
                                con.query('insert into '+config.db.userList+' values("", "", "admin", "ZAQxsw123", "admin@test.com", "admin");', function(error, results, fields){
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

// 

//CREATE table client_list (row_id int NOT NULL AUTO_INCREMENT, id varchar(255) NOT NULL UNIQUE, client_name varchar(255) NOT NULL, contact_person varchar(255), role varchar(255) NOT NULL, contact_no varchar(255), email varchar(255), website_link varchar(255), address varchar(2000), state varchar(255), sales varchar(255), lead_status varchar(255), due_date varchar(255), created_time varchar(255),   PRIMARY KEY (row_id));


//create table client_list(client_id varchar(255), client_name varchar(255), contact_person varchar(255), role varchar(255), contact_no varchar(255), email_id varchar(255), website_link varchar(255), address varchar(2000), state varchar(255), sales varchar(255), lead_status varchar(255), due_date varchar(255));

// +--------------+--------------+------+-----+---------+-------+
// | Field        | Type         | Null | Key | Default | Extra |
// +--------------+--------------+------+-----+---------+-------+
// | f_name       | varchar(255) | YES  |     | NULL    |       |
// | l_name       | varchar(255) | YES  |     | NULL    |       |
// | username     | varchar(255) | NO   | PRI | NULL    |       |
// | password     | varchar(255) | YES  |     | NULL    |       |
// | email        | varchar(255) | YES  |     | NULL    |       |
// | role         | varchar(255) | YES  |     | NULL    |       |
// | created_time | varchar(255) | YES  |     | NULL    |       |
// | id           | varchar(255) | YES  |     | NULL    |       |
// +--------------+--------------+------+-----+---------+-------+


// +----------------+---------------+------+-----+---------+-------+
// | Field          | Type          | Null | Key | Default | Extra |
// +----------------+---------------+------+-----+---------+-------+
// | client_name    | varchar(255)  | YES  |     | NULL    |       |
// | contact_person | varchar(255)  | YES  |     | NULL    |       |
// | role           | varchar(255)  | YES  |     | NULL    |       |
// | contact_no     | varchar(255)  | YES  |     | NULL    |       |
// | email_id       | varchar(255)  | YES  |     | NULL    |       |
// | website_link   | varchar(255)  | YES  |     | NULL    |       |
// | address        | varchar(2000) | YES  |     | NULL    |       |
// | state          | varchar(255)  | YES  |     | NULL    |       |
// | sales          | varchar(255)  | YES  |     | NULL    |       |
// | lead_status    | varchar(255)  | YES  |     | NULL    |       |
// | due_date       | varchar(255)  | YES  |     | NULL    |       |
// | created_time   | varchar(255)  | YES  |     | NULL    |       |
// | id             | varchar(255)  | YES  |     | NULL    |       |
// +----------------+---------------+------+-----+---------+-------+