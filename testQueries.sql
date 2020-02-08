SELECT * FROM employee WHERE manager_id = 
  (SELECT id FROM employee WHERE first_name = "" AND last_name = "");  

If you delete a department - unassign all employees of that department first 
If you delete an employee who is a manager, assign all employees to that employee's manager? 

add employee 
add department 
add role 
update employee role 
update employee manager 

show total salary of a department (sum all salaries)
select Name 'State' , population format=comma10. 
      from sql.unitedstates 
      where population gt
                  (select population from sql.countries
                      where name = "Belgium");

SELECT E.id, E.first_name, E.last_name, 
       R.title AS role, R.salary AS salary, 
       D.name AS department, 
       M.first_name + ' ' + M.last_name as ManagerName   
   FROM employee AS E 
      INNER JOIN role AS R ON E.role_id = R.id  
      INNER JOIN department AS D ON R.department_id = D.id
      LEFT JOIN employee AS M on E.manager_id = M.id;    

add 
WHERE E.manager_ID = 10;     to get employees of a specific manager 


total salary for departments: 

SELECT SUM(R.salary) AS total_salary, 
       D.name AS department
   FROM employee AS E 
      INNER JOIN role AS R ON E.role_id = R.id  
      INNER JOIN department AS D ON R.department_id = D.id
      INNER JOIN employee AS M on E.manager_id = M.id 
      GROUP BY D.name;    