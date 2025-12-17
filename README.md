# 📘 Repository Contribution Guide

Welcome!
This document outlines the **mandatory rules and workflow** every team member must follow when contributing to this repository. The goal is to keep the project **clean, consistent, and free from unnecessary conflicts**.

---

## 🚀 Before You Start

### 1️⃣ Install project dependencies

After cloning the repository or switching branches, run:

```bash
npm install
```

---

### 2️⃣ Always sync with `development` (IMPORTANT)

Before starting any work, make sure your branch is up-to-date with the latest `development` branch.

**Correct workflow:**

```bash
git checkout development
git pull
git checkout your-branch-name
git rebase development
git rebase --continue  # if there are conflicts
```

⚠️ **Do NOT run `git pull origin development` while staying on your feature branch.**
This creates merge commits and increases the risk of conflicts.

---

### 3️⃣ Create a branch for every task or feature

Never work directly on `development` or `main`.

**Branch naming convention:**

- `yourName/feature-name`
- `yourName/fix-bug`

**Examples:**

```
nathan/auth-login
haris/api-payment
hendrik/ui-navbar
```

---

### 4️⃣ Commit and push ONLY to your own branch

After making changes:

```bash
git push origin your-branch-name
```

🚫 **Never push directly to `development` or `main`.**

---

### 5️⃣ Create a Pull Request (PR)

- Open a Pull Request **from your branch → `development`**
- Assign the Leader / Reviewer
- Wait for approval before merging

💡 All merges to `development` **must happen via Pull Request**, not local merge.

---

### 6️⃣ Communicate before large changes

If you plan to:

- modify shared config files (`package.json`, `lock files`, env, etc.)
- refactor folders
- introduce breaking changes

👉 **Notify the team first** (DM / WhatsApp).

---

## 🛡️ Mandatory Rules

### ✅ Use clear and consistent commit messages

```
feat: add login feature
fix: fix navbar overlap issue
refactor: restructure service layer
docs: update README
chore: update dependencies
```

---

### ❌ Never push directly to protected branches

- `main`
- `development`

These branches are **protected** and accept changes only via PR.

---

### 🔁 Always rebase before continuing work

If someone else merges to `development` while you are working:

```bash
git checkout development
git pull
git checkout your-branch-name
git rebase development
```

This keeps history clean and prevents large conflicts.

---

### 🧩 Keep commits small and meaningful

- Avoid dumping many changes into one commit
- Smaller commits are easier to review and revert

---

### 🧪 Test before pushing

Before creating a PR:

- Ensure the app runs correctly
- Fix lint/build errors

---

### ⚠️ Conflicts can happen — handle them properly

If a conflict occurs:

- Stay calm
- Do **not** force-push blindly
- Communicate with the team
- Resolve conflicts carefully

---

## ✔️ Need help?

Ask anytime:

> **"Teach me how to set up the repo step by step"**

I can guide you through:

- Branching strategy
- GitHub protection rules
- Pull Request workflow
- Conflict resolution best practices

---

✨ _Following this guide is mandatory for all contributors._
