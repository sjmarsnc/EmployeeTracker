DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;  

CREATE TABLE department (
  id INTEGER NOT NULL AUTO_INCREMENT,
  name VARCHAR(45) NULL,
  PRIMARY KEY (id)
);
 
CREATE TABLE role (
    id INTEGER NOT NULL AUTO_INCREMENT, 
    title VARCHAR(40), 
    salary DECIMAL, 
    department_id INT, 
    PRIMARY KEY (id), 
    FOREIGN KEY (department_id)
        REFERENCES department(id)
);

CREATE TABLE employee (
    id INTEGER NOT NULL AUTO_INCREMENT, 
    first_name VARCHAR(40), 
    last_name VARCHAR(40), 
    role_id INT, 
    manager_id INT, 
    PRIMARY KEY (id), 
    FOREIGN KEY (role_id)
        REFERENCES role (id)    
); 

