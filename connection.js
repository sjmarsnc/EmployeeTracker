// create the connection information for the sql database
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "Emrys1960!",
    database: "employee_db"
  });
  


  module.exports = connection;  