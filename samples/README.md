# Sample Projects for Dead Code Finder

This directory contains sample Python projects for testing the Dead Code Finder extension.

## Dead Code Example

The `dead_code_example` directory contains a simple Python package with intentional dead code for testing.

### Files

- `main.py`: Main module with several functions and classes, some of which are unused
- `utils.py`: Utility functions and classes, some of which are unused
- `__init__.py`: Package initialization file that only imports some of the functions

### Dead Code Items

The following items are intentionally unused and should be detected as dead code:

#### In main.py:

- Function: `unused_function`
- Method: `Shape.unused_method`
- Method: `Circle.unused_circle_method`

#### In utils.py:

- Function: `validate_email`
- Function: `generate_report`
- Class: `Logger` (and all its methods)

### Using the Sample

1. Open the `samples/dead_code_example` directory in VSCode
2. Run the "Find Dead Code: Analyze Workspace" command
3. Verify that the extension correctly identifies the unused code
4. Test the whitelist functionality by generating a whitelist file

## Additional Samples

More complex samples with different patterns of dead code will be added in the future. 