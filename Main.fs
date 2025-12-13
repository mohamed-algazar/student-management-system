module App
open Feliz
open Elmish
open Fable.Core.JsInterop

// ==================== TYPES ====================
type SystemRole =
    | Admin
    | Viewer

type GradeEntry = {
    Subject: string
    Grade: float option
}

type Student = {
    Id: int
    Name: string
    Age: int
    GradeEntries: GradeEntry list
    Class: string
}

type StudentSystem = {
    Students: Student list
    CurrentUser: SystemRole
    LastUpdate: System.DateTime
}

type SystemMessage =
    | Success of string
    | Error of string
    | Warning of string

// ==================== AUTH MODULE ====================
module Auth =
    let canPerformOperation (system: StudentSystem) (operation: string) : bool =
        match system.CurrentUser with
        | Admin -> true
        | Viewer ->
            match operation with
            | "view" | "calculate" | "statistics" -> true
            | _ -> false

// ==================== CALCULATIONS MODULE ====================
module Calculations =
    let getGrades (student: Student) : float list =
        student.GradeEntries
        |> List.choose (fun entry -> entry.Grade)

    let calculateStudentAverage (student: Student) : float =
        let grades = getGrades student
        match grades with
        | [] -> 0.0
        | grades -> List.average grades

    let getStudentGradeSummary (student: Student) : (float * float * float * float) =
        let grades = getGrades student
        let average = calculateStudentAverage student
        let total = List.sum grades
        let highest = match grades with | [] -> 0.0 | grades -> List.max grades
        let lowest = match grades with | [] -> 0.0 | grades -> List.min grades
        (average, total, highest, lowest)

// ==================== OPERATIONS MODULE ====================
module Operations =
    let addStudent (system: StudentSystem) (newStudent: Student) : StudentSystem * SystemMessage =
        let existingStudent = system.Students |> List.tryFind (fun s -> s.Id = newStudent.Id)
        match existingStudent with
        | Some _ -> system, Error $"Student ID {newStudent.Id} already exists"
        | None ->
            let updatedStudents = newStudent :: system.Students
            { system with Students = updatedStudents; LastUpdate = System.DateTime.Now },
            Success $"Student {newStudent.Name} added successfully"

    let updateStudent (system: StudentSystem) (studentId: int) (updatedStudent: Student) : StudentSystem * SystemMessage =
        let studentExists = system.Students |> List.exists (fun s -> s.Id = studentId)
        if not studentExists then
            system, Error $"Student with ID {studentId} not found"
        else
            let updatedStudents =
                system.Students
                |> List.map (fun s -> if s.Id = studentId then updatedStudent else s)
            { system with Students = updatedStudents; LastUpdate = System.DateTime.Now },
            Success $"Student {updatedStudent.Name} updated successfully"

    let deleteStudent (system: StudentSystem) (studentId: int) : StudentSystem * SystemMessage =
        let studentToDelete = system.Students |> List.tryFind (fun s -> s.Id = studentId)
        match studentToDelete with
        | None -> system, Error $"Student with ID {studentId} not found"
        | Some student ->
            let updatedStudents = system.Students |> List.filter (fun s -> s.Id <> studentId)
            { system with Students = updatedStudents; LastUpdate = System.DateTime.Now },
            Success $"Student {student.Name} deleted successfully"

// ==================== STATISTICS MODULE ====================
module Statistics =
    let getClassHighestAverage (system: StudentSystem) : (Student * float) option =
        match system.Students with
        | [] -> None
        | students ->
            let studentWithHighest =
                students
                |> List.map (fun s -> (s, Calculations.calculateStudentAverage s))
                |> List.maxBy (fun (_, avg) -> avg)
            Some studentWithHighest

    let getClassLowestAverage (system: StudentSystem) : (Student * float) option =
        match system.Students with
        | [] -> None
        | students ->
            let studentWithLowest =
                students
                |> List.map (fun s -> (s, Calculations.calculateStudentAverage s))
                |> List.minBy (fun (_, avg) -> avg)
            Some studentWithLowest

    let getClassPassRate (system: StudentSystem) (passingGrade: float) : float =
        match system.Students with
        | [] -> 0.0
        | students ->
            let passingStudents =
                students
                |> List.filter (fun s -> Calculations.calculateStudentAverage s >= passingGrade)
                |> List.length
            float passingStudents / float students.Length * 100.0

    let getClassOverallAverage (system: StudentSystem) : float =
        match system.Students with
        | [] -> 0.0
        | students ->
            students
            |> List.map Calculations.calculateStudentAverage
            |> List.average

// ==================== ELMISH MODEL ====================
type Model = {
    System: StudentSystem
    CurrentMessage: SystemMessage option
    ShowAddDialog: bool
    ShowEditDialog: bool
    ShowLoginDialog: bool
    NewStudent: Student
    EditingStudent: Student option
    SelectedView: string
    PassingGrade: float
}

type Msg =
    | Login of string * string
    | Logout
    | ShowAddStudentDialog
    | HideAddStudentDialog
    | ShowEditStudentDialog of Student
    | HideEditStudentDialog
    | UpdateNewStudentField of string * string
    | UpdateGradeSubject of int * string  // index, subject
    | UpdateGradeValue of int * string    // index, grade value
    | AddNewGradeField
    | RemoveGradeField of int
    | AddNewStudent
    | UpdateExistingStudent
    | DeleteStudent of int
    | ChangeView of string
    | ClearMessage
    | SetPassingGrade of float

// ==================== INIT ====================
let init () =
    let sampleStudents = [
        {
            Id = 1
            Name = "Alice Johnson"
            Age = 20
            GradeEntries = [
                { Subject = "Math"; Grade = Some 85.5 }
                { Subject = "Science"; Grade = Some 92.0 }
                { Subject = "History"; Grade = Some 88.5 }
            ]
            Class = "CS101"
        }
        {
            Id = 2
            Name = "Bob Smith"
            Age = 19
            GradeEntries = [
                { Subject = "Math"; Grade = Some 78.0 }
                { Subject = "Science"; Grade = Some 82.5 }
                { Subject = "History"; Grade = Some 80.0 }
            ]
            Class = "CS101"
        }
        {
            Id = 3
            Name = "Carol White"
            Age = 21
            GradeEntries = [
                { Subject = "Math"; Grade = Some 95.0 }
                { Subject = "Science"; Grade = Some 98.5 }
                { Subject = "History"; Grade = Some 96.0 }
            ]
            Class = "CS102"
        }
        {
            Id = 4
            Name = "David Brown"
            Age = 20
            GradeEntries = [
                { Subject = "Math"; Grade = Some 55.0 }
                { Subject = "Science"; Grade = Some 62.0 }
                { Subject = "History"; Grade = Some 58.5 }
            ]
            Class = "CS101"
        }
    ]

    {
        System = { Students = sampleStudents; CurrentUser = Viewer; LastUpdate = System.DateTime.Now }
        CurrentMessage = None
        ShowAddDialog = false
        ShowEditDialog = false
        ShowLoginDialog = true
        NewStudent = {
            Id = 0
            Name = ""
            Age = 18
            GradeEntries = [{ Subject = ""; Grade = None }]
            Class = ""
        }
        EditingStudent = None
        SelectedView = "students"
        PassingGrade = 60.0
    }, Cmd.none

// ==================== UPDATE ====================
let update (msg: Msg) (model: Model) =
    match msg with
    | Login (username, password) ->
        let newSystem, message =
            match username.ToLower(), password with
            | ("admin", "admin123") -> { model.System with CurrentUser = Admin }, Success "Logged in as Administrator"
            | ("viewer", "viewer123") -> { model.System with CurrentUser = Viewer }, Success "Logged in as Viewer"
            | _ -> model.System, Error "Invalid credentials"
        { model with System = newSystem; CurrentMessage = Some message; ShowLoginDialog = false }, Cmd.none

    | Logout ->
        { model with System = { model.System with CurrentUser = Viewer }; CurrentMessage = Some (Success "Logged out"); ShowLoginDialog = true }, Cmd.none

    | ShowAddStudentDialog ->
        { model with
            ShowAddDialog = true
            NewStudent = {
                Id = 0
                Name = ""
                Age = 18
                GradeEntries = [{ Subject = ""; Grade = None }]
                Class = ""
            }
        }, Cmd.none

    | HideAddStudentDialog ->
        { model with
            ShowAddDialog = false
            NewStudent = {
                Id = 0
                Name = ""
                Age = 18
                GradeEntries = [{ Subject = ""; Grade = None }]
                Class = ""
            }
        }, Cmd.none

    | ShowEditStudentDialog student ->
        { model with
            ShowEditDialog = true
            EditingStudent = Some student
            NewStudent = student
        }, Cmd.none

    | HideEditStudentDialog ->
        { model with ShowEditDialog = false; EditingStudent = None }, Cmd.none

    | UpdateNewStudentField (field, value) ->
        let updatedStudent =
            match field with
            | "name" -> { model.NewStudent with Name = value }
            | "age" ->
                match System.Int32.TryParse(value) with
                | (true, age) -> { model.NewStudent with Age = age }
                | _ -> model.NewStudent
            | "class" -> { model.NewStudent with Class = value }
            | "id" ->
                match System.Int32.TryParse(value) with
                | (true, id) -> { model.NewStudent with Id = id }
                | _ -> model.NewStudent
            | _ -> model.NewStudent
        { model with NewStudent = updatedStudent }, Cmd.none

    | UpdateGradeSubject (index, subject) ->
        let updatedEntries =
            model.NewStudent.GradeEntries
            |> List.mapi (fun i entry ->
                if i = index then { entry with Subject = subject }
                else entry)
        { model with NewStudent = { model.NewStudent with GradeEntries = updatedEntries } }, Cmd.none

    | UpdateGradeValue (index, gradeValue) ->
        let gradeOption =
            if System.String.IsNullOrWhiteSpace(gradeValue) then
                None
            else
                match System.Double.TryParse(gradeValue) with
                | (true, grade) -> Some grade
                | _ -> None

        let updatedEntries =
            model.NewStudent.GradeEntries
            |> List.mapi (fun i entry ->
                if i = index then { entry with Grade = gradeOption }
                else entry)
        { model with NewStudent = { model.NewStudent with GradeEntries = updatedEntries } }, Cmd.none

    | AddNewGradeField ->
        let newEntry = { Subject = ""; Grade = None }
        let updatedEntries = model.NewStudent.GradeEntries @ [newEntry]
        { model with NewStudent = { model.NewStudent with GradeEntries = updatedEntries } }, Cmd.none

    | RemoveGradeField index ->
        let updatedEntries =
            model.NewStudent.GradeEntries
            |> List.indexed
            |> List.filter (fun (i, _) -> i <> index)
            |> List.map snd
        { model with NewStudent = { model.NewStudent with GradeEntries = updatedEntries } }, Cmd.none

    | AddNewStudent ->
        if Auth.canPerformOperation model.System "add" then
            let newSystem, message = Operations.addStudent model.System model.NewStudent
            { model with
                System = newSystem
                CurrentMessage = Some message
                ShowAddDialog = false
                NewStudent = {
                    Id = 0
                    Name = ""
                    Age = 18
                    GradeEntries = [{ Subject = ""; Grade = None }]
                    Class = ""
                }
            }, Cmd.none
        else
            { model with CurrentMessage = Some (Error "Permission denied") }, Cmd.none

    | UpdateExistingStudent ->
        if Auth.canPerformOperation model.System "update" then
            match model.EditingStudent with
            | Some originalStudent ->
                let newSystem, message = Operations.updateStudent model.System originalStudent.Id model.NewStudent
                { model with
                    System = newSystem
                    CurrentMessage = Some message
                    ShowEditDialog = false
                    EditingStudent = None
                    NewStudent = {
                        Id = 0
                        Name = ""
                        Age = 18
                        GradeEntries = [{ Subject = ""; Grade = None }]
                        Class = ""
                    }
                }, Cmd.none
            | None ->
                { model with CurrentMessage = Some (Error "No student selected for editing") }, Cmd.none
        else
            { model with CurrentMessage = Some (Error "Permission denied") }, Cmd.none

    | DeleteStudent id ->
        if Auth.canPerformOperation model.System "delete" then
            let newSystem, message = Operations.deleteStudent model.System id
            { model with System = newSystem; CurrentMessage = Some message }, Cmd.none
        else
            { model with CurrentMessage = Some (Error "Permission denied") }, Cmd.none

    | ChangeView view ->
        { model with SelectedView = view }, Cmd.none

    | ClearMessage ->
        { model with CurrentMessage = None }, Cmd.none

    | SetPassingGrade grade ->
        { model with PassingGrade = grade }, Cmd.none

// ==================== VIEW COMPONENTS ====================
let private navbar model dispatch =
    Html.nav [
        prop.className "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
        prop.children [
            Html.div [
                prop.className "container mx-auto px-6 py-4"
                prop.children [
                    Html.div [
                        prop.className "flex justify-between items-center"
                        prop.children [
                            Html.div [
                                prop.className "flex items-center space-x-3"
                                prop.children [
                                    Html.span [
                                        prop.className "text-3xl"
                                        prop.text "🎓"
                                    ]
                                    Html.h1 [
                                        prop.className "text-2xl font-bold"
                                        prop.text "Student Management System"
                                    ]
                                ]
                            ]
                            Html.div [
                                prop.className "flex items-center space-x-4"
                                prop.children [
                                    Html.span [
                                        prop.className "bg-white/20 px-4 py-2 rounded-full text-sm font-medium"
                                        prop.text (match model.System.CurrentUser with | Admin -> "👤 Admin" | Viewer -> "👁️ Viewer")
                                    ]
                                    Html.button [
                                        prop.className "bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                                        prop.text "Logout"
                                        prop.onClick (fun _ -> dispatch Logout)
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]

let private messageAlert model dispatch =
    match model.CurrentMessage with
    | None -> Html.none
    | Some msg ->
        let (bgColor, icon, text) =
            match msg with
            | Success txt -> ("bg-green-100 border-green-400 text-green-700", "✓", txt)
            | Error txt -> ("bg-red-100 border-red-400 text-red-700", "✗", txt)
            | Warning txt -> ("bg-yellow-100 border-yellow-400 text-yellow-700", "⚠", txt)

        Html.div [
            prop.className $"container mx-auto px-6 mt-4"
            prop.children [
                Html.div [
                    prop.className $"border-l-4 p-4 {bgColor} rounded-r-lg shadow-md"
                    prop.children [
                        Html.div [
                            prop.className "flex justify-between items-center"
                            prop.children [
                                Html.div [
                                    prop.className "flex items-center"
                                    prop.children [
                                        Html.span [
                                            prop.className "text-xl mr-3"
                                            prop.text icon
                                        ]
                                        Html.p [
                                            prop.className "font-medium"
                                            prop.text text
                                        ]
                                    ]
                                ]
                                Html.button [
                                    prop.className "text-2xl hover:opacity-70"
                                    prop.text "×"
                                    prop.onClick (fun _ -> dispatch ClearMessage)
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]

let private studentCard student dispatch canDelete canEdit =
    let (avg, total, highest, lowest) = Calculations.getStudentGradeSummary student
    let grades = Calculations.getGrades student

    Html.div [
        prop.className "bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-blue-500"
        prop.children [
            Html.div [
                prop.className "flex justify-between items-start mb-4"
                prop.children [
                    Html.div [
                        prop.children [
                            Html.h3 [
                                prop.className "text-xl font-bold text-gray-800"
                                prop.text student.Name
                            ]
                            Html.p [
                                prop.className "text-sm text-gray-500"
                                prop.text $"ID: {student.Id} | Age: {student.Age} | Class: {student.Class}"
                            ]
                        ]
                    ]
                    Html.div [
                        prop.className "flex gap-2"
                        prop.children [
                            if canEdit then
                                Html.button [
                                    prop.className "bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                    prop.text "Edit"
                                    prop.onClick (fun _ -> dispatch (ShowEditStudentDialog student))
                                ]
                            if canDelete then
                                Html.button [
                                    prop.className "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                    prop.text "Delete"
                                    prop.onClick (fun _ -> dispatch (DeleteStudent student.Id))
                                ]
                        ]
                    ]
                ]
            ]
            Html.div [
                prop.className "grid grid-cols-2 gap-4"
                prop.children [
                    Html.div [
                        prop.className "bg-blue-50 p-3 rounded-lg"
                        prop.children [
                            Html.p [
                                prop.className "text-xs text-gray-600 mb-1"
                                prop.text "Average"
                            ]
                            Html.p [
                                prop.className "text-2xl font-bold text-blue-600"
                                prop.text $"%.1f{avg}"
                            ]
                        ]
                    ]
                    Html.div [
                        prop.className "bg-green-50 p-3 rounded-lg"
                        prop.children [
                            Html.p [
                                prop.className "text-xs text-gray-600 mb-1"
                                prop.text "Total"
                            ]
                            Html.p [
                                prop.className "text-2xl font-bold text-green-600"
                                prop.text $"%.1f{total}"
                            ]
                        ]
                    ]
                    Html.div [
                        prop.className "bg-purple-50 p-3 rounded-lg"
                        prop.children [
                            Html.p [
                                prop.className "text-xs text-gray-600 mb-1"
                                prop.text "Highest"
                            ]
                            Html.p [
                                prop.className "text-2xl font-bold text-purple-600"
                                prop.text $"%.1f{highest}"
                            ]
                        ]
                    ]
                    Html.div [
                        prop.className "bg-orange-50 p-3 rounded-lg"
                        prop.children [
                            Html.p [
                                prop.className "text-xs text-gray-600 mb-1"
                                prop.text "Lowest"
                            ]
                            Html.p [
                                prop.className "text-2xl font-bold text-orange-600"
                                prop.text $"%.1f{lowest}"
                            ]
                        ]
                    ]
                ]
            ]
            Html.div [
                prop.className "mt-4 pt-4 border-t border-gray-200"
                prop.children [
                    Html.p [
                        prop.className "text-sm font-medium text-gray-600 mb-2"
                        prop.text "Subjects and Grades:"
                    ]
                    Html.div [
                        prop.className "space-y-1"
                        prop.children [
                            for entry in student.GradeEntries do
                                match entry.Grade with
                                | Some grade ->
                                    Html.div [
                                        prop.className "flex justify-between text-sm"
                                        prop.children [
                                            Html.span [
                                                prop.className "text-gray-700"
                                                prop.text $"{entry.Subject}:"
                                            ]
                                            Html.span [
                                                prop.className "font-medium text-gray-900"
                                                prop.text $"%.1f{grade}"
                                            ]
                                        ]
                                    ]
                                | None -> Html.none
                        ]
                    ]
                ]
            ]
        ]
    ]

let private gradeEntryField index entry dispatch =
    Html.div [
        prop.className "flex items-center space-x-2"
        prop.children [
            Html.input [
                prop.className "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                prop.placeholder "Subject"
                prop.value entry.Subject
                prop.onChange (fun v -> dispatch (UpdateGradeSubject (index, v)))
            ]
            Html.input [
                prop.className "w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                prop.placeholder "Grade"
                prop.type' "number"
                prop.step "0.1"
                prop.min "0"
                prop.max "100"
                prop.value (match entry.Grade with | Some g -> string g | None -> "")
                prop.onChange (fun v -> dispatch (UpdateGradeValue (index, v)))
            ]
            if index > 0 then
                Html.button [
                    prop.className "px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    prop.text "−"
                    prop.onClick (fun _ -> dispatch (RemoveGradeField index))
                ]
        ]
    ]

let private studentDialog model dispatch isEdit =
    if not (if isEdit then model.ShowEditDialog else model.ShowAddDialog) then Html.none
    else
        Html.div [
            prop.className "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            prop.children [
                Html.div [
                    prop.className "bg-white rounded-xl shadow-2xl p-8 w-96 max-w-full max-h-[90vh] overflow-y-auto"
                    prop.children [
                        Html.h2 [
                            prop.className "text-2xl font-bold mb-6 text-gray-800"
                            prop.text (if isEdit then "Edit Student" else "Add New Student")
                        ]
                        Html.div [
                            prop.className "space-y-4"
                            prop.children [
                                if not isEdit then
                                    Html.input [
                                        prop.className "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        prop.placeholder "Student ID"
                                        prop.type' "number"
                                        prop.value model.NewStudent.Id
                                        prop.onChange (fun (v: int) -> dispatch (UpdateNewStudentField ("id", string v)))
                                    ]
                                Html.input [
                                    prop.className "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    prop.placeholder "Student Name"
                                    prop.value model.NewStudent.Name
                                    prop.onChange (fun (v: string) -> dispatch (UpdateNewStudentField ("name", v)))
                                ]
                                Html.input [
                                    prop.className "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    prop.placeholder "Age"
                                    prop.type' "number"
                                    prop.value model.NewStudent.Age
                                    prop.onChange (fun (v: int) -> dispatch (UpdateNewStudentField ("age", string v)))
                                ]
                                Html.input [
                                    prop.className "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    prop.placeholder "Class (e.g., CS101)"
                                    prop.value model.NewStudent.Class
                                    prop.onChange (fun (v: string) -> dispatch (UpdateNewStudentField ("class", v)))
                                ]

                                Html.div [
                                    prop.className "pt-2"
                                    prop.children [
                                        Html.p [
                                            prop.className "text-sm font-medium text-gray-700 mb-3"
                                            prop.text "Subjects and Grades:"
                                        ]
                                        Html.div [
                                            prop.className "space-y-3"
                                            prop.children [
                                                for i, entry in List.indexed model.NewStudent.GradeEntries do
                                                    gradeEntryField i entry dispatch
                                            ]
                                        ]
                                        Html.button [
                                            prop.className "mt-3 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                                            prop.children [
                                                Html.span [
                                                    prop.className "text-xl mr-2"
                                                    prop.text "+"
                                                ]
                                                Html.span "Add New Subject"
                                            ]
                                            prop.onClick (fun _ -> dispatch AddNewGradeField)
                                        ]
                                    ]
                                ]
                            ]
                        ]
                        Html.div [
                            prop.className "flex space-x-3 mt-6"
                            prop.children [
                                Html.button [
                                    prop.className "flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                                    prop.text (if isEdit then "Update Student" else "Add Student")
                                    prop.onClick (fun _ -> dispatch (if isEdit then UpdateExistingStudent else AddNewStudent))
                                ]
                                Html.button [
                                    prop.className "flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                                    prop.text "Cancel"
                                    prop.onClick (fun _ -> dispatch (if isEdit then HideEditStudentDialog else HideAddStudentDialog))
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]

let private statisticsView model dispatch =
    let stats = model.System
    let totalStudents = List.length stats.Students

    if totalStudents = 0 then
        Html.div [
            prop.className "text-center text-gray-500 text-xl py-12"
            prop.text "No students available for statistics"
        ]
    else
        let classAverage = Statistics.getClassOverallAverage stats
        let passRate = Statistics.getClassPassRate stats model.PassingGrade
        let highestOpt = Statistics.getClassHighestAverage stats
        let lowestOpt = Statistics.getClassLowestAverage stats

        let passingCount =
            stats.Students
            |> List.filter (fun s -> Calculations.calculateStudentAverage s >= model.PassingGrade)
            |> List.length
        let failingCount = totalStudents - passingCount

        Html.div [
            prop.className "space-y-6"
            prop.children [
                // Summary Cards
                Html.div [
                    prop.className "bg-white rounded-xl shadow-md p-6"
                    prop.children [
                        Html.h2 [
                            prop.className "text-2xl font-bold mb-4"
                            prop.text "Class Statistics"
                        ]
                        Html.div [
                            prop.className "mb-4"
                            prop.children [
                                Html.label [
                                    prop.className "block text-sm font-medium text-gray-700 mb-2"
                                    prop.text "Passing Grade Threshold"
                                ]
                                Html.input [
                                    prop.type' "number"
                                    prop.className "px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    prop.value model.PassingGrade
                                    prop.onChange (fun (v: float) -> dispatch (SetPassingGrade v))
                                ]
                            ]
                        ]
                        Html.div [
                            prop.className "grid grid-cols-2 md:grid-cols-4 gap-4"
                            prop.children [
                                Html.div [
                                    prop.className "bg-blue-50 p-4 rounded-lg"
                                    prop.children [
                                        Html.p [
                                            prop.className "text-sm text-gray-600"
                                            prop.text "Total Students"
                                        ]
                                        Html.p [
                                            prop.className "text-3xl font-bold text-blue-600"
                                            prop.text (string totalStudents)
                                        ]
                                    ]
                                ]
                                Html.div [
                                    prop.className "bg-green-50 p-4 rounded-lg"
                                    prop.children [
                                        Html.p [
                                            prop.className "text-sm text-gray-600"
                                            prop.text "Class Average"
                                        ]
                                        Html.p [
                                            prop.className "text-3xl font-bold text-green-600"
                                            prop.text $"%.1f{classAverage}"
                                        ]
                                    ]
                                ]
                                Html.div [
                                    prop.className "bg-purple-50 p-4 rounded-lg"
                                    prop.children [
                                        Html.p [
                                            prop.className "text-sm text-gray-600"
                                            prop.text "Pass Rate"
                                        ]
                                        Html.p [
                                            prop.className "text-3xl font-bold text-purple-600"
                                            prop.text $"%.1f{passRate}%%"
                                        ]
                                    ]
                                ]
                                Html.div [
                                    prop.className "bg-orange-50 p-4 rounded-lg"
                                    prop.children [
                                        Html.p [
                                            prop.className "text-sm text-gray-600"
                                            prop.text "Pass/Fail"
                                        ]
                                        Html.p [
                                            prop.className "text-3xl font-bold text-orange-600"
                                            prop.text $"{passingCount}/{failingCount}"
                                        ]
                                    ]
                                ]
                            ]
                        ]

                        Html.div [
                            prop.className "mt-6 grid grid-cols-2 gap-4"
                            prop.children [
                                match highestOpt with
                                | Some (student, avg) ->
                                    Html.div [
                                        prop.className "bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg"
                                        prop.children [
                                            Html.p [
                                                prop.className "text-sm text-gray-600"
                                                prop.text "Highest Average"
                                            ]
                                            Html.p [
                                                prop.className "text-xl font-bold text-green-700"
                                                prop.text student.Name
                                            ]
                                            Html.p [
                                                prop.className "text-2xl font-bold text-green-600"
                                                prop.text $"%.1f{avg}"
                                            ]
                                        ]
                                    ]
                                | None -> Html.none

                                match lowestOpt with
                                | Some (student, avg) ->
                                    Html.div [
                                        prop.className "bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg"
                                        prop.children [
                                            Html.p [
                                                prop.className "text-sm text-gray-600"
                                                prop.text "Lowest Average"
                                            ]
                                            Html.p [
                                                prop.className "text-xl font-bold text-red-700"
                                                prop.text student.Name
                                            ]
                                            Html.p [
                                                prop.className "text-2xl font-bold text-red-600"
                                                prop.text $"%.1f{avg}"
                                            ]
                                        ]
                                    ]
                                | None -> Html.none
                            ]
                        ]
                    ]
                ]

                // Student Rankings
                Html.div [
                    prop.className "bg-white rounded-xl shadow-md p-6"
                    prop.children [
                        Html.h3 [
                            prop.className "text-xl font-bold mb-4"
                            prop.text "Student Rankings"
                        ]
                        Html.div [
                            prop.className "space-y-2"
                            prop.children [
                                for i, student in stats.Students
                                                 |> List.sortByDescending (fun s -> Calculations.calculateStudentAverage s)
                                                 |> List.indexed do
                                    let avg = Calculations.calculateStudentAverage student
                                    let isPassing = avg >= model.PassingGrade
                                    Html.div [
                                        prop.className $"flex justify-between items-center p-3 rounded-lg {if isPassing then "bg-green-50" else "bg-red-50"}"
                                        prop.children [
                                            Html.div [
                                                prop.children [
                                                    Html.span [
                                                        prop.className "font-bold text-gray-700 mr-3"
                                                        prop.text $"#{i + 1}"
                                                    ]
                                                    Html.span [
                                                        prop.className "font-medium text-gray-800"
                                                        prop.text student.Name
                                                    ]
                                                    Html.span [
                                                        prop.className "text-sm text-gray-500 ml-2"
                                                        prop.text $"({student.Class})"
                                                    ]
                                                ]
                                            ]
                                            Html.span [
                                                prop.className $"text-xl font-bold {if isPassing then "text-green-600" else "text-red-600"}"
                                                prop.text $"%.1f{avg}"
                                            ]
                                        ]
                                    ]
                            ]
                        ]
                    ]
                ]
            ]
        ]

let private loginView dispatch =
    let mutable username = ""
    let mutable password = ""

    Html.div [
        prop.className "min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex items-center justify-center"
        prop.children [
            Html.div [
                prop.className "bg-white rounded-2xl shadow-2xl p-10 w-96"
                prop.children [
                    Html.div [
                        prop.className "text-center mb-8"
                        prop.children [
                            Html.span [
                                prop.className "text-6xl mb-4 block"
                                prop.text "🎓"
                            ]
                            Html.h1 [
                                prop.className "text-3xl font-bold text-gray-800"
                                prop.text "Welcome"
                            ]
                            Html.p [
                                prop.className "text-gray-600 mt-2"
                                prop.text "Student Management System"
                            ]
                        ]
                    ]
                    Html.div [
                        prop.className "space-y-4"
                        prop.children [
                            Html.input [
                                prop.className "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                prop.placeholder "Username"
                                prop.onChange (fun v -> username <- v)
                            ]
                            Html.input [
                                prop.className "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                prop.placeholder "Password"
                                prop.type' "password"
                                prop.onChange (fun v -> password <- v)
                                prop.onKeyPress (fun e -> if e.key = "Enter" then dispatch (Login (username, password)))
                            ]
                            Html.button [
                                prop.className "w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                                prop.text "Login"
                                prop.onClick (fun _ -> dispatch (Login (username, password)))
                            ]
                        ]
                    ]
                    Html.div [
                        prop.className "mt-6 text-sm text-gray-600 text-center space-y-1"
                        prop.children [
                            Html.p [
                                prop.text "Demo credentials:"
                            ]
                            Html.p [
                                prop.className "font-mono"
                                prop.text "admin / admin123"
                            ]
                            Html.p [
                                prop.className "font-mono"
                                prop.text "viewer / viewer123"
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]

// ==================== MAIN VIEW ====================
let view (model: Model) (dispatch: Msg -> unit) =
    if model.ShowLoginDialog then
        loginView dispatch
    else
        Html.div [
            prop.className "min-h-screen bg-gray-50"
            prop.children [
                navbar model dispatch
                messageAlert model dispatch
                studentDialog model dispatch false // Add dialog
                studentDialog model dispatch true // Edit dialog

                Html.div [
                    prop.className "container mx-auto px-6 py-8"
                    prop.children [
                        // View Tabs
                        Html.div [
                            prop.className "flex space-x-4 mb-6"
                            prop.children [
                                Html.button [
                                    prop.className $"px-6 py-2 rounded-lg font-medium transition-colors {if model.SelectedView = "students" then "bg-blue-600 text-white" else "bg-white text-gray-700 hover:bg-gray-100"}"
                                    prop.text "Students"
                                    prop.onClick (fun _ -> dispatch (ChangeView "students"))
                                ]
                                Html.button [
                                    prop.className $"px-6 py-2 rounded-lg font-medium transition-colors {if model.SelectedView = "statistics" then "bg-blue-600 text-white" else "bg-white text-gray-700 hover:bg-gray-100"}"
                                    prop.text "Statistics"
                                    prop.onClick (fun _ -> dispatch (ChangeView "statistics"))
                                ]
                            ]
                        ]

                        // Content based on selected view
                        if model.SelectedView = "students" then
                            Html.div [
                                prop.children [
                                    if Auth.canPerformOperation model.System "add" then
                                        Html.button [
                                            prop.className "mb-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg text-white px-6 py-3 rounded-lg font-medium transition-all"
                                            prop.text "➕ Add New Student"
                                            prop.onClick (fun _ -> dispatch ShowAddStudentDialog)
                                        ]

                                    Html.div [
                                        prop.className "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                        prop.children [
                                            for student in model.System.Students do
                                                studentCard
                                                    student
                                                    dispatch
                                                    (Auth.canPerformOperation model.System "delete")
                                                    (Auth.canPerformOperation model.System "update")
                                        ]
                                    ]
                                ]
                            ]
                        else
                            statisticsView model dispatch
                    ]
                ]
            ]
        ]

// ==================== ENTRY POINT ====================
open Elmish.React
Program.mkProgram init update view
|> Program.withReactSynchronous "feliz-app"
|> Program.withConsoleTrace
|> Program.run