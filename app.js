var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
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

var roles = []; 
var departments = [];  
var employees = [];  // employee objects 

function loadRoles () { 
   connection.query("SELECT title FROM role", function (err, res) {
    if (err) throw err;
    res.forEach(role_row => roles.push(role_row.title)); 
    }
    );
} 

function loadDepartments () { 
    connection.query("SELECT name FROM department", function (err, res) {
        if (err) throw err;
        res.forEach(dept => departments.push(dept.name)); 
        }
       );
}

function loadEmployees () {
    connection.query("SELECT first_name, last_name, id  FROM employee", function (err, res) {
        if (err) throw err;
        res.forEach(employee => console.log(employee)); 
        }
       );
}

const firstQuestion = [{
    type: "input", 
    name: "task", 
    message: "What do you want to do?", 
    choices: ["View all employees", 
              "View all employees by department", 
              "View all employees by manager", 
              "Add an employee", 
              "Add a department",
              "Add a role",
              "Remove an employee", 
              "Update Employee Role", 
              "Update Employee Manager", 
              "Update Role Salary",
              "Quit"]
}];

const addEmpQuestions = [
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
    type: "input", 
    name: "role",
    message: "Select the employee's role", 
    choices: roles
    }, 
    {
    type: "input",
    name: "manager",
    message: "Select the employee's manager", 
    choices: employees
    }
];  

const addDeptQuestions = [
    { 
    type: "input", 
    name: "department", 
    message: "What is the name of the new department?"
    }
]; 

const addRoleQuestions = [
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
    type: "input",
    name: "department", 
    message: "What department does this role belong to?",
    choices: departments
    }
];

const updateEmpQuestions = [
    {
        type: "input",
        name: "emp", 
        message: "Which employee do you want to update?",
        choices: employees
    },
    {
        type: "input", 
        name: "emp", 
        message: "Would you like to update manager or role?", 
        choices: ["manager","role"]
    }
];

const updateEmpManager = [
    {
        type: "input",
        name: "mgr",
        message: "Who do you want to set as manager for this employee?",
        choices: employees
    }
];

const updateEmpRole = [
    {
        type: "input", 
        name: "role",
        message: "Select the role for this employee:", 
        choices: roles
    }
];

function addEmp() {
    inquirer.prompt(addEmpQuestions).then(function(answer) {
        console.log(answer); 
    })
}

function addRole() { 
    inquirer.prompt(addRoleQuestions).then(function(answer) {
        console.log(answer); 
    })
}

function addDepartment() { 
    inquirer.prompt(addDeptQuestions).then(function (answer) {
        console.log(answer); 
    })
}

function start() {

    loadDepartments(); 
    loadRoles(); 
    loadEmployees(); 
    
    console.log("Departments:\n", departments); 
    console.log("Roles:\n", roles); 
    console.log("Employees:\n", employees); 
 
    doSomething(); 
}

function doSomething() {
    inquirer.prompt( firstQuestion).then(function(answer) {
        switch(answer.task) {
            // "View all employees", 
            //   "View all employees by department", 
            //   "View all employees by manager", 
           case "Add an Employee":
               addEmp();  break; 
           case "Add a Role":
               addRole();  break;
           case "Add a Department": 
               addDepartment(); break;        
            //   "Remove an employee", 
            //   "Update Employee Role", 
            //   "Update Employee Manager", 
            //   "Update Role Salary",
            case "Quit":  
                connection.end(); 
                // how to stop the program? 
                break; 
            default:  
                connection.end(); 
        }
        }
    )
}

start();  
