#!/usr/bin/env python3
"""
Sample Python file with intentional dead code for testing the Dead Code Finder extension.
"""

import os
import sys
import math
import json  # Unused import
import datetime  # Unused import


def calculate_area(radius):
    """Calculate the area of a circle given its radius."""
    return math.pi * radius**2


def calculate_circumference(radius):
    """Calculate the circumference of a circle given its radius."""
    return 2 * math.pi * radius


def calculate_diameter(radius):
    """Calculate the diameter of a circle given its radius."""
    return 2 * radius


def unused_function():
    """This function is never called - should be detected as dead code."""
    message = "This function is unused"
    return message


class Shape:
    """Base class for shapes."""

    def __init__(self, name):
        self.name = name

    def describe(self):
        """Return a description of the shape."""
        return f"This is a {self.name}"

    def unused_method(self):
        """This method is never called - should be detected as dead code."""
        return f"Unused method in {self.name}"


class Circle(Shape):
    """Circle class extending Shape."""

    def __init__(self, radius):
        super().__init__("circle")
        self.radius = radius

    def area(self):
        """Calculate the area of the circle."""
        return calculate_area(self.radius)

    def circumference(self):
        """Calculate the circumference of the circle."""
        return calculate_circumference(self.radius)

    def unused_circle_method(self):
        """This method is never called - should be detected as dead code."""
        return f"Circle with radius {self.radius}"


def main():
    """Main function to demonstrate the code."""
    # Create a circle and calculate its properties
    circle = Circle(5)
    print(f"Circle area: {circle.area()}")
    print(f"Circle circumference: {circle.circumference()}")
    print(f"Circle description: {circle.describe()}")

    # Calculate diameter directly
    diameter = calculate_diameter(5)
    print(f"Circle diameter: {diameter}")


if __name__ == "__main__":
    main()
