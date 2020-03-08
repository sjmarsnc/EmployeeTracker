// create the connection information for the sql database
const util = require('util'); 
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Emrys1960!",
    database: "emptracker",
    multipleStatements: true
  });
  
  connection.connect(); 

  // Setting up connection.query to use promises instead of callbacks
  // This allows us to use the async/await syntax 
  connection.query = util.promisify(connection.query);  


  module.exports = connection;