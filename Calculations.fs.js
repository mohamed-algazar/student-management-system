import { min, max, sum, average as average_1, isEmpty } from "./fable_modules/fable-library-js.4.28.0/List.js";
import { comparePrimitives } from "./fable_modules/fable-library-js.4.28.0/Util.js";

export function calculateStudentAverage(student) {
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

export function calculateStudentTotal(student) {
    return sum(student.Grades, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    });
}

export function isStudentPassing(student, passingGrade) {
    return calculateStudentAverage(student) >= passingGrade;
}

export function getStudentHighestGrade(student) {
    const matchValue = student.Grades;
    if (isEmpty(matchValue)) {
        return 0;
    }
    else {
        const grades = matchValue;
        return max(grades, {
            Compare: comparePrimitives,
        });
    }
}

export function getStudentLowestGrade(student) {
    const matchValue = student.Grades;
    if (isEmpty(matchValue)) {
        return 0;
    }
    else {
        const grades = matchValue;
        return min(grades, {
            Compare: comparePrimitives,
        });
    }
}

export function getStudentGradeSummary(student) {
    const average = calculateStudentAverage(student);
    const total = calculateStudentTotal(student);
    const highest = getStudentHighestGrade(student);
    const lowest = getStudentLowestGrade(student);
    return [average, total, highest, lowest];
}

