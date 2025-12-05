namespace StudentManagementWeb

open System

type SystemRole =
    | Admin
    | Viewer

type Student = {
    Id: int
    Name: string
    Age: int
    Grades: float list
    Class: string
}

type StudentSystem = {
    Students: Student list
    CurrentUser: SystemRole
    LastUpdate: DateTime
}

type SystemMessage =
    | Success of string
    | Error of string
    | Warning of string