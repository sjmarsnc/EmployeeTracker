DROP DATABASE IF EXISTS emptracker;

CREATE DATABASE emptracker;

USE emptracker;  

CREATE TABLE department (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(45) UNIQUE NOT NULL
);
 
CREATE TABLE role (
    id INTEGER AUTO_INCREMENT PRIMARY KEY, 
    title VARCHAR(40) UNIQUE NOT NULL, 
    salary DECIMAL NOT NULL, 
    department_id INT UNSIGNED NOT NULL,
    INDEX dep_ind (department_id),  
    CONSTRAINT fk_department FOREIGN KEY (department_id)
        REFERENCES department(id) ON DELETE CASCADE
  );

-- DELETE CASCADE above - if you delete the department, all roles will be deleted for that department 

CREATE TABLE employee (
    id INTEGER  AUTO_INCREMENT PRIMARY KEY, 
    first_name VARCHAR(40) NOT NULL, 
    last_name VARCHAR(40) NOT NULL, 
    role_id INTEGER, 
    manager_id INTEGER, 
    INDEX role_ind (role_id), 
    INDEX man_ind (manager_id), 
    CONSTRAINT fk_role FOREIGN KEY (role_id)
        REFERENCES role (id) ON DELETE SET NULL, 
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) 
        REFERENCES employee(id) ON DELETE SET NULL    
); 

-- DELETE SET NULL says if you delete the manager, the manager_id on any employees is set to null 
-- Used ON DELETE SET NULL instead of CASCADE because it seems a bit harsh to delete them
--      if the role goes away - improvment would be to prompt for the new role for those 
--      employees 

CREATE VIEW allemp AS SELECT E.id, E.first_name, E.last_name, E.role_id, E.manager_id,
       CONCAT (E.first_name, ' ', E.last_name) as fullname, 
       R.title AS title, R.salary AS salary, 
       D.name AS department, 
       CONCAT(M.first_name, ' ', M.last_name) AS manager   
      FROM employee AS E 
        LEFT JOIN role AS R ON E.role_id = R.id  
        LEFT JOIN department AS D ON R.department_id = D.id
        LEFT JOIN employee AS M on E.manager_id = M.id 