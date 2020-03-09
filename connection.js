// create the connection information for the sql database
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: "employee_db",
    multipleStatements: true
  });
  
  // test with this after homework is graded 
  // connection.connect(); 
  // connection.query = util.promisify(connection.query); 

  module.exports = connection;