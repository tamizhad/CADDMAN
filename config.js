const config = {
    db : {
        dbName : 'my_db',
        userList : "user_list",
        clientList: "client_list",
        query: {
            'add-client': 'INSERT INTO {{table}} VALUES(NULL, "{{id}}", "{{clientName}}", "{{clientContactPerson}}", "{{role}}", "{{clientContactNo}}", "{{email}}", "{{clientWebsite}}", "{{clientAddress}}", "{{clientState}}", "{{clientSales}}", "{{clientLeadStatus}}", "{{dueDate}}", "{{createdTime}}", "{{clientId}}", "active");',
            'update-client': 'UPDATE {{table}} SET client_name = "{{clientName}}", contact_person = "{{clientContactPerson}}", role = "{{role}}", contact_no = "{{clientContactNo}}", email = "{{email}}", website_link = "{{clientWebsite}}", address = "{{clientAddress}}", state = "{{clientState}}", sales = "{{clientSales}}", lead_status = "{{clientLeadStatus}}", due_date = "{{dueDate}}", client_id="{{clientId}}", status="{{status}}" WHERE id="{{curRowId}}";',

            'add-user': 'INSERT INTO {{table}} VALUES(NULL, "{{id}}", "{{firstName}}", "{{lastName}}", "{{username}}", "{{password}}", "{{email}}", "{{role}}", "{{createdTime}}", "active");',
            'get-user' : 'SELECT * FROM {{table}} WHERE username = "{{username}}";',
            'update-user': 'UPDATE {{table}} SET f_name = "{{firstName}}", l_name = "{{lastName}}", username = "{{username}}", password = "{{password}}", email = "{{email}}", role = "{{role}}" WHERE id="{{curRowId}}";',

            'get-row-by-id' : 'SELECT * FROM {{tableName}} WHERE id = "{{curRowId}}";',
            'get-all-rows': 'SELECT * FROM {{tableName}};',
            'get-rows': 'SELECT * FROM {{tableName}} WHERE status NOT LIKE "archive";',
            'get-rows-client': 'SELECT * FROM {{tableName}} WHERE sales="{{username}}"',
            'get-rows-user': 'SELECT * FROM {{table}} WHERE username = "{{username}}";',
            'delete-row': 'DELETE FROM {{tableName}} WHERE id="{{curRowId}}";',
            'move-archive': 'UPDATE {{table}} SET status = "archive" WHERE id="{{curRowId}}";'
        },
        table: {
            'add-client': 'clientList',
            'update-client': 'clientList',
            'get-rows-client': 'clientList',
            'move-archive': 'clientList',

            'add-user': 'userList',
            'get-user': 'userList',
            'update-user': 'userList',
            'get-rows-user': 'userList',
        }
    }    
}

//create table client_list(client_id varchar(255), client_name varchar(255), contact_person varchar(255), role varchar(255), contact_no varchar(255), email_id varchar(255), website_link varchar(255), address varchar(2000), state varchar(255), sales varchar(255), lead_status varchar(255), due_date varchar(255));

//insert into client_list values("00002", "COUNTY FABRICATORS", "Laura Zapata, Alexande De La Cruz", "Estimating/Project Manager", "914-741-0219 ex:313 914-741-0219 ext:712", "lzapata@countyfabricators.com", "https://www.countyfabricators.com", "175 Marble Ave, Pleasant ville, NY 10570, United States", "Pleasantvile, Newyork", "Select-sales", "closed", "26-Feb-2023");

module.exports = config;