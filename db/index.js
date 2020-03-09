const connection = require('./connection'); 

class DB {
  constructor(connection) {
    this.connection = connection;
  }

  findAllEmployees(order) {
      return this.connection.query(`SELECT id, fullname, title, salary, department, manager FROM allemp ${order}`);
  }

  //  get all values back so you have the extra ids
  findAllEmployeesAll(order) {
    return this.connection.query(`SELECT * FROM allemp ${order}`);
  }

  findAllDepartments() {
      return this.connection.query("SELECT * FROM department"); 
  }

  findAllRoles() {
      return this.connection.query("SELECT * FROM role")
  }

  getDepartmentTotals() {
      return this.connection.query("SELECT SUM(R.salary) AS total_salary, D.name AS department FROM employee AS E INNER JOIN role AS R ON E.role_id = R.id INNER JOIN department AS D ON R.department_id = D.id INNER JOIN employee AS M on E.manager_id = M.id GROUP BY D.name;");  
  }

  createEmployee( employee ) {
      return this.connection.query("INSERT INTO employee SET ?", employee);
  } 

  createDepartment( department ) {
      return this.connection.query("INSERT INTO department SET ?", department); 
  }

  createRole (role) {
      return this.connection.query("INSERT INTO role SET ?", role); 
  }

  changeEmployeeRole( empId, roleId ) {
      return this.connection.query(`UPDATE employee SET role_id = ${roleId} WHERE id = ${empId}`);
  }

  changeEmployeeManager (empId, mgrId) {
      return this.connection.query(`UPDATE employee SET manager_id = ${mgrId} WHERE id = ${empId}`)
  }
 
  changeRole (roleId, newSalary ) {
      return this.connection.query(`UPDATE ROLE SET salary = ${newSalary} WHERE id = ${roleId}`)
  }

  dropEmployee ( empId ) {
      return this.connection.query(`DELETE FROM employee WHERE id = ${empId}`); 
  }

  dropDepartment ( deptId) {
      return this.connection.query(`DELETE FROM department WHERE id = ${deptId}`);
  }

  dropRole ( roleId) {
    return this.connection.query(`DELETE FROM role WHERE id = ${roleId}`)
  }
  
}

module.exports = new DB(connection);  