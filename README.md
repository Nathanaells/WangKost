# 📘 Repository Contribution Guide

Welcome!\
This document outlines the rules and workflow every team member must
follow when contributing to this repository. The goal is to keep the
project clean, organized, and free from unnecessary conflicts.

---

## 🚀 Before You Start

### 1. Install project dependencies

After cloning or pulling the repository, run:

```bash
npm install
```

### 2. Pull the latest code from `development`

Always make sure your local environment is up-to-date:

```bash
git pull origin development
```

### 3. Create a new branch for each feature or task

Branch naming examples: - `yourName/feature-name` - `feature/yourName`

Examples:

    nathan/auth-login
    ui/fix-navbar

### 4. Push your changes into your branch (targeting `development`)

After committing:

```bash
git push origin your-branch-name
```

### 5. Communicate before pushing large changes

Inform the team via DM/WhatsApp to avoid merge conflicts.

### 6. Create a Pull Request (PR) → Wait for Leader approval

- Open a PR from your branch → `development`
- Wait for the Leader to review and approve
- Once approved, you can continue working on other features

---

## 🛡️ Recommended Additional Rules

### Use clear and consistent commit messages

    feat: add login feature
    fix: fix navbar bug
    refactor: clean up folder structure
    docs: update README
    chore: update dependencies

### Never push directly to `main` or `development`

All changes must go through a Pull Request.

### Always pull before starting work

```bash
git pull origin development
```

### Avoid large commits

Make smaller, meaningful commits that are easier to review.

### Test before pushing

Ensure the application runs without errors before creating a PR.

### Conflicts are normal

If a conflict occurs: - Stay calm\

- Communicate with the team\
- Resolve it carefully

---

## ✔️ Need help setting up the repository?

Just ask:\
**"Teach me how to set up the repo step by step"**\
and I'll guide you through everything --- branching strategy, GitHub
protection rules, PR workflow, and more.
