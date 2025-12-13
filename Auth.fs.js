import { SystemMessage, SystemRole, StudentSystem } from "./Models.fs.js";

export function canPerformOperation(system, operation) {
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

export function changeUserRole(system, newRole) {
    return new StudentSystem(system.Students, newRole, system.LastUpdate);
}

export function login(system, username, password) {
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
        case 0:
            return [changeUserRole(system, new SystemRole(0, [])), new SystemMessage(0, ["Logged in as System Administrator"])];
        case 1:
            return [changeUserRole(system, new SystemRole(1, [])), new SystemMessage(0, ["Logged in as Viewer"])];
        default:
            return [system, new SystemMessage(1, ["Invalid credentials"])];
    }
}