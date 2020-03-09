
// so you can just use "prompt" 
const { prompt } = require('inquirer');  

// or 
// const inquirer = require('inquirer'); 
// const { prompt } = inquirer;

const mysql = require('mysql'); 
const cTable = require('console.table');
// finds db/index.js because index.js is the default name 
const db = require('./db');   


const VIEW_EMPLOYEES = "VIEW_EMPLOYEES"; 
const VIEW_DEPARTMENTS = "VIEW_DEPARTMENTS"; 
const VIEW_ROLES = "VIEW_ROLES"; 

const ADD_EMPLOYEE = "ADD_EMPLOYEE"; 
const ADD_DEPARTMENT = "ADD_DEPARTMENT"; 
const ADD_ROLE = "ADD_ROLE"; 

const UPDATE_EMPLOYEE_ROLE = "UPDATE_EMPLOYEE_ROLE"; 

const REMOVE_EMPLOYEE = "REMOVE_EMPLOYEE"; 
const REMOVE_DEPARTMENT = "REMOVE_DEPARTMENT"; 
const REMOVE_ROLE = "REMOVE_ROLE"; 

const QUIT = "QUIT";  

// bonus functions
const VIEW_EMPLOYEES_BY_DEPARTMENT = "VIEW__EMPLOYEES_BY_DEPARTMENT"; 
const VIEW_EMPLOYEES_BY_MANAGER = "VIEW_EMPLOYEES_BY_MANAGER"; 
const VIEW_DEPARTMENT_SALARY = "VIEW_DEPARTMENT_SALARY"; 
const UPDATE_EMPLOYEE_MANAGER = "UPDATE_EMPLOYEE_MANAGER"; 
const UPDATE_ROLE = "UPDATE_ROLE";  


// arrays for choices in prompts
// give global scope so don't have to keep reading that data, build once 
//   and only build again after changes 

var roleChoices = []; 
var departmentChoices = []; 
var employeeChoices = []; 
var managerChoices = [];

const loadMainPrompts = async () => {
    const { choice } = await prompt([
        {
            type: 'list',
            name: 'choice', 
            message: "What would you like to do?",
            choices: [
                {
                    name: "View all employees" ,
                    value: VIEW_EMPLOYEES 
                },
                {
                    name: "View all employees by department" ,
                    value: VIEW_EMPLOYEES_BY_DEPARTMENT 
                },
                {
                    name: "View all employees by manager" ,
                    value: VIEW_EMPLOYEES_BY_MANAGER 
                },
                {
                    name: "View all departments" ,
                    value: VIEW_DEPARTMENTS
                },
                {
                    name:  "View all roles",
                    value: VIEW_ROLES 
                },
                {
                    name:  "View total salary budget per department",
                    value: VIEW_DEPARTMENT_SALARY
                },
                {
                    name:  "Add an employee",
                    value: ADD_EMPLOYEE
                },
                {
                    name:  "Add a department", 
                    value: ADD_DEPARTMENT
                },
                {
                    name:  "Add a role",
                    value: ADD_ROLE
                },
                {
                  name:  "Remove an employee",
                  value: REMOVE_EMPLOYEE
                },
                {
                  name:  "Remove a department", 
                  value: REMOVE_DEPARTMENT
               },
                {
                  name:  "Remove a role",
                  value: REMOVE_ROLE
                },
                {
                    name:  "Update employee role",
                    value: UPDATE_EMPLOYEE_ROLE
                },
                {
                    name:  "Update employee manager",
                    value: UPDATE_EMPLOYEE_MANAGER
                },
                {
                    name:  "Update role salary",
                    value: UPDATE_ROLE
                },
                {
                    name: "Quit",
                    value: QUIT
                }
            ]
        }
    ]); 

    switch(choice) {
        case VIEW_EMPLOYEES: 
          return viewEmployees(); 
        case VIEW_EMPLOYEES_BY_DEPARTMENT: 
          return viewEmployees("ORDER BY department"); 
        case VIEW_EMPLOYEES_BY_MANAGER: 
          return viewEmployees("ORDER BY manager");     
        case VIEW_DEPARTMENTS: 
          return viewDepartments(); 
        case VIEW_ROLES: 
          return viewRoles(); 
        case VIEW_DEPARTMENT_SALARY: 
          return viewTotalDepartmentSalary();  
        case ADD_EMPLOYEE: 
          return addEmployee();     
        case ADD_DEPARTMENT: 
          return addDepartment();   
        case ADD_ROLE: 
          return addRole();  
        case REMOVE_EMPLOYEE: 
          return removeEmployee();     
        case REMOVE_DEPARTMENT: 
          return removeDepartment();   
        case REMOVE_ROLE: 
          return removeRole();      
        case UPDATE_EMPLOYEE_ROLE: 
          return updateEmployeeRole(); 
        case UPDATE_EMPLOYEE_MANAGER: 
          return updateEmployeeManager();   
        case UPDATE_ROLE: 
          return updateRoleSalary(); 
        case QUIT: 
          db.connection.end(err => console.log(err));
          process.exit();
        default: 
          return () => {};       

    }
}

async function viewEmployees (order) {
    const employees = await db.findAllEmployees(order);  
    console.log('\n');
    console.table(employees);  

    loadMainPrompts(); 
}

async function viewDepartments() { 
  const departments = await db.findAllDepartments(); 
  console.log('\n'); 
  console.table(departments); 

  loadMainPrompts(); 
}

async function viewRoles() {
  const roles = await db.findAllRoles(); 
  console.log('\n'); 
  console.table(roles); 

  loadMainPrompts();
}

async function viewTotalDepartmentSalary() {
  const departmentTotals = await db.getDepartmentTotals(); 
  console.log('\n');
  console.table(departmentTotals);  
  loadMainPrompts();  
}

async function addDepartment() {
   const department = await prompt([
     {
       name: "name",
       message: "Enter department name"
     }
   ]); 

   await db.createDepartment(department);  
   createDepartmentChoices();  
   loadMainPrompts();  
  
}

async function addRole() {
  
  const role = await prompt([
    {
      name: "title",
      message: "What is the title of the new role?"
    },
    {
      name: "salary",
      type: "number",
      message: "What is the salary for this role?"
    },
    {
      type: "list",
      name: "department_id",
      message: "Which department does this role belong to?",
      choices: departmentChoices
    }

  ]); 

  await db.createRole(role); 
  createRoleChoices();   
  loadMainPrompts();  
}

async function addEmployee() {
  
  const employee = await prompt ([
    {
      name: "first_name",
      message: "What is the employee's first name?"
    },
    {
      name: "last_name",
      message: "What is the employee's last name?" 
    }
  ]);

  const { roleId } = await prompt([
    {
      type: 'list',
      name: 'roleId',
      message: "What is the employee's role?",
      choices: roleChoices
    }
  ]);
 
  employee.role_id = roleId; 

  const { managerId } = await prompt ([
    {
      type: 'list',
      name: 'managerId',
      message: "Who is the employee's manager?",
      choices: managerChoices
    }
  ]); 

  employee.manager_id = managerId;  
  await db.createEmployee(employee);
  createEmployeeChoices();  
  loadMainPrompts();  
}

async function updateEmployeeRole() {
   
  const { empId, roleId } = await prompt ([
    {
      type: 'list',
      name: 'empId',
      message: "Which employee do you want to update?",
      choices: employeeChoices
    },
    {
      type: 'list',
      name: 'roleId',
      message: "What is the employee's role?",
      choices: roleChoices
    }
  ]);
  
  await db.changeEmployeeRole ( empId, roleId );  
  loadMainPrompts();  
}

async function updateEmployeeManager() {

  const { empId, mgrId } = await prompt ([
    {
      type: 'list',
      name: 'empId',
      message: "Which employee do you want to update?",
      choices: employeeChoices
    },
    {
      type: 'list',
      name: 'mgrId',
      message: "Who is the employee's manager?",
      choices: managerChoices
    }
  ]);  

 await db.changeEmployeeManager( empId, mgrId); 
 loadMainPrompts();  

}

async function updateRoleSalary() {
  
  const { roleId, salary } = await prompt([
    {
      type: 'list',
      name: 'roleId',
      message: "Which role do you want to update?",
      choices: roleChoices
    }, 
    {
      type: 'number',
      name: 'salary',
      message: "What is the salary for this role?"
    }
  ]);

  await db.changeRole( roleId, salary);  
  loadMainPrompts();  
}

async function removeEmployee() {
  const { empId } = await prompt ([
    {
      type: "list",
      name: "empId",
      message: "Which employee do you want to remove?", 
      choices: employeeChoices
    }
  ]); 

  await db.dropEmployee ( empId ); 
  loadMainPrompts();  
}

async function removeDepartment() {
  const { deptId } = await prompt ([
    {
      type: "list",
      name: "deptId",
      message: "Which department do you want to remove?", 
      choices: departmentChoices
    }
  ]); 

  await db.dropDepartment ( deptId ); 
  loadMainPrompts();  
}

async function removeRole() {
  const { roleId } = await prompt ([
    {
      type: "list",
      name: "role",
      message: "Which role do you want to remove?", 
      choices: roleChoices
    }
  ]); 

  await db.dropRole ( roleId ); 
  loadMainPrompts();  
}

// setup the choice arrays for departments, roles, and employees
// call the appropriate function after any of these change 

async function createRoleChoices() {
  const roles = await db.findAllRoles(); 
  roleChoices = roles.map( ({ id, title}) => ({
    name: title,
    value: id
  }) ); 
  // console.log("Role choice array: \n", roleChoices); 
}

async function createDepartmentChoices() {
   const departments = await db.findAllDepartments(); 
   departmentChoices = departments.map( ({ id, name }) => ({
      name: name,
      value: id
   }) ); 
  //  console.log("Department choice array: \n", departmentChoices); 
}

async function createEmployeeChoices() {
  const employeeList = await db.findAllEmployeesAll();  
  employeeChoices = employeeList.map(({ id, fullname }) => ({
    name: `${fullname}`,
    value: id
   }));
  
  managerChoices = [{ name: 'None', value: null }, ...employeeChoices];

  // console.log("Employee Choice Arrays: \n", employeeChoices, managerChoices); 
}

async function startup() {
  await createDepartmentChoices(); 
  await createRoleChoices(); 
  await createEmployeeChoices(); 
  loadMainPrompts(); 
}

startup();  