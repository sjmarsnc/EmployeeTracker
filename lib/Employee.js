class Employee {
    constructor(id, first_name, last_name, role_id, manager_id, department, role) {
        if (first_name !== null && first_name !== '') this.first_name = first_name;
        if (last_name !== null && last_name !== '') this.last_name = last_name;
        if (id !== null && id !== undefined) this.id = id;
        if (role_id !== null && role_id !== undefined) this.role_id = role_id;
        if (manager_id !== null && manager_id !== undefined) this.manager_id = manager_id;
    }

    getFullName() {
        return `${this.first_name} ${this.last_name}`;
    }

    getManagerName() {
        
    }

    getDepartmentName() {

    }

}

module.exports = Employee;

