# AI-Assisted Development Guidelines

## Principles

- **Transparency:** Disclose AI-generated code in PR descriptions
- **Review:** All AI output must be human-reviewed and tested
- **Security:** Never share secrets or sensitive data with AI tools
- **Quality:** AI code must meet same standards as human code
- **Attribution:** Credit AI tools used (e.g., "Generated with GitHub Copilot")

## Workflow

1. **Generate:** Use AI for boilerplate, tests, documentation
2. **Review:** Check for correctness, security, style compliance
3. **Test:** Verify functionality and edge cases
4. **Refactor:** Improve clarity and maintainability
5. **Document:** Note AI usage in commit messages/PR descriptions

## Approved Tools

- GitHub Copilot (code completion)
- ChatGPT/Claude (architecture, documentation)
- Codeium (code suggestions)
- Tabnine (predictive coding)

## Prohibited Practices

- ❌ Pasting proprietary code into public AI tools
- ❌ Accepting AI suggestions without understanding them
- ❌ Using AI to bypass required code review
- ❌ Committing AI-generated secrets or credentials
- ❌ Using AI for critical security decisions without expert review

## Repository Improvement Prompts

Use the prompts from Section 3.3 of the Refinement Guide for systematic improvements.

## AI Context Sharing

Always provide context using the template from Section 3.1:
- Repository purpose and structure
- Current languages and dependencies
- Specific improvement goals
- Files that need modification