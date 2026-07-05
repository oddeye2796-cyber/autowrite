# UI Component Generation Skill

## Metadata
- **Name**: UI Component Generation Skill
- **Entry Point**: `/start`
- **Description**: Takes a Figma URL and generates scaffold code for a React component using Tailwind CSS and Zustand. Implements real Figma API call with `FIGMA_TOKEN`.

## Workflow
1. Validate `figmaUrl` input.
2. Extract file key from URL.
3. Call Figma API `https://api.figma.com/v1/files/{fileKey}` with Authorization header.
4. Process response (currently placeholder) and generate component code.
5. Return JSON `{ success: true, output: "<code>..." }`.

## Permissions
- Network call to `api.figma.com` (requires `FIGMA_TOKEN`).
- Reads local config files if needed.
