var mysql = require("mysql");
var inquirer = require("inquirer");
var Employee = require("./lib/Employee");
const cTable = require('console.table');

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

connection.connect (function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

var roles = []; 
var departments = [];  
var employees = [];  // employee objects 
var empNames =[]; 

function loadRoles () { 
   connection.query("SELECT title FROM role", function (err, res) {
       if (err) throw err;
       res.forEach(role_row => roles.push(role_row.title)); 
    //    console.log("Roles:\n", roles); 
    }
   );
} 

function loadDepartments () { 
    connection.query("SELECT name FROM department", function (err, res) {
        if (err) throw err;
        res.forEach(dept => departments.push(dept.name)); 
        // console.log("Departments:\n", departments); 
    }
    );
}

function loadEmployees () {
    connection.query("SELECT id, first_name, last_name, role_id, manager_id  FROM employee", function (err, res) {
        if (err) throw err;
        employees = res.map( emp => new Employee(emp.id, emp.first_name, emp.last_name, emp.role_id, emp.manager_id))
        // console.log("Employees:\n", employees); 
        // create array to use for choices 
        empNames = employees.map( emp => emp.getFullName() );
    }
    );
}

const firstQuestion = [{
    type: "list", 
    name: "task", 
    message: "What do you want to do?", 
    choices: ["View all employees", 
              "View all employees by department", 
              "View all employees by manager", 
              "View all departments",
              "View all roles", 
              "Add an employee", 
              "Add a department",
              "Add a role",
              "Remove an employee", 
              "Update employee role", 
              "Update employee manager", 
              "Update role salary",
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
    type: "list",
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
    type: "list",
    name: "department", 
    message: "What department does this role belong to?",
    choices: departments
}
];

const remEmpQuestions = [
    {
        type: "list",
        name: "emp", 
        message: "Which employee do you want to remove?",
        choices: empNames
    }
];

const updateEmpQuestions = [
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

const updateEmpMgrQuestions = [
    {
        type: "list",
        name: "mgr",
        message: "Who is the manager of this employee?",
        choices: empNames
    }
];

const updateEmpRoleQuestions = [
    {
        type: "list", 
        name: "role",
        message: "Select the role for this employee:", 
        choices: roles
    }
];

const updateRoleSalaryQuestions = [
    {
        type: "list", 
        name: "role",
        message: "Select the role for this employee:", 
        choices: roles
    }
];

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
    console.log("Departments:\n"); 
    for (let i=0; i < departments.length; i++)  console.log(departments[i]);  
    doSomething(); 
}

function showRoles() { 
    console.log("Roles:\n");
    for (let i=0; i < roles.length; i++) console.log(roles[i]);  
    doSomething(); 
}

function remEmp() {
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

function updateRoleSalary() {
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

// function showAll() {
//     console.log("Not yet done"); 
// }



function start() {

    loadDepartments(); 
    loadRoles(); 
    loadEmployees(); 
    
    doSomething();     
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


