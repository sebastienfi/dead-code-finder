# Technical Context

## Development Technologies
- **TypeScript**: Primary language for developing the VSCode extension
- **Node.js**: Runtime environment for the extension
- **VSCode Extension API**: For integration with VSCode
- **Jest**: For testing the extension

## Core Libraries and Tools
- **Vulture**: Python static analysis tool specifically for finding dead code
- **VSCode TreeView API**: For displaying results in a custom sidebar view
- **child_process**: Node.js module for spawning external processes
- **Language Server Protocol**: (Potential future use) For language-agnostic integration

## Python Integration
- Need to detect and manage Python environments in user workspace
- Execute Vulture as a subprocess and capture its output
- Parse output format into structured data for display
- Handle Python-specific syntax and module systems

## Design Patterns
- **Adapter Pattern**: For wrapping external tools like Vulture
- **Strategy Pattern**: For different language analyzers
- **Observer Pattern**: For file change detection and result updates
- **Command Pattern**: For implementing VSCode commands

## Extension Points
- **Commands**: Trigger analysis, navigate to dead code
- **Views**: Custom tree view for displaying results
- **Configuration**: Settings for analysis behavior
- **Language Support**: Future extension points for new languages 