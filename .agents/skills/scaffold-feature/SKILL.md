---
name: scaffold-feature
description: Generates boilerplate files for a new feature following project conventions
trigger: User starts a new feature, says "scaffold", "bootstrap", or "create feature"
auto: false
argument-hint: "<feature-name> [description]"
---

# Scaffold Feature

## Triggers

### Manual
- `/scaffold-feature [feature-name]`
- "scaffold [feature]", "bootstrap [feature]"
- "create feature [name]", "new feature [name]"
- "generate boilerplate for [feature]"

---

Reduces cold-start friction by generating the standard files a new feature needs.

## Steps

1. **Gather info**:
   - Feature name (kebab-case)
   - Brief description
   - Which layers? (model, controller/handler, view/component, service, test)

2. **Detect project patterns**:
   - Scan existing features for file structure patterns
   - Identify naming conventions, directory layout, test file locations
   - Check KB for documented conventions

3. **Generate files** following detected patterns:

   For each layer requested:
   - Create source file with standard boilerplate (imports, class/function skeleton)
   - Create corresponding test file with describe/it blocks
   - Add translations if i18n is used

4. **Create KB entry** if the feature introduces a new subsystem:
   - `docs/kb/features/{feature-name}.md` with Context and Overview sections

5. **Create plan** if the feature will span 3+ files:
   - Offer to run `create-plan` with the generated files as starting points

6. **Report** what was created:
   ```
   ## Scaffolded: [feature-name]

   Created:
   - app/[layer]/[feature].[ext]
   - test/[layer]/[feature]_test.[ext]
   - docs/kb/features/[feature].md

   Next: implement the logic in [main file]
   ```

## Rules
- Never guess structure — detect from existing code
- If patterns are unclear, ask before generating
- Generated code should compile/parse without errors
- Include only skeleton/boilerplate, not implementation
