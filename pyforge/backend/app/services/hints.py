from app.core.config import settings


HINT_SYSTEM_PROMPT = """You are a Python tutor helping engineering students.
Give a nudge, NOT the full solution. Maximum 2 sentences.
If tests failed, reference the specific concept or line area causing the issue.
Never write complete solution code. Encourage the student to think."""


def generate_hint(
    problem_statement: str,
    student_code: str,
    previous_hints: list[str],
    test_failures: list[str] | None = None,
) -> str:
    if not settings.anthropic_api_key:
        return _fallback_hint(previous_hints, test_failures)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        user_content = f"""Problem:
{problem_statement}

Student code:
```python
{student_code}
```

Previous hints given: {previous_hints or 'None'}
Test failures: {test_failures or 'None'}

Give hint #{len(previous_hints) + 1}."""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=150,
            system=HINT_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )
        return message.content[0].text
    except Exception:
        return _fallback_hint(previous_hints, test_failures)


def _fallback_hint(previous_hints: list[str], test_failures: list[str] | None) -> str:
    hints = [
        "Read the problem statement carefully — what input does your function expect?",
        "Try printing intermediate values to see where your logic diverges.",
        "Check edge cases: empty input, single element, or zero values.",
        "Review Python syntax for loops and conditionals — off-by-one errors are common.",
        "Break the problem into smaller steps and solve one at a time.",
    ]
    idx = min(len(previous_hints), len(hints) - 1)
    if test_failures:
        return f"{hints[idx]} A test failed — compare your output with what's expected."
    return hints[idx]
