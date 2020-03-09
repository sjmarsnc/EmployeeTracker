// var mysql = require("mysql");

// if you are lazy and don't want to type inquirer.prompt every time
// const { prompt } = require('inquirer'); 

var inquirer = require("inquirer");
var Employee = require("./lib/Employee");
const cTable = require('console.table');
var loadData = require("./lib/loadData");

var connection = require("./connection");

var roles = [];
var roleNames = [];
var departments = [];
var deptNames = [];
var employees = [];  // array of employee objects 
var empNames = [];

connection.connect(function (err) {
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
let updateEmpMgrQuestions = [];
let updateEmpRoleQuestions = [];
let updateRoleQuestions = [];
let updateRoleSalaryQuestions = [];


const addEmp = async () => {

  let answer = await inquirer.prompt(addEmpQuestions);

  const { first, last, role, manager } = answer;
  connection.query(
    `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
              VALUES( "${first}", "${last}", 
                    (SELECT id FROM role WHERE title = "${role}"), (SELECT id FROM allemp WHERE fullname = "${manager}"));`,
    function (err, res) {
      if (err) throw err;
      let newEmp = new Employee(res.insertId, first, last);
      console.log("The employee was successfully added! ", res);
      employees.push(newEmp);
      empNames.push(newEmp.getFullName());
      console.log(employees);  
      console.log(empNames); 
      doSomething();
    }
  );

  // })

}

const addRole = async () => {
  let answer = await inquirer.prompt(addRoleQuestions);

  console.log("Adding a role to ", answer.department);
  connection.query(
    `INSERT INTO role (title, salary, department_id) 
                VALUES( "${answer.title}", ${answer.salary}, 
                (SELECT id FROM department WHERE name = "${answer.department}"));`,
    function (err) {
      if (err) throw err;
      console.log("The role was successfully added!\n");
      roleNames.push(answer.title);
      doSomething();
    }
  );
}

const addDept = async () => {
  let answer = await inquirer.prompt(addDeptQuestions);
  const { department } = answer;

  connection.query(
    `INSERT INTO department (name) VALUES( "${department}" );`,
    function (err) {
      if (err) throw err;
      console.log("The department was successfully added!\n");
      deptNames.push(department);
      doSomething();
    }
  );
}

function showAllEmps(orderClause) {
  if (orderClause === undefined) orderClause = '';
  connection.query(
    `SELECT * FROM allemp ${orderClause}`,
    (err, res) => {
      if (err) console.log(err);
      let title = "\nAll Employees ";
      if (orderClause !== '') title += orderClause + "\n===========================";
      console.log(title)
      console.table(
        res.map(emp => {
          return {
            "First Name": emp.first_name,
            "Last Name": emp.last_name,
            "Department": emp.department,
            "Title": emp.title,
            "Salary": emp.salary,
            "Manager": emp.manager,
          };
        }));

      doSomething();
    });

}


function showByManager() {
  showAllEmps('ORDER BY manager');
  // doSomething(); 
}

function showByDepartment() {
  showAllEmps('ORDER BY department')
  // doSomething();  
}

function showDepartments() {
  console.log("\nDepartments:\n============\n");
  for (let i = 0; i < deptNames.length; i++)  console.log(deptNames[i]);
  doSomething();
}

function showRoles() {
  console.log("\nRoles\n=====\n");
  for (let i = 0; i < roleNames.length; i++) console.log(roleNames[i]);
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
      console.log("\nTotal Salary Per Department\n===========================\n");
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

const remEmp = async () => {

  let answer = await inquirer.prompt(remEmpQuestions);

  console.log("Removing ", answer.emp);
  connection.query(
    `SELECT id FROM allemp WHERE fullname = "${answer.emp}" INTO @empid; 
            DELETE FROM employee WHERE id = @empid`,
    function (err, res) {
      if (err) throw err;
      if (res.affectedRows === 0) console.log("Employee record not found.");
      else console.log(`Employee ${answer.emp} was successfully removed!`);
      empNames.splice(empNames.findIndex((emp) => emp === answer.emp), 1);
      doSomething();
    }
  );
}

const updateRoleSalary = async () => {
  let answer = await inquirer.prompt(updateRoleSalaryQuestions);
  let { role, newsalary } = answer;

  connection.query(`UPDATE role SET salary = ${newsalary} WHERE title = "${role}"`,
    function (err) {
      if (err) throw err;
      console.log(`Salary for ${role} was succesfully updated!`);
      doSomething();  
    });

}

const remRole = async () => {

  let answer = await inquirer.prompt(remRoleQuestions);

  console.log("Removing ", answer.role);
  connection.query(
    `DELETE FROM role WHERE title = "${answer.role}"`,
    function (err) {
      if (err) throw err;
      console.log(`Role ${answer.emp} was successfully removed!`);
      roleNames.splice(roleNames.findIndex((role) => role === answer.role), 1);
      doSomething();
    }
  );
}

const remDepartment = async () => {

  let answer = await inquirer.prompt(remDeptQuestions);

  console.log("Removing ", answer.dept);
  connection.query(
    `DELETE FROM department WHERE name = "${answer.dept}"`,
    function (err) {
      if (err) throw err;
      console.log(`Department ${answer.dept} was successfully removed!`);
      deptNames.splice(deptNames.findIndex((dept) => dept === answer.dept), 1);
      doSomething();
    }
  );
}

const updateEmpRole = async () => {
  let answer = await inquirer.prompt(updateEmpRoleQuestions);

  const { emp, role } = answer;
  connection.query(
    `SELECT id INTO @roleid FROM role WHERE title = "${role}";
            SELECT id INTO @empid FROM allemp WHERE fullname = "${emp}";
            UPDATE employee SET role_id = @roleid WHERE = @empid`,
    function (err) {
      if (err) throw err;
      console.log("The employee was successfully updated!");
    }
  );
  doSomething();
}

const updateEmpManager = async () => {
  let answer = await inquirer.prompt(updateEmpMgrQuestions);

  const { emp, mgr } = answer;
  connection.query(
    `SELECT id INTO @mgrid FROM allemp WHERE fullname = "${mgr}";
         SELECT id INTO @empid FROM allemp WHERE fullname = "${emp}";
         UPDATE employee SET manager_id = @mgrid WHERE id = @empid`,
    function (err) {
      if (err) throw err;
      console.log("The employee was successfully updated!");
    }
  );
  doSomething();
}



const start = async () => {

  let departments = await loadData.loadDepartments();
  // console.log("\nDepartments loaded: ", departments);  

  deptNames = departments.map(dept => dept[1]);
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

  let roles = await loadData.loadRoles();
  // console.log("\nRoles loaded: ", roles);
  roleNames = roles.map(role => role[1]);
  remRoleQuestions = [
    {
      type: "list",
      name: "role",
      message: "Which role do you want to remove?",
      choices: roleNames
    }
  ];

  updateRoleSalaryQuestions = [
    {
      type: "list",
      name: "role",
      message: "Which role do you want to update?",
      choices: roleNames
    },
    {
      type: "number",
      name: "newsalary",
      message: "What is the new salary for this role?"
    }
  ]

  let employees = await loadData.loadEmployees();
  // console.log("\nEmployees loaded: ", employees);
  empNames = employees.map(emp => emp.getFullName());
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

  updateEmpMgrQuestions = [
    {
      type: "list",
      name: "emp",
      message: "Which employee do you want to update?",
      choices: empNames
    },
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
      name: "emp",
      message: "Which employee do you want to update?",
      choices: empNames
    },
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

  doSomething();

}


// loop through available tasks until user chooses to quit 
const doSomething = async () => {
  let answer = await inquirer.prompt(firstQuestion);

  console.log(answer.task);
  switch (answer.task) {
    case "View all employees":
      showAllEmps(); break;
    case "View all employees by manager":
      showByManager(); break;
    case "View all employees by department":
      showByDepartment(); break;
    case "View all departments":
      showDepartments(); break;
    case "View all roles":
      showRoles(); break;
    case "View total salary budget per department":
      showDeptSalaryTotal(); break;
    case "Add an employee":
      addEmp(); break;
    case "Add a role":
      addRole(); break;
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
    case "Quit": let i = 1;
      connection.end(err => console.log(err));
      process.exit();
    // how to stop the program? 
    default: break;
  }
}


