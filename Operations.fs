namespace StudentManagementWeb

open System

module Operations =
    let addStudent (system: StudentSystem) (newStudent: Student) : StudentSystem * SystemMessage =
        let existingStudent = system.Students |> List.tryFind (fun s -> s.Id = newStudent.Id)
        match existingStudent with
        | Some _ -> 
            system, Error $"Student ID {newStudent.Id} already exists"
        | None ->
            let updatedStudents = newStudent :: system.Students
            { system with Students = updatedStudents; LastUpdate = DateTime.Now }, 
            Success $"Student {newStudent.Name} added successfully"

    let updateStudent (system: StudentSystem) (studentId: int) (updatedStudent: Student) : StudentSystem * SystemMessage =
        let studentExists = system.Students |> List.exists (fun s -> s.Id = studentId)
        if not studentExists then
            system, Error $"Student with ID {studentId} not found"
        else
            let updatedStudents = 
                system.Students 
                |> List.map (fun s -> if s.Id = studentId then updatedStudent else s)
            { system with Students = updatedStudents; LastUpdate = DateTime.Now }, 
            Success $"Student {updatedStudent.Name} updated successfully"

    let deleteStudent (system: StudentSystem) (studentId: int) : StudentSystem * SystemMessage =
        let studentToDelete = system.Students |> List.tryFind (fun s -> s.Id = studentId)
        match studentToDelete with
        | None -> 
            system, Error $"Student with ID {studentId} not found"
        | Some student ->
            let updatedStudents = system.Students |> List.filter (fun s -> s.Id <> studentId)
            { system with Students = updatedStudents; LastUpdate = DateTime.Now }, 
            Success $"Student {student.Name} deleted successfully"

    let getAllStudents (system: StudentSystem) : Student list =
        system.Students |> List.sortBy (fun s -> s.Id)