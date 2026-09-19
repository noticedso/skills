#!/usr/bin/env python3
"""Run local model-based decision evals for the research-partner skills."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CASES = ROOT / "evals/research_partner/cases.json"
OUTPUT_SCHEMA = ROOT / "evals/research_partner/output.schema.json"
CONTRACT = ROOT / "skills/_shared/research-partner-workflow.md"


def read_path(value: dict[str, Any], path: str) -> Any:
    current: Any = value
    for part in path.split("."):
        current = current[part]
    return current


def score(result: dict[str, Any], assertions: list[dict[str, Any]]) -> list[str]:
    failures: list[str] = []
    for assertion in assertions:
        path = assertion["path"]
        op = assertion["op"]
        expected = assertion["value"]
        try:
            actual = read_path(result, path)
        except (KeyError, TypeError):
            failures.append(f"{path}: missing")
            continue

        if op == "eq":
            passed = actual == expected
        elif op == "is_null":
            passed = actual is None
        elif op == "contains_all":
            passed = isinstance(actual, list) and all(
                item in actual for item in expected
            )
        elif op == "len_eq":
            passed = hasattr(actual, "__len__") and len(actual) == expected
        elif op == "len_lte":
            passed = hasattr(actual, "__len__") and len(actual) <= expected
        else:
            failures.append(f"{path}: unsupported assertion {op}")
            continue

        if not passed:
            failures.append(
                f"{path}: expected {op} {expected!r}, received {actual!r}"
            )
    return failures


def prompt_for(case: dict[str, Any]) -> str:
    return f"""Evaluate one research-partner skill decision.

Read these files before deciding:
- {case['skill']}
- {CONTRACT.relative_to(ROOT)}

Treat the fixture as the complete available external state. Do not browse, write
files, call external services, or invent missing facts. Decide what the skill
should do for this request and return only the structured result required by the
output schema. Use exact fixture IDs. Fill irrelevant nullable fields with null,
arrays with [], and booleans with false unless the skill requires otherwise.
Report post-action state, not only fields directly modified: list every explicit
Yes in approved_for_outreach, every canonical heading in
company_brain_sections, and whether all historical records and relevant evidence
are preserved. Return fixture IDs, rather than labels or prose, in ID fields such
as unconfirmed_facts and approved_for_outreach. Set metric_goal to the exact goal
whose metrics this decision affects, even when the metric write is described
rather than executed in the fixture.

Case ID: {case['id']}
User request: {case['request']}
Fixture:
{json.dumps(case['fixture'], indent=2, ensure_ascii=False)}
"""


def run_case(
    case: dict[str, Any], model: str, effort: str, timeout: int
) -> tuple[dict[str, Any] | None, str | None]:
    with tempfile.TemporaryDirectory(prefix="noticed-skill-eval-") as tmp:
        output = Path(tmp) / "result.json"
        command = [
            "codex",
            "exec",
            "--ephemeral",
            "--ignore-user-config",
            "--ignore-rules",
            "--sandbox",
            "read-only",
            "--model",
            model,
            "--config",
            f'model_reasoning_effort="{effort}"',
            "--output-schema",
            str(OUTPUT_SCHEMA),
            "--output-last-message",
            str(output),
            "--cd",
            str(ROOT),
            prompt_for(case),
        ]
        try:
            completed = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
                check=False,
            )
        except FileNotFoundError:
            return None, "codex CLI is not installed or not on PATH"
        except subprocess.TimeoutExpired:
            return None, f"timed out after {timeout}s"

        if completed.returncode != 0:
            details = completed.stderr.strip() or completed.stdout.strip()
            return None, f"codex exited {completed.returncode}: {details[-1200:]}"
        try:
            return json.loads(output.read_text()), None
        except (FileNotFoundError, json.JSONDecodeError) as exc:
            return None, f"invalid structured output: {exc}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    parser.add_argument("--case", action="append", dest="selected")
    parser.add_argument("--model", default="gpt-5.6-luna")
    parser.add_argument("--effort", default="medium")
    parser.add_argument("--repeats", type=int, default=1)
    parser.add_argument("--timeout", type=int, default=180)
    parser.add_argument("--results", type=Path)
    args = parser.parse_args()

    cases = json.loads(args.cases.read_text())
    if args.selected:
        selected = set(args.selected)
        cases = [case for case in cases if case["id"] in selected]
        missing = selected - {case["id"] for case in cases}
        if missing:
            parser.error(f"unknown case(s): {', '.join(sorted(missing))}")

    runs: list[dict[str, Any]] = []
    total_failures = 0
    for case in cases:
        for repeat in range(1, args.repeats + 1):
            result, error = run_case(case, args.model, args.effort, args.timeout)
            failures = [error] if error else score(result or {}, case["assertions"])
            total_failures += bool(failures)
            status = "PASS" if not failures else "FAIL"
            print(
                f"{status} {case['id']} run {repeat}/{args.repeats}",
                flush=True,
            )
            for failure in failures:
                print(f"  - {failure}", flush=True)
            runs.append(
                {
                    "case": case["id"],
                    "repeat": repeat,
                    "result": result,
                    "failures": failures,
                }
            )

    summary = {
        "model": args.model,
        "effort": args.effort,
        "runs": runs,
        "passed": len(runs) - total_failures,
        "failed": total_failures,
    }
    if args.results:
        args.results.parent.mkdir(parents=True, exist_ok=True)
        args.results.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    print(f"\n{summary['passed']}/{len(runs)} runs passed", flush=True)
    return 1 if total_failures else 0


if __name__ == "__main__":
    sys.exit(main())
