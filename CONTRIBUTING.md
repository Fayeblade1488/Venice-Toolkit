# Contributing Guide

## Development Setup

```bash
# Clone and setup
git clone https://github.com/Fayeblade1488/Venice-ToolKit
cd Venice-ToolKit
npm install
npm run dev
```

## Workflow

1. **Fork** the repository
2. **Branch:** Use format `type/scope-description`
   - `feat/add-auth-system`
   - `fix/memory-leak-handler`
   - `docs/api-reference-update`
3. **Commit:** Follow [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `chore:` maintenance tasks
   - `refactor:` code restructuring
   - `test:` test additions/modifications
   - `perf:` performance improvements
4. **Test:** All tests must pass (`npm run test`)
5. **Lint:** Code must pass linting (`npm run lint`)
6. **PR:** Open against `main` with clear description
7. **Review:** Address feedback; squash commits before merge

## Code Standards

- **Style:** Follow TypeScript/React conventions (React Hooks, functional components)
- **Types:** Use TypeScript type hints and interfaces throughout
- **Tests:** Maintain >80% coverage for new code
- **Documentation:** Update relevant docs for user-facing changes
- **Security:** No secrets in code; scan with `npm run security-check`

## AI-Assisted Development

- Follow guidelines in [AI_USAGE.md](AI_USAGE.md)
- Disclose AI tool usage in PR descriptions
- Ensure AI-generated code is reviewed and tested

## PR Requirements Checklist

- [ ] Tests pass locally (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated for user-facing changes
- [ ] CHANGELOG.md updated (for releases)
- [ ] AI usage disclosed (if applicable)
- [ ] Approved by required CODEOWNERS
- [ ] No merge conflicts with target branch