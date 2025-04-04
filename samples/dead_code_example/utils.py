"""
Utility functions for the sample application.
This file contains several unused functions and classes for testing the Dead Code Finder extension.
"""


def format_currency(amount, currency="USD"):
    """Format a number as currency."""
    symbols = {"USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥"}
    symbol = symbols.get(currency, "$")
    return f"{symbol}{amount:.2f}"


def calculate_tax(amount, rate=0.1):
    """Calculate tax amount based on rate."""
    return amount * rate


def validate_email(email):
    """Validate an email address format.

    This function is never called - should be detected as dead code.
    """
    import re

    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def generate_report(data, format_type="simple"):
    """Generate a report from data.

    This function is never called - should be detected as dead code.
    """
    if format_type == "simple":
        return "\n".join([f"{k}: {v}" for k, v in data.items()])
    elif format_type == "json":
        import json

        return json.dumps(data)
    else:
        return str(data)


class Logger:
    """A simple logger class.

    This class is never instantiated - should be detected as dead code.
    """

    def __init__(self, log_level="INFO"):
        self.log_level = log_level
        self.levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]

    def log(self, message, level="INFO"):
        """Log a message with a specified level."""
        if self.levels.index(level) >= self.levels.index(self.log_level):
            print(f"[{level}] {message}")

    def debug(self, message):
        """Log a debug message."""
        self.log(message, "DEBUG")

    def info(self, message):
        """Log an info message."""
        self.log(message, "INFO")

    def warning(self, message):
        """Log a warning message."""
        self.log(message, "WARNING")

    def error(self, message):
        """Log an error message."""
        self.log(message, "ERROR")

    def critical(self, message):
        """Log a critical message."""
        self.log(message, "CRITICAL")
