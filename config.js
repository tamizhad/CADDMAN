const config = {
    db : {
        dbName : 'my_db',
        userInfo : "user_info",
        clientList: "client_list"   
    }
}

//create table client_list(client_id varchar(255), client_name varchar(255), contact_person varchar(255), role varchar(255), contact_no varchar(255), email_id varchar(255), website_link varchar(255), address varchar(2000), state varchar(255), sales varchar(255), lead_status varchar(255), due_date varchar(255));

//insert into client_list values("00002", "COUNTY FABRICATORS", "Laura Zapata, Alexande De La Cruz", "Estimating/Project Manager", "914-741-0219 ex:313 914-741-0219 ext:712", "lzapata@countyfabricators.com", "https://www.countyfabricators.com", "175 Marble Ave, Pleasant ville, NY 10570, United States", "Pleasantvile, Newyork", "Select-sales", "closed", "26-Feb-2023");

module.exports = config;