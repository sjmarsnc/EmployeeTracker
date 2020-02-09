// var mysql = require("mysql");
var inquirer = require("inquirer");
var Employee = require("./lib/Employee");
const cTable = require('console.table');
var loadData = require("./lib/loadData");

var connection = require("./connection");
// create the connection information for the sql database
// var connection = mysql.createConnection({
//   host: "localhost",

//   // Your port; if not 3306
//   port: 3306,

//   // Your username
//   user: "root",

//   // Your password
//   password: "Emrys1960!",
//   database: "employee_db"
// });


var roles = []; 
var roleNames = []; 
var departments = []; 
var deptNames = [] ;  
var employees = [];  // array of employee objects 
var empNames = []; 

connection.connect (function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

const firstQuestion = [{
    type: "list", 
    name: "task", 
    message: "What do you want to do?", 
    choices: ["View all employees", 
              "View all employees by department", 
              "View all employees by manager", 
              "View all departments",
              "View all roles", 
              "View total salary budget per department",
              "Add an employee", 
              "Add a department",
              "Add a role",
              "Remove an employee", 
              "Update employee role", 
              "Update employee manager", 
              "Update role salary",
              "Quit"]
}];

const addDeptQuestions = [
    { 
        type: "input", 
        name: "department", 
        message: "What is the name of the new department?"
    }
]; 


// questions that will be generated after data is loaded 
let addEmpQuestions = [];
let addRoleQuestions = []; 

let remEmpQuestions = [];
let updateEmpQuestions = [];
 
let updateEmpMgrQuestions = [];
let updateEmpRoleQuestions = [];


function addEmp() {

        inquirer.prompt(addEmpQuestions).then(function(answer) {
            // have to get id for employee's manager, can't do subquery with the same table 
            // this only allows for one "first" name and multiple last names....so someone like Billie Jo Smith wouldn't work.    
            let mgr_names = answer.mgr.split(' ');  
            let mgr_first = mgr_names[0]; 
            let mgr_last  = mgr_names.splice(1).join(" "); 
            connection.query(
                `SELECT id INTO @mgrid FROM employee WHERE first_name = "${mgr_first}" AND last_name = "${mgr_last}"; 
                
                INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                    VALUES( "${first_name}", "${last_name}", 
                    (SELECT id FROM role WHERE title = ${role}), @mgrid);`,
                function (err) {
                  if (err) throw err;
                  console.log("The employee was successfully added!");
                }
              );
              doSomething(); 
        });
    // })

}

function addRole() { 
    inquirer.prompt(addRoleQuestions).then(function(answer) {
        connection.query(
            `INSERT INTO role (title, salary, department_id) 
                VALUES( "${answer.title}", ${answer.salary}, 
                (SELECT id FROM department WHERE name = ${answer.department}));`,
            function (err) {
              if (err) throw err;
              console.log("The role was successfully added!");
            }
            );
            doSomething(); 
    });
}

function addDepartment() { 
    inquirer.prompt(addDeptQuestions).then(function (answer) {
        connection.query(
            `INSERT INTO department (name) 
                VALUES( "${answer.department}" );`,
            function (err) {
              if (err) throw err;
              console.log("The department was successfully added!");
            }
          );
          doSomething();  
    });
}

function showAllEmps(orderClause) {
    if (orderClause === undefined) orderClause = '';  
    connection.query(
    `SELECT E.id, E.first_name, E.last_name, E.role_id, E.manager_id,
       R.title AS role, R.salary AS salary, 
       D.name AS department, 
       CONCAT(M.first_name, ' ', M.last_name) AS manager   
      FROM employee AS E 
        INNER JOIN role AS R ON E.role_id = R.id  
        INNER JOIN department AS D ON R.department_id = D.id
        INNER JOIN employee AS M on E.manager_id = M.id ${orderClause}`, 
      function (err, res) {
          if (err) console.log(err); 
          let title = "\nAll Employees "; 
          if (orderClause !== '') title += orderClause + "\n===========================";   
          console.log(title)
          console.table(
            res.map(emp => {
              return {
                "First Name": emp.first_name,
                "Last Name": emp.last_name,
                "Salary": emp.salary,
                "Manager": emp.manager,
                "Department": emp.department
              };
            }));
    
            doSomething();  
        });
            
        } 
     
    
function showByManager() {
    showAllEmps('ORDER BY manager');  
    doSomething(); 
}

function showByDepartment() {
    showAllEmps('ORDER BY department')
    doSomething();  
}

function showDepartments() { 
    console.log("\nDepartments:\n"); 
    for (let i=0; i < deptNames.length; i++)  console.log(deptNames[i]);  
    doSomething(); 
}

function showRoles() { 
    console.log("\nRoles:\n");
    for (let i=0; i < roleNames.length; i++) console.log(roleNames[i]);  
    doSomething(); 
}

function showDepartmentSalaryTotal() {
     
    connection.query(
    `SELECT SUM(R.salary) AS total_salary, 
       D.name AS department
       FROM employee AS E 
       INNER JOIN role AS R ON E.role_id = R.id  
       INNER JOIN department AS D ON R.department_id = D.id
       INNER JOIN employee AS M on E.manager_id = M.id 
       GROUP BY D.name;    `, 
      function (err, res) {
          if (err) console.log(err);  
          console.log("\n");
          console.table(
            res.map(dept => {
              return {
                "Department": dept.department,
                "Total Salary": dept.total_salary
              };
            }));
    
            doSomething();  
        });
            
        } 
function remEmp() {
    console.log("empNames:\n", empNames);  
    inquirer.prompt(remEmpQuestions)
    .then(function (answer) {

        let pickedEmp = employees.find( emp => emp.getFullName() === answer.emp);
        console.log(pickedEmp, answer);  
        let id = pickedEmp.id;    
        connection.query(
            `DELETE FROM employee WHERE id = ${id}`,
            function (err) {
              if (err) throw err;
              console.log("The employee was successfully removed!");
            }
          );
        doSomething();  
    });  
}

function updateEmpRole() {
    inquirer.prompt(updateEmpRoleQuestions)
    .then(function (answer) {
        
        let pickedEmp = employees.find( emp => emp.getFullName() === answer.emp);
        console.log(pickedEmp, answer);  
        let id = pickedEmp.id;    
        connection.query(
            `DELETE FROM employee WHERE id = ${id}`,
            function (err) {
              if (err) throw err;
              console.log("The employee was successfully removed!");
            }
          );
        doSomething();  
    });  
}

function updateEmpManager() {
    inquirer.prompt(updateEmpMgrQuestions)
    .then(function (answer) {

        let pickedEmp = employees.find( emp => emp.getFullName() === answer.emp);
        console.log(pickedEmp, answer);  
        let id = pickedEmp.id;    
        connection.query(
            `DELETE FROM employee WHERE id = ${id}`,
            function (err) {
              if (err) throw err;
              console.log("The employee was successfully removed!");
            }
          );
        doSomething();  
    });  
}



function start() {

    loadData.loadDepartments().then( function (departments) {

        deptNames = departments.map( dept => dept[1]); 
        addRoleQuestions = [
            { 
                type: "input", 
                name: "title", 
                message: "What is the title of the new role?"
            },
            { 
            type: "number",
            name: "salary", 
            message: "What is the salary for this role?"
        },
        { 
            type: "list",
            name: "department", 
            message: "What department does this role belong to?",
            choices: deptNames
        }
        ];
         
        loadData.loadRoles().then( function (roles) {
            roleNames = roles.map ( role => role[1]);  
            updateEmpRoleQuestions = [
                {
                    type: "list", 
                    name: "role",
                    message: "Select the role for this employee:", 
                    choices: roleNames
                }
            ];
            addRoleQuestions = [
                { 
                    type: "input", 
                    name: "title", 
                    message: "What is the title of the new role?"
                },
                { 
                    type: "number",
                    name: "salary", 
                    message: "What is the salary for this role?"
                },
                { 
                    type: "list",
                    name: "department", 
                    message: "What department does this role belong to?",
                    choices: departments
                }
            ];

            loadData.loadEmployees().then (function (employees) {
                empNames = employees.map ( emp => emp.getFullName());  
                addEmpQuestions = [
                    { 
                    type: "input", 
                    name: "first", 
                    message: "What is the employee's first name?"
                    },
                    { 
                    type: "input",
                    name: "last", 
                    message: "What is the employee's last name?"
                }, 
                {
                    type: "list", 
                    name: "role",
                    message: "Select the employee's role", 
                    choices: roleNames
                }, 
                {
                    type: "list",
                    name: "manager",
                    message: "Select the employee's manager", 
                    choices: empNames
                }
                ];  
                remEmpQuestions = [
                    {
                        type: "list",
                        name: "emp", 
                        message: "Which employee do you want to remove?",
                        choices: empNames
                    }
                ];
                
                updateEmpQuestions = [
                    {
                        type: "list",
                        name: "emp", 
                        message: "Which employee do you want to update?",
                        choices: empNames
                    },
                    {
                        type: "list", 
                        name: "emp", 
                        message: "Would you like to update manager or role?", 
                        choices: ["manager","role"]
                    }
                ];
                
                updateEmpMgrQuestions = [
                    {
                        type: "list",
                        name: "mgr",
                        message: "Who is the manager of this employee?",
                        choices: empNames
                    }
                ];
                
                updateEmpRoleQuestions = [
                    {
                        type: "list", 
                        name: "role",
                        message: "Select the role for this employee:", 
                        choices: roles
                    }
                ];
                
                remEmpQuestions = [
                    {
                        type: "list",
                        name: "emp", 
                        message: "Which employee do you want to remove?",
                        choices: empNames
                    }
                ];
                
                updateEmpQuestions = [
                    {
                        type: "list",
                        name: "emp", 
                        message: "Which employee do you want to update?",
                        choices: empNames
                    },
                    {
                        type: "list", 
                        name: "emp", 
                        message: "Would you like to update manager or role?", 
                        choices: ["manager","role"]
                    }
                ];
                
                updateEmpMgrQuestions = [
                    {
                        type: "list",
                        name: "mgr",
                        message: "Who is the manager of this employee?",
                        choices: empNames
                    }
                ];

                updateEmpMgrQuestions = [
                    {
                        type: "list",
                        name: "mgr",
                        message: "Who is the manager of this employee?",
                        choices: empNames
                    }
                ];
                
                updateEmpRoleQuestions = [
                    {
                        type: "list", 
                        name: "role",
                        message: "Select the role for this employee:", 
                        choices: roles
                    }
                ];

                doSomething();  
                   
            }) ; 
        }); 

    }); 
    
}


// loop through available tasks until user chooses to quit 
function doSomething() {
    inquirer.prompt(firstQuestion).then(function(answer) {
        console.log(answer.task);  
        switch(answer.task) {
            case "View all employees":  
                showAllEmps();  break; 
            case "View all employees by manager":
                showByManager();  break; 
            case "View all employees by department": 
                showByDepartment();  break; 
            case "View all departments":
                showDepartments();  break; 
            case "View all roles": 
                showRoles(); break;  
            case "View total salary budget per department": 
                showDepartmentSalaryTotal();  break; 
            case "Add an employee":
               addEmp();  break; 
            case "Add a role":
               addRole();  break;
            case "Add a department": 
               addDepartment(); break;        
            case "Remove an employee": 
               remEmp(); break;  
            case "Update employee role": 
               updateEmpRole(); break;   
            case "Update employee manager": 
                updateEmpManager(); break;  
            case "Update role salary":
                updateRoleSalary(); break; 
            case "View department utilized budget":
                showDepartmentSalaries(); break;   
            case "Quit":  let i = 1;  
                // connection.end( err => console.log(err)); 
                // process.exit();  
                // how to stop the program? 
            default:  break; 
        }
        // doSomething(); 
        }
    );
}


