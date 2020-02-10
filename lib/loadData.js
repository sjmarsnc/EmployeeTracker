var connection = require("../connection");  
var Employee = require("../lib/Employee");

var roles = []; 
var departments = [];  
var employees = [];  // array of employee objects 
var empNames =[]; 


const loadData = {
    
    loadRoles: function  () { 
        return new Promise ( function(resolve, reject) {
            
            connection.query("SELECT title FROM role", function (err, res) {
                if (err) throw err;
                res.forEach(role_row => roles.push([role_row.id,role_row.title])); 
                resolve(roles); 
            }
            );
        }); 
    }, 
    
    loadDepartments: function () { 
        return new Promise ( function (resolve, reject) {

            connection.query("SELECT * FROM department", function (err, res) {
                if (err) throw err;
                console.log ("res from Departments: ",res[0].id);
                res.forEach(dept => departments.push([dept.id, dept.name]));  
                resolve(departments); 
            }
            );
        });
    },
    
    loadEmployees: function () {
        return new Promise ( function(resolve, reject) {
            
            connection.query("SELECT id, first_name, last_name, role_id, manager_id  FROM employee", function (err, res) {
                if (err) throw err;
                // create array to use for choices 
                employees = res.map( emp => new Employee(emp.id, emp.first_name, emp.last_name, emp.role_id, emp.manager_id))
                resolve(employees);
            }
            );
        })
        
    }
    
    
}

module.exports = loadData;  