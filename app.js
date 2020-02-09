// var mysql = require("mysql");
var inquirer = require("inquirer");
var Employee = require("./lib/Employee");
const cTable = require('console.table');
var loadData = require("./lib/loadData");

var connection = require("./connection");

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
              "Remove a department", 
              "Remove a role",
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
let remRoleQuestions = []; 
let remEmpQuestions = [];
let remDeptQuestions = []; 
let updateEmpQuestions = [];
let updateEmpMgrQuestions = [];
let updateEmpRoleQuestions = [];


function addEmp() {

        inquirer.prompt(addEmpQuestions).then(function(answer) {

            connection.query(
                `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                    VALUES( "${answer.first}", "${answer.last}", 
                    (SELECT id FROM role WHERE title = "${answer.role}"), (SELECT id FROM allemp WHERE fullname = "${answer.manager}"));`,
                function (err) {
                  if (err) throw err;
                  console.log("The employee was successfully added!");
                  doSomething(); 
                }
              );
        });
    // })

}

function addRole() { 
    inquirer.prompt(addRoleQuestions).then(function(answer) {
        console.log ("Adding a role to ", answer.department);
        connection.query(
            `INSERT INTO role (title, salary, department_id) 
                VALUES( "${answer.title}", ${answer.salary}, 
                (SELECT id FROM department WHERE name = "${answer.department}"));`,
            function (err) {
              if (err) throw err;
              console.log("The role was successfully added!");
              roleNames.push(answer.title);  
              doSomething(); 
            }
            );
    });
}

function addDept() { 
    inquirer.prompt(addDeptQuestions).then(function (answer) {
        connection.query(
            `INSERT INTO department (name) 
                VALUES( "${answer.department}" );`,
            function (err) {
              if (err) throw err;
              console.log("The department was successfully added!");
              deptNames.push(answer.department); 
              doSomething();  
            }
          );
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

function showDeptSalaryTotal() {
     
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

    inquirer.prompt(remEmpQuestions)
    .then(function (answer) {
        console.log("Removing ",answer.emp); 
        connection.query(
            `SELECT id FROM allemp WHERE fullname = "${answer.emp}" INTO @empid; 
            DELETE FROM employee WHERE id = @empid`,
            function (err) {
              if (err) throw err;
              console.log(`Employee ${answer.emp} was successfully removed!`);
              doSomething();  
            }
          );
    });  
}

function remRole() {

    inquirer.prompt(remRoleQuestions)
    .then(function (answer) {
        console.log("Removing ",answer.role); 
        connection.query(
            `DELETE FROM role WHERE title = "${answer.role}"`,
            function (err) {
              if (err) throw err;
              console.log(`Role ${answer.emp} was successfully removed!`);
              roleNames.splice( roleNames.findIndex(  (role) => role === answer.role) , 1);
              doSomething();  
              }
          );
    });  
}

function remDepartment() {

    inquirer.prompt(remDeptQuestions)
    .then(function (answer) {
        console.log("Removing ",answer.dept); 
        connection.query(
            `DELETE FROM department WHERE name = "${answer.dept}"`,
            function (err) {
              if (err) throw err;
              console.log(`Department ${answer.dept} was successfully removed!`);
              deptNames.splice( deptNames.findIndex(  (dept) => dept === answer.dept) , 1); 
              doSomething();  
            }
          );
    });  
}

function updateEmpRole() {
    inquirer.prompt(updateEmpRoleQuestions)
    .then(function (answer) {
        
        let pickedEmp = employees.find( emp => emp.getFullName() === answer.emp);
        console.log(pickedEmp, answer);  
        let id = pickedEmp.id;    
        connection.query(
            `UPDATE FROM employee WHERE id = ${id}`,
            function (err) {
              if (err) throw err;
              console.log("The employee was successfully updated!");
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
            `UPDATE FROM employee WHERE id = ${id}.....`,
            function (err) {
              if (err) throw err;
              console.log("The employee was successfully updated!");
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

        remDeptQuestions = [
            {
                type: "list", 
                name: "dept",
                message: "Which department do you want to remove?", 
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
            remRoleQuestions = [
                {
                    type: "list", 
                    name: "role",
                    message: "Which role do you want to remove?", 
                    choices: roleNames
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
                        choices: roleNames
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
                        choices: roleNames
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
                showDeptSalaryTotal();  break; 
            case "Add an employee":
               addEmp();  break; 
            case "Add a role":
               addRole();  break;
            case "Add a department": 
               addDept(); break;        
            case "Remove an employee": 
               remEmp(); break;  
            case "Remove a department": 
               remDepartment(); break;  
            case "Remove a role": 
               remRole(); break;  
            case "Update employee role": 
               updateEmpRole(); break;   
            case "Update employee manager": 
                updateEmpManager(); break;  
            case "Update role salary":
                updateRoleSalary(); break; 
            case "View department utilized budget":
                showDepartmentSalaries(); break;   
            case "Quit":  let i = 1;  
                connection.end( err => console.log(err)); 
                process.exit();  
                // how to stop the program? 
            default:  break; 
        }
        // doSomething(); 
        }
    );
}


