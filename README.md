# Student Management System

A web-based student management system built with F# and Fable, providing comprehensive functionality for managing student records, grades, and academic statistics.

## Features

- **Student Management**: Add, update, delete, and search student records
- **Grade Calculations**: Automatic GPA and grade point calculations
- **Statistical Analysis**: Generate comprehensive statistics on student performance
- **Authentication**: Secure user authentication system
- **Web Interface**: Modern web-based interface for easy access

## Technologies

- **F#**: Primary programming language
- **Fable**: F# to JavaScript compiler
- **Webpack**: Module bundler
- **Node.js**: JavaScript runtime environment

## Project Structure

```
student-management-system/
├── public/                    # Static files and assets
├── Auth.fs                    # Authentication module
├── Calculations.fs            # Grade and GPA calculation logic
├── Main.fs                    # Main application entry point
├── Models.fs                  # Data models and types
├── Operations.fs              # CRUD operations for students
├── Statistics.fs              # Statistical analysis functions
├── StudentManagementWeb.fsproj # F# project file
├── webpack.config.js          # Webpack configuration
├── package.json               # Node.js dependencies
└── package-lock.json          # Locked dependency versions
```

## Getting Started

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) (version 6.0 or higher)
- [Node.js](https://nodejs.org/) (version 14.x or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mohamed-algazar/student-management-system.git
cd student-management-system
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Restore .NET dependencies:
```bash
dotnet restore
```

### Running the Application

#### Development Mode

To run the application in development mode with hot reload:

```bash
npm start
```

The application will be available at `http://localhost:8080` (or the port specified in your webpack configuration).

#### Production Build

To create an optimized production build:

```bash
npm run build
```

The compiled files will be in the `public` directory.

## Module Overview

### Models.fs
Defines the core data structures used throughout the application, including:
- Student records
- Grade information
- Course details

### Operations.fs
Implements CRUD (Create, Read, Update, Delete) operations for managing student data:
- Add new students
- Update existing records
- Delete students
- Search and filter functionality

### Calculations.fs
Handles all academic calculations:
- GPA computation
- Grade point calculations
- Credit hour management

### Statistics.fs
Provides statistical analysis features:
- Performance metrics
- Class averages
- Grade distributions

### Auth.fs
Manages user authentication and authorization:
- User login/logout
- Session management
- Access control

### Main.fs
The main entry point that ties all modules together and manages the application flow.

## Testing

To run tests (if configured):

```bash
dotnet test
```

## Usage Examples

### Adding a Student
The system allows you to add student records with complete information including name, ID, courses, and grades.

### Calculating GPA
The system automatically calculates GPA based on entered grades and credit hours.

### Generating Statistics
View comprehensive statistics including class averages, grade distributions, and performance trends.

## License

This project is open source and available under the [MIT License](LICENSE).


- Built with F# and Fable
- Webpack for bundling
- The F# community for excellent documentation and support
