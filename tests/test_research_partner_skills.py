import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILLS = [
    ROOT / "skills/collect-company-context/SKILL.md",
    ROOT / "skills/daily-opportunities/SKILL.md",
    ROOT / "skills/daily-outreach/SKILL.md",
]
CONTRACT = ROOT / "skills/_shared/research-partner-workflow.md"


class ResearchPartnerSkillTests(unittest.TestCase):
    def test_skill_references_resolve(self) -> None:
        for skill in SKILLS:
            for target in re.findall(r"]\((\.\.?/[^)#]+)", skill.read_text()):
                self.assertTrue((skill.parent / target).resolve().exists())

    def test_contract_contains_live_schema_invariants(self) -> None:
        contract = CONTRACT.read_text()
        required = [
            "Company & product",
            "Pricing & business model",
            "Market & positioning",
            "Customer needs & examples",
            "Business goals & baseline",
            "Sales process & channels",
            "Team & responsibilities",
            "Source list",
            "Required",
            "Prefer",
            "Exclude",
            "This looks like a good fit. We should reach out to them.",
        ]
        for value in required:
            self.assertIn(value, contract)

    def test_legacy_model_does_not_return(self) -> None:
        combined = "\n".join(path.read_text() for path in SKILLS + [CONTRACT])
        for obsolete in [
            "three target profiles",
            "ICP #1",
            "Hypothesis iterations",
            "Knowledge → Company context",
            "Follow-up date",
        ]:
            self.assertNotIn(obsolete, combined)

    def test_behavioral_cases_cover_all_three_skills(self) -> None:
        cases = json.loads(
            (ROOT / "evals/research_partner/cases.json").read_text()
        )
        self.assertEqual(len({case["id"] for case in cases}), len(cases))
        covered = {case["skill"] for case in cases}
        self.assertEqual(
            covered,
            {
                "skills/collect-company-context/SKILL.md",
                "skills/daily-opportunities/SKILL.md",
                "skills/daily-outreach/SKILL.md",
            },
        )
        for case in cases:
            self.assertTrue((ROOT / case["skill"]).exists())
            self.assertTrue(case["assertions"])

    def test_completed_reviews_are_paginated_and_closed(self) -> None:
        opportunities = re.sub(
            r"\s+",
            " ",
            (ROOT / "skills/daily-opportunities/SKILL.md").read_text(),
        )
        for instruction in [
            "read every review page",
            "reconcile each current answer",
            "keep the row Awaiting review",
            "mark the row Reviewed",
        ]:
            self.assertIn(instruction, opportunities)


if __name__ == "__main__":
    unittest.main()
