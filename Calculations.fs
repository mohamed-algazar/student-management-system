namespace StudentManagementWeb

module Calculations =
    let calculateStudentAverage (student: Student) : float =
        match student.Grades with
        | [] -> 0.0
        | grades -> List.average grades

    let calculateStudentTotal (student: Student) : float =
        student.Grades |> List.sum

    let isStudentPassing (student: Student) (passingGrade: float) : bool =
        calculateStudentAverage student >= passingGrade

    let getStudentHighestGrade (student: Student) : float =
        match student.Grades with
        | [] -> 0.0
        | grades -> List.max grades

    let getStudentLowestGrade (student: Student) : float =
        match student.Grades with
        | [] -> 0.0
        | grades -> List.min grades

    let getStudentGradeSummary (student: Student) : (float * float * float * float) =
        let average = calculateStudentAverage student
        let total = calculateStudentTotal student
        let highest = getStudentHighestGrade student
        let lowest = getStudentLowestGrade student
        (average, total, highest, lowest)