# Employee Manager

## Useage 

This application uses data in a mySQL server to store employee information and allows
the user to perform common Human Resources tasks such as adding and removing an employee, setting up new departments and job roles, changing salaries, etc.  

List of tasks you can do: 
* Display all employees in a table 
* Display all employees sorted by department
* Display all employees sorted by manager 
* Display all departments
* Display all roles 
* Display the sum of all salaries in all departments 
* Add an employee
* Add a department
* Add a role 
* Remove an employee
* Update the role of an employee
* Update the manager of an employee

The data is stored in tables with keys linking them as shown below:  

![](/schema.png)


## Implementation 

The sets of questions for the inquirer prompts are stored in separate arrays to make the calls look "smaller".  I tried to have them all together but the ones that use the arrays of employee names, department names, and role names have to be defined after those arrays have been loaded or they do not display correctly.    
