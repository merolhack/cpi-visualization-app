---
description: Run tests, update docs, commit and push to GitHub
---

# Test and Deploy Workflow

This workflow runs tests, updates documentation, commits changes, and pushes to GitHub.

## Steps

1. **Run all tests**
   ```bash
   npx vitest run
   ```
   - If tests fail, stop and report errors
   - If tests pass, continue

2. **Check git status**
   ```bash
   git status
   ```
   - Analyze which files have been modified
   - Identify new files that should be added

3. **Update documentation**
   - Update `CHANGELOG.txt` with new version entry
   - Update `ACTIVITIES.md` with completed work
   - Generate a conventional commit message based on changes

4. **Stage files**
   ```bash
   git add <modified-files>
   ```
   - Add all test files (if new)
   - Add all source code changes
   - Add documentation updates
   - Add migration files (if any)
   - Respect .gitignore rules

5. **Commit changes**
   ```bash
   git commit -m "<generated-commit-message>"
   ```
   - Use conventional commit format (feat:, fix:, test:, docs:, etc.)
   - Include detailed description of changes
   - Reference test coverage if applicable

6. **Push to GitHub**
   ```bash
   git push origin main
   ```
   - Push to the main branch
   - Confirm successful push

## Usage

Simply say: **"test and deploy the code"** or **"run the test-and-deploy workflow"**

## Notes

- This workflow will abort if tests fail
- All files are reviewed before committing
- Commit messages follow conventional commit standards
- The workflow respects .gitignore patterns
