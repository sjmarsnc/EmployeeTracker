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