# UI Component Generation Agent

## Metadata
- **Name**: UI Component Generation Agent
- **Entry Point**: `/start`
- **Description**: Receives a Figma URL (or UI design image) and invokes the UI Component Generation Skill to produce scaffold code for a React component using Tailwind CSS and Zustand.

## Workflow
1. Validate input payload contains `figmaUrl`.
2. Call the Skill implementation `runSkill` with the provided Figma URL.
3. Return the generated component code (or error) as JSON response.

## Permissions
- Access to `src/skills/uiComponentSkill.ts` for import.
- Network call to Figma API (requires `FIGMA_TOKEN` env variable).
