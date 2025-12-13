import { average, filter, length, minBy, map, maxBy, isEmpty } from "./fable_modules/fable-library-js.4.28.0/List.js";
import { isStudentPassing, calculateStudentAverage } from "./Calculations.fs.js";
import { comparePrimitives } from "./fable_modules/fable-library-js.4.28.0/Util.js";

export function getClassHighestAverage(system) {
    const matchValue = system.Students;
    if (isEmpty(matchValue)) {
        return undefined;
    }
    else {
        const students = matchValue;
        return maxBy((tupledArg) => {
            const avg = tupledArg[1];
            return avg;
        }, map((s) => [s, calculateStudentAverage(s)], students), {
            Compare: comparePrimitives,
        });
    }
}

export function getClassLowestAverage(system) {
    const matchValue = system.Students;
    if (isEmpty(matchValue)) {
        return undefined;
    }
    else {
        const students = matchValue;
        return minBy((tupledArg) => {
            const avg = tupledArg[1];
            return avg;
        }, map((s) => [s, calculateStudentAverage(s)], students), {
            Compare: comparePrimitives,
        });
    }
}

export function getClassPassRate(system, passingGrade) {
    const matchValue = system.Students;
    if (isEmpty(matchValue)) {
        return 0;
    }
    else {
        const students = matchValue;
        const passingStudents = length(filter((s) => isStudentPassing(s, passingGrade), students)) | 0;
        return (passingStudents / length(students)) * 100;
    }
}

export function getClassOverallAverage(system) {
    const matchValue = system.Students;
    if (isEmpty(matchValue)) {
        return 0;
    }
    else {
        const students = matchValue;
        return average(map(calculateStudentAverage, students), {
            GetZero: () => 0,
            Add: (x_1, y) => (x_1 + y),
            DivideByInt: (x, i) => (x / i),
        });
    }
}

