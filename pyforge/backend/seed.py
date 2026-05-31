"""Seed the database with the Python for Engineers course."""
import uuid

from app.core.database import SessionLocal
from app.models import Course, Exercise, Lesson, Module

COURSE_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
MODULE_BASICS = uuid.UUID("22222222-2222-2222-2222-222222222221")
MODULE_DATA = uuid.UUID("22222222-2222-2222-2222-222222222222")
MODULE_NUMPY = uuid.UUID("22222222-2222-2222-2222-222222222223")


def seed():
    db = SessionLocal()
    try:
        if db.query(Course).filter(Course.slug == "python-for-engineers").first():
            print("Seed data already exists, skipping.")
            return

        course = Course(
            id=COURSE_ID,
            slug="python-for-engineers",
            title="Python for Engineers — Foundations",
            description="Learn Python from scratch with hands-on exercises designed for engineering students.",
            order_index=0,
            metadata_={"tags": ["basics", "numpy", "plotting"]},
        )
        db.add(course)

        mod_basics = Module(id=MODULE_BASICS, course_id=COURSE_ID, title="Python Basics", order_index=0)
        mod_data = Module(id=MODULE_DATA, course_id=COURSE_ID, title="Data Structures", order_index=1)
        mod_numpy = Module(id=MODULE_NUMPY, course_id=COURSE_ID, title="NumPy & Plotting", order_index=2)
        db.add_all([mod_basics, mod_data, mod_numpy])

        lessons = [
            Lesson(
                module_id=MODULE_BASICS,
                title="Hello, Python!",
                order_index=0,
                markdown_content="""# Hello, Python!

Python is a versatile language used in engineering, data science, and automation.

## Your first program

The `print()` function displays output:

```python
print("Hello, World!")
```

## Variables

Store values in variables:

```python
name = "Engineer"
age = 20
print(name, age)
```
""",
                code_cells=[
                    {"id": "1", "label": "Hello World", "code": 'print("Hello, World!")'},
                    {"id": "2", "label": "Variables", "code": 'name = "Engineer"\nage = 20\nprint(f"{name} is {age} years old")'},
                ],
            ),
            Lesson(
                module_id=MODULE_BASICS,
                title="Control Flow",
                order_index=1,
                markdown_content="""# Control Flow

## If statements

```python
score = 85
if score >= 60:
    print("Pass")
else:
    print("Fail")
```

## Loops

```python
for i in range(5):
    print(i)
```
""",
                code_cells=[
                    {"id": "1", "label": "If/Else", "code": "score = 85\nif score >= 60:\n    print('Pass')\nelse:\n    print('Fail')"},
                    {"id": "2", "label": "For loop", "code": "total = 0\nfor i in range(1, 6):\n    total += i\nprint(total)"},
                ],
            ),
            Lesson(
                module_id=MODULE_BASICS,
                title="Functions",
                order_index=2,
                markdown_content="""# Functions

Define reusable blocks of code:

```python
def area_circle(r):
    return 3.14159 * r ** 2

print(area_circle(5))
```
""",
                code_cells=[
                    {"id": "1", "label": "Define a function", "code": "def greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('Engineer'))"},
                ],
            ),
            Lesson(
                module_id=MODULE_DATA,
                title="Lists and Loops",
                order_index=0,
                markdown_content="""# Lists

Lists store ordered collections:

```python
forces = [10, 20, 30, 40]
print(sum(forces))
print(max(forces))
```
""",
                code_cells=[
                    {"id": "1", "label": "List operations", "code": "forces = [10, 20, 30, 40]\nprint('Sum:', sum(forces))\nprint('Max:', max(forces))"},
                ],
            ),
            Lesson(
                module_id=MODULE_DATA,
                title="Dictionaries",
                order_index=1,
                markdown_content="""# Dictionaries

Key-value pairs for structured data:

```python
material = {"name": "Steel", "density": 7850, "E": 200e9}
print(material["density"])
```
""",
                code_cells=[
                    {"id": "1", "label": "Dictionary", "code": 'material = {"name": "Steel", "density": 7850}\nprint(material["name"], material["density"])'},
                ],
            ),
            Lesson(
                module_id=MODULE_DATA,
                title="File I/O Intro",
                order_index=2,
                markdown_content="""# File I/O

Read and write text files:

```python
lines = ["line1", "line2", "line3"]
for line in lines:
    print(line.upper())
```
""",
                code_cells=[
                    {"id": "1", "label": "Process lines", "code": 'data = "10,20,30,40,50".split(",")\nvalues = [float(x) for x in data]\nprint("Average:", sum(values)/len(values))'},
                ],
            ),
            Lesson(
                module_id=MODULE_NUMPY,
                title="NumPy Basics",
                order_index=0,
                markdown_content="""# NumPy Basics

NumPy provides fast array operations for engineering:

```python
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
print(arr.mean())
print(arr * 2)
```

> **Note:** NumPy code runs on the server sandbox.
""",
                code_cells=[
                    {"id": "1", "label": "NumPy array", "code": "import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint('Mean:', arr.mean())\nprint('Doubled:', arr * 2)"},
                ],
            ),
            Lesson(
                module_id=MODULE_NUMPY,
                title="Plotting with Matplotlib",
                order_index=1,
                markdown_content="""# Plotting with Matplotlib

Visualize data with plots:

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.plot(x, y)
plt.title("Sine Wave")
plt.savefig("/code/plots/plot.png")
print("Plot saved!")
```
""",
                code_cells=[
                    {"id": "1", "label": "Sine plot", "code": "import matplotlib.pyplot as plt\nimport numpy as np\n\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\nplt.plot(x, y)\nplt.title('Sine Wave')\nplt.savefig('/code/plots/plot.png')\nprint('Plot saved!')"},
                ],
            ),
        ]
        db.add_all(lessons)

        exercises = [
            Exercise(
                module_id=MODULE_BASICS,
                title="Sum Two Numbers",
                order_index=0,
                problem_statement="Write a function `add(a, b)` that returns the sum of two numbers.",
                starter_code="def add(a, b):\n    # Your code here\n    pass\n",
                test_cases=[
                    {"name": "Basic sum", "function": "add", "args": [2, 3], "expected": 5},
                    {"name": "Negative numbers", "function": "add", "args": [-1, 1], "expected": 0},
                    {"name": "Large numbers", "function": "add", "args": [1000, 2000], "expected": 3000, "hidden": True},
                ],
                hints=["A function returns a value using the return keyword."],
            ),
            Exercise(
                module_id=MODULE_BASICS,
                title="FizzBuzz Lite",
                order_index=1,
                problem_statement="Write a function `fizzbuzz(n)` that returns 'Fizz' if n is divisible by 3, 'Buzz' if divisible by 5, 'FizzBuzz' if both, otherwise return the number as a string.",
                starter_code="def fizzbuzz(n):\n    # Your code here\n    pass\n",
                test_cases=[
                    {"name": "Fizz", "function": "fizzbuzz", "args": [3], "expected": "Fizz"},
                    {"name": "Buzz", "function": "fizzbuzz", "args": [5], "expected": "Buzz"},
                    {"name": "FizzBuzz", "function": "fizzbuzz", "args": [15], "expected": "FizzBuzz", "hidden": True},
                    {"name": "Number", "function": "fizzbuzz", "args": [7], "expected": "7", "hidden": True},
                ],
            ),
            Exercise(
                module_id=MODULE_DATA,
                title="List Statistics",
                order_index=0,
                problem_statement="Write a function `list_stats(numbers)` that returns a dict with keys 'min', 'max', 'mean' for a list of numbers.",
                starter_code="def list_stats(numbers):\n    # Your code here\n    pass\n",
                test_cases=[
                    {"name": "Basic stats", "function": "list_stats", "args": [[1, 2, 3, 4, 5]], "expected": {"min": 1, "max": 5, "mean": 3.0}},
                    {"name": "Single element", "function": "list_stats", "args": [[42]], "expected": {"min": 42, "max": 42, "mean": 42.0}, "hidden": True},
                ],
            ),
            Exercise(
                module_id=MODULE_NUMPY,
                title="Array Mean",
                order_index=0,
                problem_statement="Write a function `array_mean(arr)` that takes a list of numbers and returns the mean using NumPy.",
                starter_code="import numpy as np\n\ndef array_mean(arr):\n    # Your code here\n    pass\n",
                test_cases=[
                    {"name": "Simple mean", "function": "array_mean", "args": [[1, 2, 3, 4, 5]], "expected": 3.0},
                    {"name": "Empty-ish", "function": "array_mean", "args": [[10, 20]], "expected": 15.0, "hidden": True},
                ],
            ),
            Exercise(
                module_id=MODULE_NUMPY,
                title="Linear Space",
                order_index=1,
                problem_statement="Write a function `make_linear(start, stop, n)` that returns a NumPy array of `n` evenly spaced values from `start` to `stop` (inclusive).",
                starter_code="import numpy as np\n\ndef make_linear(start, stop, n):\n    # Your code here\n    pass\n",
                test_cases=[
                    {"name": "Five points", "function": "make_linear", "args": [0, 10, 5], "expected": [0.0, 2.5, 5.0, 7.5, 10.0]},
                    {"name": "Two points", "function": "make_linear", "args": [0, 1, 2], "expected": [0.0, 1.0], "hidden": True},
                ],
            ),
        ]
        db.add_all(exercises)
        db.commit()
        print("Seed data created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
