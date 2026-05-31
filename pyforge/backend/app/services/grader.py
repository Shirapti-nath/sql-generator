import json
import textwrap

from app.services.sandbox import run_code_in_sandbox


def grade_submission(student_code: str, test_cases: list[dict]) -> dict:
    harness = _build_test_harness(student_code, test_cases)
    result = run_code_in_sandbox(student_code, test_harness=harness)

    if result["status"] == "timeout":
        return {
            "passed": 0,
            "total": len(test_cases),
            "score": 0,
            "results": [
                {
                    "name": tc.get("name", f"Test {i+1}"),
                    "passed": False,
                    "hidden": tc.get("hidden", False),
                    "message": "Execution timed out",
                }
                for i, tc in enumerate(test_cases)
            ],
        }

    try:
        output_lines = [line for line in result["stdout"].strip().split("\n") if line.startswith("PYFORGE_RESULT:")]
        if output_lines:
            parsed = json.loads(output_lines[-1].replace("PYFORGE_RESULT:", ""))
            return parsed
    except (json.JSONDecodeError, IndexError):
        pass

    return {
        "passed": 0,
        "total": len(test_cases),
        "score": 0,
        "results": [
            {
                "name": tc.get("name", f"Test {i+1}"),
                "passed": False,
                "hidden": tc.get("hidden", False),
                "message": result.get("stderr") or "Runtime error",
            }
            for i, tc in enumerate(test_cases)
        ],
    }


def _build_test_harness(student_code: str, test_cases: list[dict]) -> str:
    tests_json = json.dumps(test_cases)
    return textwrap.dedent(f'''
import json, sys, io, traceback

STUDENT_CODE = {repr(student_code)}
TEST_CASES = json.loads({repr(tests_json)})

namespace = {{"__name__": "__main__"}}
results = []

try:
    exec(compile(STUDENT_CODE, "<student>", "exec"), namespace)
except Exception as e:
    for i, tc in enumerate(TEST_CASES):
        results.append({{
            "name": tc.get("name", f"Test {{i+1}}"),
            "passed": False,
            "hidden": tc.get("hidden", False),
            "message": f"Code failed to load: {{e}}",
        }})
    print("PYFORGE_RESULT:" + json.dumps({{
        "passed": 0, "total": len(TEST_CASES), "score": 0, "results": results
    }}))
    sys.exit(0)

for i, tc in enumerate(TEST_CASES):
    name = tc.get("name", f"Test {{i+1}}")
    hidden = tc.get("hidden", False)
    try:
        if "function" in tc:
            fn = namespace.get(tc["function"])
            if fn is None:
                raise NameError(f"Function '{{tc['function']}}' not found")
            args = tc.get("args", [])
            actual = fn(*args)
            expected = tc.get("expected")
            try:
                import numpy as np
                if isinstance(actual, np.ndarray):
                    actual_cmp = actual.tolist()
                else:
                    actual_cmp = actual
                if isinstance(expected, list) and all(isinstance(x, float) for x in expected):
                    passed = all(abs(a - e) < 1e-9 for a, e in zip(actual_cmp, expected)) and len(actual_cmp) == len(expected)
                else:
                    passed = actual_cmp == expected
            except ImportError:
                passed = actual == expected
            result = {{
                "name": name,
                "passed": passed,
                "hidden": hidden,
                "expected": str(expected) if not hidden else None,
                "actual": str(actual) if not hidden else None,
                "message": "" if passed else "Output does not match expected value",
            }}
        elif "input" in tc:
            old_stdin = sys.stdin
            sys.stdin = io.StringIO(tc["input"])
            captured = io.StringIO()
            old_stdout = sys.stdout
            sys.stdout = captured
            exec(compile(STUDENT_CODE, "<student>", "exec"), namespace)
            sys.stdin = old_stdin
            sys.stdout = old_stdout
            actual = captured.getvalue().strip()
            expected = tc["expected_output"].strip()
            passed = actual == expected
            result = {{
                "name": name,
                "passed": passed,
                "hidden": hidden,
                "expected": expected if not hidden else None,
                "actual": actual if not hidden else None,
                "message": "" if passed else "Output does not match expected value",
            }}
        else:
            result = {{"name": name, "passed": False, "hidden": hidden, "message": "Invalid test case"}}
    except Exception as e:
        result = {{
            "name": name,
            "passed": False,
            "hidden": hidden,
            "message": str(e),
        }}
    results.append(result)

passed_count = sum(1 for r in results if r["passed"])
total = len(TEST_CASES)
score = int((passed_count / total) * 100) if total else 0
print("PYFORGE_RESULT:" + json.dumps({{
    "passed": passed_count, "total": total, "score": score, "results": results
}}))
''')
