# Commit Strategy

## Branch Workflow

```
feature branches → dev (staging) → main (production)
```

---

## Commit Guidelines

### Feature Branches

Use **atomic commits** - each commit should represent a single, complete change that can stand on its own.

- One logical change per commit
- Commit message explains the "why"
- Keep commits small and focused

---

## Merge Strategy

| PR Type | Strategy | Why |
|---------|----------|-----|
| feature → dev | **Squash merge** | Clean single commit per feature |
| dev → main | **Rebase merge** | Commits replayed, no merge commits, branches stay in sync |

---

## GitHub Settings

- Allow merge commits: Disabled
- Allow squash merge: Enabled
- Allow rebase merge: Enabled
- Auto-delete branches: Enabled
