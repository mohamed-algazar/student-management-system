import { sortBy, filter, map, exists, cons, tryFind } from "./fable_modules/fable-library-js.4.28.0/List.js";
import { now } from "./fable_modules/fable-library-js.4.28.0/Date.js";
import { SystemMessage, StudentSystem } from "./Models.fs.js";
import { comparePrimitives } from "./fable_modules/fable-library-js.4.28.0/Util.js";

export function addStudent(system, newStudent) {
    const existingStudent = tryFind((s) => (s.Id === newStudent.Id), system.Students);
    if (existingStudent == null) {
        const updatedStudents = cons(newStudent, system.Students);
        return [new StudentSystem(updatedStudents, system.CurrentUser, now()), new SystemMessage(0, [`Student ${newStudent.Name} added successfully`])];
    }
    else {
        return [system, new SystemMessage(1, [`Student ID ${newStudent.Id} already exists`])];
    }
}

export function updateStudent(system, studentId, updatedStudent) {
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

export function deleteStudent(system, studentId) {
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

export function getAllStudents(system) {
    return sortBy((s) => s.Id, system.Students, {
        Compare: comparePrimitives,
    });
}

