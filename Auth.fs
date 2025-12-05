namespace StudentManagementWeb

module Auth =
    let canPerformOperation (system: StudentSystem) (operation: string) : bool =
        match system.CurrentUser with
        | Admin -> true
        | Viewer -> 
            match operation with
            | "view" | "calculate" | "statistics" -> true
            | _ -> false

    let changeUserRole (system: StudentSystem) (newRole: SystemRole) : StudentSystem =
        { system with CurrentUser = newRole }

    let login (system: StudentSystem) (username: string) (password: string) : StudentSystem * SystemMessage =
        match username.ToLower(), password with
        | ("admin", "admin123") -> 
            changeUserRole system Admin, Success "Logged in as System Administrator"
        | ("viewer", "viewer123") -> 
            changeUserRole system Viewer, Success "Logged in as Viewer"
        | _ -> 
            system, Error "Invalid username or password"