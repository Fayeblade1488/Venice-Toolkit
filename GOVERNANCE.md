# Project Governance

## Maintainers

**Current Maintainers:**
- **Lead Maintainer:** @Fayeblade1488 - Final decisions, releases
- **Core Maintainers:** [Add additional maintainers as needed]
- **Emeritus Maintainers:** [List former maintainers when applicable]

## Decision Making Process

### Minor Changes
- Bug fixes, documentation updates, small features
- **Requirements:** 1 maintainer approval + passing CI
- **Timeline:** Can be merged immediately after approval

### Major Changes
- New features, API changes, architectural decisions
- **Requirements:** 2 maintainer approvals + 48-hour comment period
- **Process:** RFC document for complex changes

### Breaking Changes
- API modifications, dependency upgrades, major refactoring
- **Requirements:** RFC + consensus among all maintainers
- **Process:** Public discussion period, migration guide required

## Release Process

1. **Version Bump:** Follow [Semantic Versioning](https://semver.org/)
2. **Changelog:** Update [CHANGELOG.md](docs/CHANGELOG.md)
3. **Tag:** `git tag -a v{X.Y.Z} -m "Release {X.Y.Z}"`
4. **Push:** `git push origin v{X.Y.Z}`
5. **Automation:** CI builds and publishes artifacts
6. **Release Notes:** GitHub Release created automatically

## Maintainer Responsibilities

- **Code Review:** Review PRs within 5 business days
- **Issue Triage:** Weekly issue review and labeling
- **Security:** Rotate on-call for security vulnerability response
- **Planning:** Participate in quarterly roadmap discussions
- **Community:** Engage constructively with contributors

## Becoming a Maintainer

**Criteria:**
- Consistent, high-quality contributions over 6+ months
- Domain expertise in key project areas
- Positive community interaction
- Commitment to project values and code of conduct

**Process:**
- Nomination by existing maintainer
- Consensus among current maintainers
- 2-week public comment period
- Final decision by lead maintainer

## Conflict Resolution

1. **Discussion:** Open dialogue between parties
2. **Mediation:** Lead maintainer or neutral party facilitates
3. **Vote:** Maintainer consensus if needed
4. **Appeal:** Final appeal to project sponsors (if applicable)