# SKILL: UI Component Generation Skill

## Metadata
- **Name**: UI Component Generation Skill
- **Entry Point**: `/start`
- **Description**: Takes a Figma URL (or UI design image) and generates scaffold code for a React component using Tailwind CSS and Zustand. Currently uses placeholder logic; can be extended to call the Figma API.
- **Supported Inputs**: `figmaUrl` (string)
- **Outputs**: Generated component code as a string wrapped in JSON `{ "success": true, "output": "<code>" }`.

## Workflow
1. Validate the input contains a valid `figmaUrl`.
2. (Optional) Fetch design data from Figma API – placeholder for now.
3. Produce a basic React component skeleton with Tailwind classes and a Zustand store hook.
4. Return the generated code.

## Permissions
- No external network calls (placeholder implementation).
- Reads only local configuration files if needed.
