import base64
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

from app.core.config import settings


def run_code_in_sandbox(code: str, stdin: str = "", test_harness: str | None = None) -> dict:
    """Execute Python code in an isolated Docker container or subprocess fallback."""
    start = time.time()
    work_dir = tempfile.mkdtemp(prefix="pyforge_")

    try:
        run_script = test_harness if test_harness else _build_run_script(code, stdin)
        code_dir = Path(work_dir) / "code"
        code_dir.mkdir()
        (code_dir / "run.py").write_text(run_script)

        plots_dir = code_dir / "plots"
        plots_dir.mkdir()

        result = _run_docker(code_dir, plots_dir)
        if result is None:
            result = _run_subprocess(code_dir)

        duration_ms = int((time.time() - start) * 1000)
        plots = []
        for png in plots_dir.glob("*.png"):
            plots.append(base64.b64encode(png.read_bytes()).decode())

        return {
            "stdout": result.get("stdout", ""),
            "stderr": result.get("stderr", ""),
            "plots": plots,
            "exit_code": result.get("exit_code", 1),
            "duration_ms": duration_ms,
            "status": "completed" if result.get("exit_code", 1) == 0 else "error",
            "error": result.get("error"),
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Execution timed out",
            "plots": [],
            "exit_code": 124,
            "duration_ms": settings.sandbox_timeout * 1000,
            "status": "timeout",
            "error": "Execution exceeded time limit",
        }
    except Exception as exc:
        return {
            "stdout": "",
            "stderr": str(exc),
            "plots": [],
            "exit_code": 1,
            "duration_ms": int((time.time() - start) * 1000),
            "status": "error",
            "error": str(exc),
        }
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


def _build_run_script(code: str, stdin: str) -> str:
    stdin_b64 = base64.b64encode(stdin.encode()).decode()
    return f'''import sys, io, base64, os
sys.stdin = io.StringIO(base64.b64decode("{stdin_b64}").decode())
os.makedirs("/code/plots", exist_ok=True)
os.chdir("/code/plots")
try:
    import matplotlib
    matplotlib.use("Agg")
except ImportError:
    pass
os.chdir("/code")
exec(compile({repr(code)}, "<student>", "exec"))
'''


def _run_docker(code_dir: Path, plots_dir: Path) -> dict | None:
    try:
        cmd = [
            "docker", "run", "--rm",
            "--network", "none",
            "--memory", f"{settings.sandbox_memory_mb}m",
            "--cpus", "0.5",
            "-v", f"{code_dir}:/code:ro",
            "-v", f"{plots_dir}:/code/plots",
            settings.sandbox_image,
        ]
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=settings.sandbox_timeout,
        )
        return {
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "exit_code": proc.returncode,
        }
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None


def _run_subprocess(code_dir: Path) -> dict:
    """Fallback when Docker is unavailable (dev without sandbox image)."""
    env = os.environ.copy()
    env["MPLBACKEND"] = "Agg"
    env["PYTHONPATH"] = str(code_dir)
    proc = subprocess.run(
        ["python3", str(code_dir / "run.py")],
        capture_output=True,
        text=True,
        timeout=settings.sandbox_timeout,
        cwd=str(code_dir),
        env=env,
    )
    return {
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "exit_code": proc.returncode,
    }
