import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]


class ReleaseManifestTests(unittest.TestCase):
    def test_version_bump_updates_and_commits_codex_manifest(self) -> None:
        workflow = (
            REPOSITORY_ROOT / ".github/workflows/version-bump.yml"
        ).read_text()

        self.assertIn("CODEX_FILE=.codex-plugin/plugin.json", workflow)
        self.assertIn(
            'CODEX_VERSION="${NEW}+codex.${GITHUB_SHA::12}"',
            workflow,
        )
        self.assertIn(
            "jq --arg v \"$CODEX_VERSION\" '.version = $v' \"$CODEX_FILE\"",
            workflow,
        )
        self.assertIn(
            "git add .claude-plugin/marketplace.json .codex-plugin/plugin.json",
            workflow,
        )


if __name__ == "__main__":
    unittest.main()
