import { Record, Union } from "./fable_modules/fable-library-js.4.28.0/Types.js";
import { class_type, record_type, list_type, float64_type, string_type, int32_type, union_type } from "./fable_modules/fable-library-js.4.28.0/Reflection.js";

export class SystemRole extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Admin", "Viewer"];
    }
}

export function SystemRole_$reflection() {
    return union_type("StudentManagementWeb.SystemRole", [], SystemRole, () => [[], []]);
}

export class Student extends Record {
    constructor(Id, Name, Age, Grades, Class) {
        super();
        this.Id = (Id | 0);
        this.Name = Name;
        this.Age = (Age | 0);
        this.Grades = Grades;
        this.Class = Class;
    }
}

export function Student_$reflection() {
    return record_type("StudentManagementWeb.Student", [], Student, () => [["Id", int32_type], ["Name", string_type], ["Age", int32_type], ["Grades", list_type(float64_type)], ["Class", string_type]]);
}

export class StudentSystem extends Record {
    constructor(Students, CurrentUser, LastUpdate) {
        super();
        this.Students = Students;
        this.CurrentUser = CurrentUser;
        this.LastUpdate = LastUpdate;
    }
}

export function StudentSystem_$reflection() {
    return record_type("StudentManagementWeb.StudentSystem", [], StudentSystem, () => [["Students", list_type(Student_$reflection())], ["CurrentUser", SystemRole_$reflection()], ["LastUpdate", class_type("System.DateTime")]]);
}

export class SystemMessage extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Success", "Error", "Warning"];
    }
}

export function SystemMessage_$reflection() {
    return union_type("StudentManagementWeb.SystemMessage", [], SystemMessage, () => [[["Item", string_type]], [["Item", string_type]], [["Item", string_type]]]);
}

