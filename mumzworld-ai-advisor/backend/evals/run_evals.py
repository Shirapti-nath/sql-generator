"""
Mumzworld AI Advisor — Eval Runner

Usage:
    python run_evals.py                    # run all evals
    python run_evals.py --id eval-001      # run a specific eval
    python run_evals.py --verbose          # show full responses
"""

import sys
import json
import argparse
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from retriever import ProductRetriever
from advisor import ParentingAdvisor


def load_test_cases(path: str = "test_cases.json") -> list:
    with open(Path(__file__).parent / path) as f:
        return json.load(f)


def score_response(response: str, expected: dict, rubric: dict) -> dict:
    response_lower = response.lower()
    results = {}

    for phrase in expected.get("must_include", []):
        results[f"includes '{phrase}'"] = phrase.lower() in response_lower

    for phrase in expected.get("must_not_include", []):
        results[f"excludes '{phrase}'"] = phrase.lower() not in response_lower

    if expected.get("safety_critical"):
        safety_phrases = ["not for sleeping", "safe sleep", "back to sleep", "supervise"]
        results["safety_warning_present"] = any(p in response_lower for p in safety_phrases)

    if expected.get("clarification_expected"):
        question_words = ["how old", "age", "what age", "old is"]
        results["asks_clarifying_question"] = "?" in response and any(
            q in response_lower for q in question_words
        )

    if "must_mention_products" in expected and expected["must_mention_products"]:
        link_count = response.lower().count("mumzworld.com")
        results["includes_product_links"] = link_count > 0

    passed = sum(1 for v in results.values() if v)
    total = len(results)
    score = round(passed / total * 100, 1) if total > 0 else 0.0

    return {"checks": results, "score": score, "passed": passed, "total": total}


def run_eval(case: dict, retriever: ProductRetriever, advisor: ParentingAdvisor, verbose: bool = False) -> dict:
    query = case["query"]
    products = retriever.search(query, n_results=5)
    response = advisor.respond(user_message=query, products=products, conversation_history=[])

    scoring = score_response(response, case["expected"], case["scoring_rubric"])

    result = {
        "id": case["id"],
        "name": case["name"],
        "score": scoring["score"],
        "passed": scoring["passed"],
        "total": scoring["total"],
        "checks": scoring["checks"],
    }

    if verbose:
        result["query"] = query
        result["response"] = response
        result["products_retrieved"] = [p["name"] for p in products]

    return result


def print_results(results: list, verbose: bool = False):
    print("\n" + "=" * 70)
    print("MUMZWORLD AI ADVISOR — EVAL RESULTS")
    print("=" * 70)

    overall_scores = []

    for r in results:
        status = "PASS" if r["score"] >= 75 else "FAIL"
        icon = "✓" if status == "PASS" else "✗"
        print(f"\n{icon} [{r['id']}] {r['name']}")
        print(f"   Score: {r['score']}% ({r['passed']}/{r['total']} checks passed)")

        failed_checks = [k for k, v in r["checks"].items() if not v]
        if failed_checks:
            print(f"   Failed: {', '.join(failed_checks)}")

        if verbose:
            print(f"\n   Query: {r.get('query', '')}")
            print(f"   Products retrieved: {r.get('products_retrieved', [])}")
            print(f"\n   Response:\n   {r.get('response', '').replace(chr(10), chr(10) + '   ')}")

        overall_scores.append(r["score"])

    avg = round(sum(overall_scores) / len(overall_scores), 1) if overall_scores else 0
    passed_count = sum(1 for r in results if r["score"] >= 75)

    print("\n" + "=" * 70)
    print(f"OVERALL: {passed_count}/{len(results)} evals passed | Average score: {avg}%")
    print("=" * 70 + "\n")

    return avg


def main():
    parser = argparse.ArgumentParser(description="Run Mumzworld advisor evals")
    parser.add_argument("--id", help="Run a specific eval by ID")
    parser.add_argument("--verbose", action="store_true", help="Show full responses")
    parser.add_argument("--output", help="Save results to JSON file")
    args = parser.parse_args()

    print("Initialising retriever and loading catalogue...")
    retriever = ProductRetriever()
    retriever.load_catalogue("../../data/products.json")

    print("Initialising advisor...")
    advisor = ParentingAdvisor()

    test_cases = load_test_cases()

    if args.id:
        test_cases = [c for c in test_cases if c["id"] == args.id]
        if not test_cases:
            print(f"No eval found with id '{args.id}'")
            sys.exit(1)

    results = []
    for case in test_cases:
        print(f"Running eval: {case['id']} — {case['name']}...")
        try:
            result = run_eval(case, retriever, advisor, verbose=args.verbose)
            results.append(result)
        except Exception as e:
            print(f"  ERROR: {e}")
            results.append({
                "id": case["id"],
                "name": case["name"],
                "score": 0,
                "passed": 0,
                "total": 1,
                "checks": {"error": False},
                "error": str(e),
            })
        time.sleep(0.5)

    print_results(results, verbose=args.verbose)

    if args.output:
        with open(args.output, "w") as f:
            json.dump(results, f, indent=2)
        print(f"Results saved to {args.output}")


if __name__ == "__main__":
    main()
