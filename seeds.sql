INSERT INTO department (name) 
VALUES ('Sales'), ('Engineering'), ('Finance'), ('Legal'); 

INSERT INTO role (title, salary, department_id) 
VALUES ('Sales Manager', 120000, 1), 
       ('Sales Associate', 80000, 1),
       ('Engineering Manager', 150000, 2),
       ('Engineering Associate', 120000, 2), 
       ('CFO', 150000, 3), 
       ('Financial Analyst', 75000, 3),
       ('CEO', 200000, 3),
       ('Chief Legal Counsel', 160000, 4), 
       ('Attorney', 120000, 4); 

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES('John','Doe', 7, null), 
      ('Sally', 'Smith', 5, 1), 
      ('Steven','Stills', 6, 2), 
      ('Graham','Nash', 6, 2),
      ('Steven','Tyler', 8, 1), 
      ('Phil','Collins', 9, 5),
      ('Dale','Evans', 1, 1), 
      ('Sam','Snead', 2, 7), 
      ('Johnny','Walker', 2, 7), 
      ('Susan','Brown', 3, 1),
      ('Chris','Walker', 4, 10), 
      ('Kyle','Turner', 4, 10);   
        