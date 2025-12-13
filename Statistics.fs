namespace StudentManagementWeb

module Statistics =
    let getClassHighestAverage (system: StudentSystem) : (Student * float) option =
        match system.Students with
        | [] -> None
        | students ->
            students 
            |> List.map (fun s -> (s, Calculations.calculateStudentAverage s))
            |> List.maxBy (fun (_, avg) -> avg)
            |> Some

    let getClassLowestAverage (system: StudentSystem) : (Student * float) option =
        match system.Students with
        | [] -> None
        | students ->
            students 
            |> List.map (fun s -> (s, Calculations.calculateStudentAverage s))
            |> List.minBy (fun (_, avg) -> avg)
            |> Some

    let getClassPassRate (system: StudentSystem) (passingGrade: float) : float =
        match system.Students with
        | [] -> 0.0
        | students ->
            let passingStudents = 
                students 
                |> List.filter (fun s -> Calculations.isStudentPassing s passingGrade)
                |> List.length
            float passingStudents / float students.Length * 100.0

    let getClassOverallAverage (system: StudentSystem) : float =
        match system.Students with
        | [] -> 0.0
        | students ->
            students
            |> List.map Calculations.calculateStudentAverage
            |> List.average