import { FSharpRef, Record, Union } from "./fable_modules/fable-library-js.4.28.0/Types.js";
import { bool_type, option_type, class_type, record_type, list_type, float64_type, string_type, int32_type, union_type } from "./fable_modules/fable-library-js.4.28.0/Reflection.js";
import { sortByDescending, indexed, singleton, empty, ofArray, length, minBy, maxBy, filter, map, exists, cons, tryFind, min, max, sum, average as average_1, isEmpty } from "./fable_modules/fable-library-js.4.28.0/List.js";
import { round, int32ToString, createObj, comparePrimitives } from "./fable_modules/fable-library-js.4.28.0/Util.js";
import { now } from "./fable_modules/fable-library-js.4.28.0/Date.js";
import { Cmd_none } from "./fable_modules/Fable.Elmish.4.1.0/cmd.fs.js";
import { tryParse } from "./fable_modules/fable-library-js.4.28.0/Int32.js";
import { choose } from "./fable_modules/fable-library-js.4.28.0/Array.js";
import { tryParse as tryParse_1 } from "./fable_modules/fable-library-js.4.28.0/Double.js";
import { printf, join, interpolate, toText, split } from "./fable_modules/fable-library-js.4.28.0/String.js";
import { createElement } from "react";
import { Interop_reactApi } from "./fable_modules/Feliz.2.7.0/./Interop.fs.js";
import { defaultOf } from "./fable_modules/Feliz.2.7.0/../.././fable_modules/fable-library-js.4.28.0/Util.js";
import { map as map_1, collect, empty as empty_1, singleton as singleton_1, append, delay, toList } from "./fable_modules/fable-library-js.4.28.0/Seq.js";
import { ProgramModule_mkProgram, ProgramModule_withConsoleTrace, ProgramModule_run } from "./fable_modules/Fable.Elmish.4.1.0/program.fs.js";
import { Program_withReactSynchronous } from "./fable_modules/Fable.Elmish.React.4.0.0/react.fs.js";

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
    return union_type("App.SystemRole", [], SystemRole, () => [[], []]);
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
    return record_type("App.Student", [], Student, () => [["Id", int32_type], ["Name", string_type], ["Age", int32_type], ["Grades", list_type(float64_type)], ["Class", string_type]]);
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
    return record_type("App.StudentSystem", [], StudentSystem, () => [["Students", list_type(Student_$reflection())], ["CurrentUser", SystemRole_$reflection()], ["LastUpdate", class_type("System.DateTime")]]);
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
    return union_type("App.SystemMessage", [], SystemMessage, () => [[["Item", string_type]], [["Item", string_type]], [["Item", string_type]]]);
}

export function Auth_canPerformOperation(system, operation) {
    if (system.CurrentUser.tag === 1) {
        switch (operation) {
            case "view":
            case "calculate":
            case "statistics":
                return true;
            default:
                return false;
        }
    }
    else {
        return true;
    }
}

export function Calculations_calculateStudentAverage(student) {
    const matchValue = student.Grades;
    if (isEmpty(matchValue)) {
        return 0;
    }
    else {
        const grades = matchValue;
        return average_1(grades, {
            GetZero: () => 0,
            Add: (x_1, y) => (x_1 + y),
            DivideByInt: (x, i) => (x / i),
        });
    }
}

export function Calculations_getStudentGradeSummary(student) {
    const average = Calculations_calculateStudentAverage(student);
    const total = sum(student.Grades, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    });
    let highest;
    const matchValue = student.Grades;
    if (isEmpty(matchValue)) {
        highest = 0;
    }
    else {
        const grades = matchValue;
        highest = max(grades, {
            Compare: comparePrimitives,
        });
    }
    let lowest;
    const matchValue_1 = student.Grades;
    if (isEmpty(matchValue_1)) {
        lowest = 0;
    }
    else {
        const grades_1 = matchValue_1;
        lowest = min(grades_1, {
            Compare: comparePrimitives,
        });
    }
    return [average, total, highest, lowest];
}

export function Operations_addStudent(system, newStudent) {
    const existingStudent = tryFind((s) => (s.Id === newStudent.Id), system.Students);
    if (existingStudent == null) {
        const updatedStudents = cons(newStudent, system.Students);
        return [new StudentSystem(updatedStudents, system.CurrentUser, now()), new SystemMessage(0, [`Student ${newStudent.Name} added successfully`])];
    }
    else {
        return [system, new SystemMessage(1, [`Student ID ${newStudent.Id} already exists`])];
    }
}

export function Operations_updateStudent(system, studentId, updatedStudent) {
    const studentExists = exists((s) => (s.Id === studentId), system.Students);
    if (!studentExists) {
        return [system, new SystemMessage(1, [`Student with ID ${studentId} not found`])];
    }
    else {
        const updatedStudents = map((s_1) => {
            if (s_1.Id === studentId) {
                return updatedStudent;
            }
            else {
                return s_1;
            }
        }, system.Students);
        return [new StudentSystem(updatedStudents, system.CurrentUser, now()), new SystemMessage(0, [`Student ${updatedStudent.Name} updated successfully`])];
    }
}

export function Operations_deleteStudent(system, studentId) {
    const studentToDelete = tryFind((s) => (s.Id === studentId), system.Students);
    if (studentToDelete != null) {
        const student = studentToDelete;
        const updatedStudents = filter((s_1) => (s_1.Id !== studentId), system.Students);
        return [new StudentSystem(updatedStudents, system.CurrentUser, now()), new SystemMessage(0, [`Student ${student.Name} deleted successfully`])];
    }
    else {
        return [system, new SystemMessage(1, [`Student with ID ${studentId} not found`])];
    }
}

export function Statistics_getClassHighestAverage(system) {
    const matchValue = system.Students;
    if (isEmpty(matchValue)) {
        return undefined;
    }
    else {
        const students = matchValue;
        const studentWithHighest = maxBy((tupledArg) => {
            const avg = tupledArg[1];
            return avg;
        }, map((s) => [s, Calculations_calculateStudentAverage(s)], students), {
            Compare: comparePrimitives,
        });
        return studentWithHighest;
    }
}

export function Statistics_getClassLowestAverage(system) {
    const matchValue = system.Students;
    if (isEmpty(matchValue)) {
        return undefined;
    }
    else {
        const students = matchValue;
        const studentWithLowest = minBy((tupledArg) => {
            const avg = tupledArg[1];
            return avg;
        }, map((s) => [s, Calculations_calculateStudentAverage(s)], students), {
            Compare: comparePrimitives,
        });
        return studentWithLowest;
    }
}

export function Statistics_getClassPassRate(system, passingGrade) {
    const matchValue = system.Students;
    if (isEmpty(matchValue)) {
        return 0;
    }
    else {
        const students = matchValue;
        const passingStudents = length(filter((s) => (Calculations_calculateStudentAverage(s) >= passingGrade), students)) | 0;
        return (passingStudents / length(students)) * 100;
    }
}

export function Statistics_getClassOverallAverage(system) {
    const matchValue = system.Students;
    if (isEmpty(matchValue)) {
        return 0;
    }
    else {
        const students = matchValue;
        return average_1(map(Calculations_calculateStudentAverage, students), {
            GetZero: () => 0,
            Add: (x_1, y) => (x_1 + y),
            DivideByInt: (x, i) => (x / i),
        });
    }
}

export class Model extends Record {
    constructor(System, CurrentMessage, ShowAddDialog, ShowEditDialog, ShowLoginDialog, NewStudent, EditingStudent, SelectedView, PassingGrade) {
        super();
        this.System = System;
        this.CurrentMessage = CurrentMessage;
        this.ShowAddDialog = ShowAddDialog;
        this.ShowEditDialog = ShowEditDialog;
        this.ShowLoginDialog = ShowLoginDialog;
        this.NewStudent = NewStudent;
        this.EditingStudent = EditingStudent;
        this.SelectedView = SelectedView;
        this.PassingGrade = PassingGrade;
    }
}

export function Model_$reflection() {
    return record_type("App.Model", [], Model, () => [["System", StudentSystem_$reflection()], ["CurrentMessage", option_type(SystemMessage_$reflection())], ["ShowAddDialog", bool_type], ["ShowEditDialog", bool_type], ["ShowLoginDialog", bool_type], ["NewStudent", Student_$reflection()], ["EditingStudent", option_type(Student_$reflection())], ["SelectedView", string_type], ["PassingGrade", float64_type]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Login", "Logout", "ShowAddStudentDialog", "HideAddStudentDialog", "ShowEditStudentDialog", "HideEditStudentDialog", "UpdateNewStudentField", "UpdateNewStudentGrades", "AddNewStudent", "UpdateExistingStudent", "DeleteStudent", "ChangeView", "ClearMessage", "SetPassingGrade"];
    }
}

export function Msg_$reflection() {
    return union_type("App.Msg", [], Msg, () => [[["Item1", string_type], ["Item2", string_type]], [], [], [], [["Item", Student_$reflection()]], [], [["Item1", string_type], ["Item2", string_type]], [["Item", string_type]], [], [], [["Item", int32_type]], [["Item", string_type]], [], [["Item", float64_type]]]);
}

export function init() {
    const sampleStudents = ofArray([new Student(1, "Alice Johnson", 20, ofArray([85.5, 92, 88.5]), "CS101"), new Student(2, "Bob Smith", 19, ofArray([78, 82.5, 80]), "CS101"), new Student(3, "Carol White", 21, ofArray([95, 98.5, 96]), "CS102"), new Student(4, "David Brown", 20, ofArray([55, 62, 58.5]), "CS101")]);
    return [new Model(new StudentSystem(sampleStudents, new SystemRole(1, []), now()), undefined, false, false, true, new Student(0, "", 18, empty(), ""), undefined, "students", 60), Cmd_none()];
}

export function update(msg, model) {
    let bind$0040_2, bind$0040_7, bind$0040, bind$0040_1;
    switch (msg.tag) {
        case 1:
            return [new Model((bind$0040_2 = model.System, new StudentSystem(bind$0040_2.Students, new SystemRole(1, []), bind$0040_2.LastUpdate)), new SystemMessage(0, ["Logged out"]), model.ShowAddDialog, model.ShowEditDialog, true, model.NewStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
        case 2:
            return [new Model(model.System, model.CurrentMessage, true, model.ShowEditDialog, model.ShowLoginDialog, new Student(0, "", 18, empty(), ""), model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
        case 3:
            return [new Model(model.System, model.CurrentMessage, false, model.ShowEditDialog, model.ShowLoginDialog, new Student(0, "", 18, empty(), ""), model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
        case 4: {
            const student = msg.fields[0];
            return [new Model(model.System, model.CurrentMessage, model.ShowAddDialog, true, model.ShowLoginDialog, student, student, model.SelectedView, model.PassingGrade), Cmd_none()];
        }
        case 5:
            return [new Model(model.System, model.CurrentMessage, model.ShowAddDialog, false, model.ShowLoginDialog, model.NewStudent, undefined, model.SelectedView, model.PassingGrade), Cmd_none()];
        case 6: {
            const value = msg.fields[1];
            const field = msg.fields[0];
            let updatedStudent;
            switch (field) {
                case "name": {
                    const bind$0040_3 = model.NewStudent;
                    updatedStudent = (new Student(bind$0040_3.Id, value, bind$0040_3.Age, bind$0040_3.Grades, bind$0040_3.Class));
                    break;
                }
                case "age": {
                    let matchValue_2;
                    let outArg = 0;
                    matchValue_2 = [tryParse(value, 511, false, 32, new FSharpRef(() => outArg, (v) => {
                        outArg = (v | 0);
                    })), outArg];
                    if (matchValue_2[0]) {
                        const age = matchValue_2[1] | 0;
                        const bind$0040_4 = model.NewStudent;
                        updatedStudent = (new Student(bind$0040_4.Id, bind$0040_4.Name, age, bind$0040_4.Grades, bind$0040_4.Class));
                    }
                    else {
                        updatedStudent = model.NewStudent;
                    }
                    break;
                }
                case "class": {
                    const bind$0040_5 = model.NewStudent;
                    updatedStudent = (new Student(bind$0040_5.Id, bind$0040_5.Name, bind$0040_5.Age, bind$0040_5.Grades, value));
                    break;
                }
                case "id": {
                    let matchValue_3;
                    let outArg_1 = 0;
                    matchValue_3 = [tryParse(value, 511, false, 32, new FSharpRef(() => outArg_1, (v_1) => {
                        outArg_1 = (v_1 | 0);
                    })), outArg_1];
                    if (matchValue_3[0]) {
                        const id = matchValue_3[1] | 0;
                        const bind$0040_6 = model.NewStudent;
                        updatedStudent = (new Student(id, bind$0040_6.Name, bind$0040_6.Age, bind$0040_6.Grades, bind$0040_6.Class));
                    }
                    else {
                        updatedStudent = model.NewStudent;
                    }
                    break;
                }
                default:
                    updatedStudent = model.NewStudent;
            }
            return [new Model(model.System, model.CurrentMessage, model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, updatedStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
        }
        case 7: {
            const gradesStr = msg.fields[0];
            const grades = ofArray(choose((s) => {
                let matchValue_4;
                let outArg_2 = 0;
                matchValue_4 = [tryParse_1(s.trim(), new FSharpRef(() => outArg_2, (v_2) => {
                    outArg_2 = v_2;
                })), outArg_2];
                if (matchValue_4[0]) {
                    const grade = matchValue_4[1];
                    return grade;
                }
                else {
                    return undefined;
                }
            }, split(gradesStr, [","], undefined, 0), Float64Array));
            return [new Model(model.System, model.CurrentMessage, model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, (bind$0040_7 = model.NewStudent, new Student(bind$0040_7.Id, bind$0040_7.Name, bind$0040_7.Age, grades, bind$0040_7.Class)), model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
        }
        case 8:
            if (Auth_canPerformOperation(model.System, "add")) {
                const patternInput_1 = Operations_addStudent(model.System, model.NewStudent);
                const newSystem_1 = patternInput_1[0];
                const message_1 = patternInput_1[1];
                return [new Model(newSystem_1, message_1, false, model.ShowEditDialog, model.ShowLoginDialog, model.NewStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
            }
            else {
                return [new Model(model.System, new SystemMessage(1, ["Permission denied"]), model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, model.NewStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
            }
        case 9:
            if (Auth_canPerformOperation(model.System, "update")) {
                const matchValue_5 = model.EditingStudent;
                if (matchValue_5 == null) {
                    return [new Model(model.System, new SystemMessage(1, ["No student selected for editing"]), model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, model.NewStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
                }
                else {
                    const originalStudent = matchValue_5;
                    const patternInput_2 = Operations_updateStudent(model.System, originalStudent.Id, model.NewStudent);
                    const newSystem_2 = patternInput_2[0];
                    const message_2 = patternInput_2[1];
                    return [new Model(newSystem_2, message_2, model.ShowAddDialog, false, model.ShowLoginDialog, model.NewStudent, undefined, model.SelectedView, model.PassingGrade), Cmd_none()];
                }
            }
            else {
                return [new Model(model.System, new SystemMessage(1, ["Permission denied"]), model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, model.NewStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
            }
        case 10: {
            const id_1 = msg.fields[0] | 0;
            if (Auth_canPerformOperation(model.System, "delete")) {
                const patternInput_3 = Operations_deleteStudent(model.System, id_1);
                const newSystem_3 = patternInput_3[0];
                const message_3 = patternInput_3[1];
                return [new Model(newSystem_3, message_3, model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, model.NewStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
            }
            else {
                return [new Model(model.System, new SystemMessage(1, ["Permission denied"]), model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, model.NewStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
            }
        }
        case 11: {
            const view_1 = msg.fields[0];
            return [new Model(model.System, model.CurrentMessage, model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, model.NewStudent, model.EditingStudent, view_1, model.PassingGrade), Cmd_none()];
        }
        case 12:
            return [new Model(model.System, undefined, model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, model.NewStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
        case 13: {
            const grade_1 = msg.fields[0];
            return [new Model(model.System, model.CurrentMessage, model.ShowAddDialog, model.ShowEditDialog, model.ShowLoginDialog, model.NewStudent, model.EditingStudent, model.SelectedView, grade_1), Cmd_none()];
        }
        default: {
            const username = msg.fields[0];
            const password = msg.fields[1];
            let patternInput;
            const matchValue = username.toLocaleLowerCase();
            let matchResult;
            switch (matchValue) {
                case "admin": {
                    if (password === "admin123") {
                        matchResult = 0;
                    }
                    else {
                        matchResult = 2;
                    }
                    break;
                }
                case "viewer": {
                    if (password === "viewer123") {
                        matchResult = 1;
                    }
                    else {
                        matchResult = 2;
                    }
                    break;
                }
                default:
                    matchResult = 2;
            }
            switch (matchResult) {
                case 0: {
                    patternInput = [(bind$0040 = model.System, new StudentSystem(bind$0040.Students, new SystemRole(0, []), bind$0040.LastUpdate)), new SystemMessage(0, ["Logged in as Administrator"])];
                    break;
                }
                case 1: {
                    patternInput = [(bind$0040_1 = model.System, new StudentSystem(bind$0040_1.Students, new SystemRole(1, []), bind$0040_1.LastUpdate)), new SystemMessage(0, ["Logged in as Viewer"])];
                    break;
                }
                default:
                    patternInput = [model.System, new SystemMessage(1, ["Invalid credentials"])];
            }
            const newSystem = patternInput[0];
            const message = patternInput[1];
            return [new Model(newSystem, message, model.ShowAddDialog, model.ShowEditDialog, (message.tag !== 0), model.NewStudent, model.EditingStudent, model.SelectedView, model.PassingGrade), Cmd_none()];
        }
    }
}

function navbar(model, dispatch) {
    let elems_4, elems_3, elems_2, elems, elems_1;
    return createElement("nav", createObj(ofArray([["className", "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"], (elems_4 = [createElement("div", createObj(ofArray([["className", "container mx-auto px-6 py-4"], (elems_3 = [createElement("div", createObj(ofArray([["className", "flex justify-between items-center"], (elems_2 = [createElement("div", createObj(ofArray([["className", "flex items-center space-x-3"], (elems = [createElement("span", {
        className: "text-3xl",
        children: "🎓",
    }), createElement("h1", {
        className: "text-2xl font-bold",
        children: "Student Management System",
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "flex items-center space-x-4"], (elems_1 = [createElement("span", {
        className: "bg-white/20 px-4 py-2 rounded-full text-sm font-medium",
        children: (model.System.CurrentUser.tag === 1) ? "👁️ Viewer" : "👤 Admin",
    }), createElement("button", {
        className: "bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors",
        children: "Logout",
        onClick: (_arg) => {
            dispatch(new Msg(1, []));
        },
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_3))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_4))])])));
}

function messageAlert(model, dispatch) {
    let elems_3, elems_2, elems_1, elems;
    const matchValue = model.CurrentMessage;
    if (matchValue != null) {
        const msg = matchValue;
        let patternInput;
        switch (msg.tag) {
            case 1: {
                const txt_1 = msg.fields[0];
                patternInput = ["bg-red-100 border-red-400 text-red-700", "✗", txt_1];
                break;
            }
            case 2: {
                const txt_2 = msg.fields[0];
                patternInput = ["bg-yellow-100 border-yellow-400 text-yellow-700", "⚠", txt_2];
                break;
            }
            default: {
                const txt = msg.fields[0];
                patternInput = ["bg-green-100 border-green-400 text-green-700", "✓", txt];
            }
        }
        const text = patternInput[2];
        const icon = patternInput[1];
        const bgColor = patternInput[0];
        return createElement("div", createObj(ofArray([["className", "container mx-auto px-6 mt-4"], (elems_3 = [createElement("div", createObj(ofArray([["className", `border-l-4 p-4 ${bgColor} rounded-r-lg shadow-md`], (elems_2 = [createElement("div", createObj(ofArray([["className", "flex justify-between items-center"], (elems_1 = [createElement("div", createObj(ofArray([["className", "flex items-center"], (elems = [createElement("span", {
            className: "text-xl mr-3",
            children: icon,
        }), createElement("p", {
            className: "font-medium",
            children: text,
        })], ["children", Interop_reactApi.Children.toArray(Array.from(elems))])]))), createElement("button", {
            className: "text-2xl hover:opacity-70",
            children: "×",
            onClick: (_arg) => {
                dispatch(new Msg(12, []));
            },
        })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_3))])])));
    }
    else {
        return defaultOf();
    }
}

function studentCard(student, dispatch, canDelete, canEdit) {
    let elems_9, elems_2, elems, elems_1, elems_7, elems_3, elems_4, elems_5, elems_6, elems_8, clo;
    const patternInput = Calculations_getStudentGradeSummary(student);
    const total = patternInput[1];
    const lowest = patternInput[3];
    const highest = patternInput[2];
    const avg = patternInput[0];
    return createElement("div", createObj(ofArray([["className", "bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-blue-500"], (elems_9 = [createElement("div", createObj(ofArray([["className", "flex justify-between items-start mb-4"], (elems_2 = [createElement("div", createObj(singleton((elems = [createElement("h3", {
        className: "text-xl font-bold text-gray-800",
        children: student.Name,
    }), createElement("p", {
        className: "text-sm text-gray-500",
        children: `ID: ${student.Id} | Age: ${student.Age} | Class: ${student.Class}`,
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems))])))), createElement("div", createObj(ofArray([["className", "flex gap-2"], (elems_1 = toList(delay(() => append(canEdit ? singleton_1(createElement("button", {
        className: "bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors",
        children: "Edit",
        onClick: (_arg) => {
            dispatch(new Msg(4, [student]));
        },
    })) : empty_1(), delay(() => (canDelete ? singleton_1(createElement("button", {
        className: "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors",
        children: "Delete",
        onClick: (_arg_1) => {
            dispatch(new Msg(10, [student.Id]));
        },
    })) : empty_1()))))), ["children", Interop_reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_2))])]))), createElement("div", createObj(ofArray([["className", "grid grid-cols-2 gap-4"], (elems_7 = [createElement("div", createObj(ofArray([["className", "bg-blue-50 p-3 rounded-lg"], (elems_3 = [createElement("p", {
        className: "text-xs text-gray-600 mb-1",
        children: "Average",
    }), createElement("p", {
        className: "text-2xl font-bold text-blue-600",
        children: toText(interpolate("%.1f%P()", [avg])),
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_3))])]))), createElement("div", createObj(ofArray([["className", "bg-green-50 p-3 rounded-lg"], (elems_4 = [createElement("p", {
        className: "text-xs text-gray-600 mb-1",
        children: "Total",
    }), createElement("p", {
        className: "text-2xl font-bold text-green-600",
        children: toText(interpolate("%.1f%P()", [total])),
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_4))])]))), createElement("div", createObj(ofArray([["className", "bg-purple-50 p-3 rounded-lg"], (elems_5 = [createElement("p", {
        className: "text-xs text-gray-600 mb-1",
        children: "Highest",
    }), createElement("p", {
        className: "text-2xl font-bold text-purple-600",
        children: toText(interpolate("%.1f%P()", [highest])),
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_5))])]))), createElement("div", createObj(ofArray([["className", "bg-orange-50 p-3 rounded-lg"], (elems_6 = [createElement("p", {
        className: "text-xs text-gray-600 mb-1",
        children: "Lowest",
    }), createElement("p", {
        className: "text-2xl font-bold text-orange-600",
        children: toText(interpolate("%.1f%P()", [lowest])),
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_6))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_7))])]))), createElement("div", createObj(ofArray([["className", "mt-4 pt-4 border-t border-gray-200"], (elems_8 = [createElement("p", {
        className: "text-sm text-gray-600",
        children: `Grades: ${join(", ", map((clo = toText(printf("%.1f")), clo), student.Grades))}`,
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_8))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_9))])])));
}

function studentDialog(model, dispatch, isEdit) {
    let elems_3, elems_2, elems, elems_1;
    if (!(isEdit ? model.ShowEditDialog : model.ShowAddDialog)) {
        return defaultOf();
    }
    else {
        const gradesStr = join(", ", map((value) => value.toString(), model.NewStudent.Grades));
        return createElement("div", createObj(ofArray([["className", "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"], (elems_3 = [createElement("div", createObj(ofArray([["className", "bg-white rounded-xl shadow-2xl p-8 w-96 max-w-full"], (elems_2 = [createElement("h2", {
            className: "text-2xl font-bold mb-6 text-gray-800",
            children: isEdit ? "Edit Student" : "Add New Student",
        }), createElement("div", createObj(ofArray([["className", "space-y-4"], (elems = toList(delay(() => {
            let value_11;
            return append(!isEdit ? singleton_1(createElement("input", createObj(ofArray([(value_11 = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none", ["className", value_11]), ["placeholder", "Student ID"], ["type", "number"], ["value", model.NewStudent.Id], ["onChange", (ev) => {
                const value_19 = ev.target.valueAsNumber;
                if (!(value_19 == null) && !Number.isNaN(value_19)) {
                    dispatch(new Msg(6, ["id", int32ToString(round(value_19))]));
                }
            }]])))) : empty_1(), delay(() => {
                let value_21;
                return append(singleton_1(createElement("input", createObj(ofArray([(value_21 = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none", ["className", value_21]), ["placeholder", "Student Name"], ["value", model.NewStudent.Name], ["onChange", (ev_1) => {
                    dispatch(new Msg(6, ["name", ev_1.target.value]));
                }]])))), delay(() => {
                    let value_28;
                    return append(singleton_1(createElement("input", createObj(ofArray([(value_28 = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none", ["className", value_28]), ["placeholder", "Age"], ["type", "number"], ["value", model.NewStudent.Age], ["onChange", (ev_2) => {
                        const value_36 = ev_2.target.valueAsNumber;
                        if (!(value_36 == null) && !Number.isNaN(value_36)) {
                            dispatch(new Msg(6, ["age", int32ToString(round(value_36))]));
                        }
                    }]])))), delay(() => {
                        let value_38;
                        return append(singleton_1(createElement("input", createObj(ofArray([(value_38 = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none", ["className", value_38]), ["placeholder", "Class (e.g., CS101)"], ["value", model.NewStudent.Class], ["onChange", (ev_3) => {
                            dispatch(new Msg(6, ["class", ev_3.target.value]));
                        }]])))), delay(() => {
                            let value_45;
                            return singleton_1(createElement("input", createObj(ofArray([(value_45 = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none", ["className", value_45]), ["placeholder", "Grades (comma-separated, e.g., 85.5, 92.0, 88.5)"], ["value", gradesStr], ["onChange", (ev_4) => {
                                dispatch(new Msg(7, [ev_4.target.value]));
                            }]]))));
                        }));
                    }));
                }));
            }));
        })), ["children", Interop_reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "flex space-x-3 mt-6"], (elems_1 = [createElement("button", {
            className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors",
            children: isEdit ? "Update Student" : "Add Student",
            onClick: (_arg) => {
                dispatch(isEdit ? (new Msg(9, [])) : (new Msg(8, [])));
            },
        }), createElement("button", {
            className: "flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition-colors",
            children: "Cancel",
            onClick: (_arg_1) => {
                dispatch(isEdit ? (new Msg(5, [])) : (new Msg(3, [])));
            },
        })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_3))])])));
    }
}

function statisticsView(model, dispatch) {
    let elems_14, elems_9, elems, elems_5, elems_1, elems_2, elems_3, elems_4, elems_8, elems_13, elems_12;
    const stats = model.System;
    const totalStudents = length(stats.Students) | 0;
    if (totalStudents === 0) {
        return createElement("div", {
            className: "text-center text-gray-500 text-xl py-12",
            children: "No students available for statistics",
        });
    }
    else {
        const classAverage = Statistics_getClassOverallAverage(stats);
        const passRate = Statistics_getClassPassRate(stats, model.PassingGrade);
        const highestOpt = Statistics_getClassHighestAverage(stats);
        const lowestOpt = Statistics_getClassLowestAverage(stats);
        const passingCount = length(filter((s) => (Calculations_calculateStudentAverage(s) >= model.PassingGrade), stats.Students)) | 0;
        const failingCount = (totalStudents - passingCount) | 0;
        return createElement("div", createObj(ofArray([["className", "space-y-6"], (elems_14 = [createElement("div", createObj(ofArray([["className", "bg-white rounded-xl shadow-md p-6"], (elems_9 = [createElement("h2", {
            className: "text-2xl font-bold mb-4",
            children: "Class Statistics",
        }), createElement("div", createObj(ofArray([["className", "mb-4"], (elems = [createElement("label", {
            className: "block text-sm font-medium text-gray-700 mb-2",
            children: "Passing Grade Threshold",
        }), createElement("input", {
            type: "number",
            className: "px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none",
            value: model.PassingGrade,
            onChange: (ev) => {
                const value_24 = ev.target.valueAsNumber;
                if (!(value_24 == null) && !Number.isNaN(value_24)) {
                    dispatch(new Msg(13, [value_24]));
                }
            },
        })], ["children", Interop_reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "grid grid-cols-2 md:grid-cols-4 gap-4"], (elems_5 = [createElement("div", createObj(ofArray([["className", "bg-blue-50 p-4 rounded-lg"], (elems_1 = [createElement("p", {
            className: "text-sm text-gray-600",
            children: "Total Students",
        }), createElement("p", {
            className: "text-3xl font-bold text-blue-600",
            children: int32ToString(totalStudents),
        })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("div", createObj(ofArray([["className", "bg-green-50 p-4 rounded-lg"], (elems_2 = [createElement("p", {
            className: "text-sm text-gray-600",
            children: "Class Average",
        }), createElement("p", {
            className: "text-3xl font-bold text-green-600",
            children: toText(interpolate("%.1f%P()", [classAverage])),
        })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_2))])]))), createElement("div", createObj(ofArray([["className", "bg-purple-50 p-4 rounded-lg"], (elems_3 = [createElement("p", {
            className: "text-sm text-gray-600",
            children: "Pass Rate",
        }), createElement("p", {
            className: "text-3xl font-bold text-purple-600",
            children: toText(interpolate("%.1f%P()%%", [passRate])),
        })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_3))])]))), createElement("div", createObj(ofArray([["className", "bg-orange-50 p-4 rounded-lg"], (elems_4 = [createElement("p", {
            className: "text-sm text-gray-600",
            children: "Pass/Fail",
        }), createElement("p", {
            className: "text-3xl font-bold text-orange-600",
            children: `${passingCount}/${failingCount}`,
        })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_4))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_5))])]))), createElement("div", createObj(ofArray([["className", "mt-6 grid grid-cols-2 gap-4"], (elems_8 = toList(delay(() => {
            let matchValue, student, avg, elems_6;
            return append((matchValue = highestOpt, (matchValue == null) ? singleton_1(defaultOf()) : ((student = matchValue[0], (avg = matchValue[1], singleton_1(createElement("div", createObj(ofArray([["className", "bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg"], (elems_6 = [createElement("p", {
                className: "text-sm text-gray-600",
                children: "Highest Average",
            }), createElement("p", {
                className: "text-xl font-bold text-green-700",
                children: student.Name,
            }), createElement("p", {
                className: "text-2xl font-bold text-green-600",
                children: toText(interpolate("%.1f%P()", [avg])),
            })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_6))])])))))))), delay(() => {
                let elems_7;
                const matchValue_1 = lowestOpt;
                if (matchValue_1 == null) {
                    return singleton_1(defaultOf());
                }
                else {
                    const student_1 = matchValue_1[0];
                    const avg_1 = matchValue_1[1];
                    return singleton_1(createElement("div", createObj(ofArray([["className", "bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg"], (elems_7 = [createElement("p", {
                        className: "text-sm text-gray-600",
                        children: "Lowest Average",
                    }), createElement("p", {
                        className: "text-xl font-bold text-red-700",
                        children: student_1.Name,
                    }), createElement("p", {
                        className: "text-2xl font-bold text-red-600",
                        children: toText(interpolate("%.1f%P()", [avg_1])),
                    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_7))])]))));
                }
            }));
        })), ["children", Interop_reactApi.Children.toArray(Array.from(elems_8))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_9))])]))), createElement("div", createObj(ofArray([["className", "bg-white rounded-xl shadow-md p-6"], (elems_13 = [createElement("h3", {
            className: "text-xl font-bold mb-4",
            children: "Student Rankings",
        }), createElement("div", createObj(ofArray([["className", "space-y-2"], (elems_12 = toList(delay(() => collect((matchValue_2) => {
            let elems_11, elems_10;
            const student_2 = matchValue_2[1];
            const i = matchValue_2[0] | 0;
            const avg_2 = Calculations_calculateStudentAverage(student_2);
            const isPassing = avg_2 >= model.PassingGrade;
            return singleton_1(createElement("div", createObj(ofArray([["className", `flex justify-between items-center p-3 rounded-lg ${isPassing ? "bg-green-50" : "bg-red-50"}`], (elems_11 = [createElement("div", createObj(singleton((elems_10 = [createElement("span", {
                className: "font-bold text-gray-700 mr-3",
                children: `#${i + 1}`,
            }), createElement("span", {
                className: "font-medium text-gray-800",
                children: student_2.Name,
            }), createElement("span", {
                className: "text-sm text-gray-500 ml-2",
                children: `(${student_2.Class})`,
            })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_10))])))), createElement("span", {
                className: `text-xl font-bold ${isPassing ? "text-green-600" : "text-red-600"}`,
                children: toText(interpolate("%.1f%P()", [avg_2])),
            })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_11))])]))));
        }, indexed(sortByDescending(Calculations_calculateStudentAverage, stats.Students, {
            Compare: comparePrimitives,
        }))))), ["children", Interop_reactApi.Children.toArray(Array.from(elems_12))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_13))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_14))])])));
    }
}

function loginView(dispatch) {
    let value, elems_4, elems_3, elems, elems_1, value_21, value_26, value_34;
    let username = "";
    let password = "";
    return createElement("div", createObj(ofArray([(value = "min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex items-center justify-center", ["className", value]), (elems_4 = [createElement("div", createObj(ofArray([["className", "bg-white rounded-2xl shadow-2xl p-10 w-96"], (elems_3 = [createElement("div", createObj(ofArray([["className", "text-center mb-8"], (elems = [createElement("span", {
        className: "text-6xl mb-4 block",
        children: "🎓",
    }), createElement("h1", {
        className: "text-3xl font-bold text-gray-800",
        children: "Welcome",
    }), createElement("p", {
        className: "text-gray-600 mt-2",
        children: "Student Management System",
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "space-y-4"], (elems_1 = [createElement("input", createObj(ofArray([(value_21 = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none", ["className", value_21]), ["placeholder", "Username"], ["onChange", (ev) => {
        const v = ev.target.value;
        username = v;
    }]]))), createElement("input", createObj(ofArray([(value_26 = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none", ["className", value_26]), ["placeholder", "Password"], ["type", "password"], ["onChange", (ev_1) => {
        const v_1 = ev_1.target.value;
        password = v_1;
    }], ["onKeyPress", (e) => {
        if (e.key === "Enter") {
            dispatch(new Msg(0, [username, password]));
        }
    }]]))), createElement("button", createObj(ofArray([(value_34 = "w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all", ["className", value_34]), ["children", "Login"], ["onClick", (_arg) => {
        dispatch(new Msg(0, [username, password]));
    }]])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("div", {
        className: "mt-6 text-sm text-gray-600 text-center space-y-1",
    })], ["children", Interop_reactApi.Children.toArray(Array.from(elems_3))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_4))])])));
}

export function view(model, dispatch) {
    let elems_4, elems_3;
    if (model.ShowLoginDialog) {
        return loginView(dispatch);
    }
    else {
        return createElement("div", createObj(ofArray([["className", "min-h-screen bg-gray-50"], (elems_4 = [navbar(model, dispatch), messageAlert(model, dispatch), studentDialog(model, dispatch, false), studentDialog(model, dispatch, true), createElement("div", createObj(ofArray([["className", "container mx-auto px-6 py-8"], (elems_3 = toList(delay(() => {
            let elems;
            return append(singleton_1(createElement("div", createObj(ofArray([["className", "flex space-x-4 mb-6"], (elems = [createElement("button", {
                className: `px-6 py-2 rounded-lg font-medium transition-colors ${(model.SelectedView === "students") ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`,
                children: "Students",
                onClick: (_arg) => {
                    dispatch(new Msg(11, ["students"]));
                },
            }), createElement("button", {
                className: `px-6 py-2 rounded-lg font-medium transition-colors ${(model.SelectedView === "statistics") ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`,
                children: "Statistics",
                onClick: (_arg_1) => {
                    dispatch(new Msg(11, ["statistics"]));
                },
            })], ["children", Interop_reactApi.Children.toArray(Array.from(elems))])])))), delay(() => {
                let elems_2;
                return (model.SelectedView === "students") ? singleton_1(createElement("div", createObj(singleton((elems_2 = toList(delay(() => {
                    let value_17;
                    return append(Auth_canPerformOperation(model.System, "add") ? singleton_1(createElement("button", createObj(ofArray([(value_17 = "mb-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg text-white px-6 py-3 rounded-lg font-medium transition-all", ["className", value_17]), ["children", "➕ Add New Student"], ["onClick", (_arg_2) => {
                        dispatch(new Msg(2, []));
                    }]])))) : empty_1(), delay(() => {
                        let elems_1;
                        return singleton_1(createElement("div", createObj(ofArray([["className", "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"], (elems_1 = toList(delay(() => map_1((student) => studentCard(student, dispatch, Auth_canPerformOperation(model.System, "delete"), Auth_canPerformOperation(model.System, "update")), model.System.Students))), ["children", Interop_reactApi.Children.toArray(Array.from(elems_1))])]))));
                    }));
                })), ["children", Interop_reactApi.Children.toArray(Array.from(elems_2))]))))) : singleton_1(statisticsView(model, dispatch));
            }));
        })), ["children", Interop_reactApi.Children.toArray(Array.from(elems_3))])])))], ["children", Interop_reactApi.Children.toArray(Array.from(elems_4))])])));
    }
}

ProgramModule_run(ProgramModule_withConsoleTrace(Program_withReactSynchronous("feliz-app", ProgramModule_mkProgram(init, update, view))));