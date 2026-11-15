# NeuralDesk

## AI Workflow Intelligence Platform --- Frontend-Only Project Blueprint

**Project type:** Enterprise SaaS frontend\
**Primary goal:** Demonstrate advanced React engineering through a
realistic AI workflow-building product\
**Repository:** `neuraldesk-frontend`\
**Suggested domain:** `neuraldesk.prasantadev.com`\
**Initial delivery target:** 8 weeks\
**Status:** Project specification / implementation guide

------------------------------------------------------------------------

## 1. Product vision

NeuralDesk is a browser-based workspace where users can visually design,
configure, simulate, and monitor AI-powered workflows.

A user can assemble a workflow from reusable nodes, connect those nodes,
configure each step, run a deterministic simulation, inspect node inputs
and outputs, and review execution history.

The product should feel like a polished enterprise SaaS application. Its
main differentiator is not the number of screens: it is the quality of
the workflow editor and the correctness of its client-side execution
simulation.

### Product promise

> Build intelligent workflows. Understand every execution.

### Target users

-   Developers prototyping AI-assisted workflows.
-   Product and operations teams exploring automation concepts.
-   Technical teams that need to inspect workflow behavior and execution
    traces.

### Core product principles

1.  **Engineering depth over feature count.** Build fewer capabilities
    thoroughly.
2.  **Predictable behavior.** Workflow execution must be deterministic
    and testable.
3.  **Clear feedback.** Every asynchronous-looking action has loading,
    success, empty, and error states.
4.  **Accessible by default.** Keyboard operation, semantic markup,
    focus management, and readable contrast matter.
5.  **Honest simulation.** The interface must clearly label mocked
    execution and generated sample output.
6.  **Maintainability.** Features own their UI, types, hooks, schemas,
    and domain logic where practical.

------------------------------------------------------------------------

## 2. Scope and important boundaries

NeuralDesk is a **frontend-only portfolio project**. It does not provide
a real multi-user backend or production AI execution service.

### Included

-   Mock authentication and protected-route demonstrations.
-   Local workspace and workflow data.
-   Workflow graph editing and validation.
-   A browser-side deterministic workflow simulation engine.
-   Mock API requests using Mock Service Worker (MSW).
-   Local persistence for drafts and preferences.
-   Sample AI agent and prompt configuration screens.
-   Execution logs, analytics, and test coverage.

### Not included in the frontend-only release

-   Real user authentication or authorization enforcement.
-   Secure server-side storage of provider credentials.
-   Real execution of arbitrary workflows on a server.
-   Real OpenAI or other model-provider calls by default.
-   Real billing, payments, or multi-tenant data isolation.
-   Claims of production security for client-only role checks.

**Security rule:** Never put provider API keys, private credentials, or
secrets in browser code, `.env` variables exposed to Vite, source maps,
or committed files. Mock integrations should use clearly fictional
connection states and sample data.

### Simulation disclosure

Use labels such as **Demo mode**, **Simulated execution**, or **Sample
AI output** wherever appropriate. Do not imply that a workflow was
executed by a real AI provider.

------------------------------------------------------------------------

## 3. Primary user journeys

### Journey A --- Explore the workspace

1.  Open the application.
2.  Sign in using a clearly documented demo account or enter demo mode.
3.  View the dashboard and recent workflows.
4.  Navigate to workflows, agents, prompts, executions, integrations,
    analytics, and settings.

### Journey B --- Create and edit a workflow

1.  Open the workflow list.
2.  Create a workflow from a blank canvas or sample template.
3.  Add nodes from a node palette.
4.  Connect compatible node handles.
5.  Select a node and edit its configuration.
6.  Validate the graph and show actionable validation messages.
7.  Save the draft locally.
8.  Reload the page and restore the saved draft.

### Journey C --- Simulate a workflow

1.  Open a valid workflow.
2.  Provide sample trigger input.
3.  Run the workflow.
4.  Display node-by-node execution states.
5.  Pass each node's output to the next node.
6.  Support conditional branches.
7.  Simulate configured failures and retry behavior.
8.  Inspect node input, output, duration, and logs.
9.  Review the completed run in execution history.

### Journey D --- Configure an AI agent and prompt

1.  Create or open an agent.
2.  Edit its name, description, system prompt, and model settings.
3.  Validate configuration.
4.  Test with sample input.
5.  Display a clearly labeled sample response.
6.  Save prompt versions and compare versions.

------------------------------------------------------------------------

## 4. Product modules

### 4.1 Workspace dashboard

**Purpose:** Give users a useful overview of their workspace.

Features: - KPI cards: workflows, executions, success rate, and
estimated token usage. - Execution activity chart with date filters. -
Recent workflows and recent executions. - Quick actions to create a
workflow or agent. - Empty state for a new workspace. - Loading and
error states.

### 4.2 Workflow management

Features: - Workflow list with search, filters, sorting, and
pagination. - Create, duplicate, rename, archive, and delete actions. -
Status, last updated time, and last execution status. - Template
gallery. - Workflow details and metadata.

### 4.3 Visual workflow builder

**This is the flagship feature.**

Features: - React Flow canvas. - Drag nodes from a palette onto the
canvas. - Custom node types and connection handles. - Edge creation and
connection validation. - Node configuration side panel. - Zoom, pan, fit
view, and minimap. - Selection and multi-selection where appropriate. -
Delete, duplicate, and keyboard shortcuts. - Undo/redo. - Save and
restore graph state. - Unsaved-changes indicator. - Workflow validation
before simulation. - Accessible alternative controls for important
canvas actions.

Initial node types: - Trigger - AI prompt - Condition - Text transform -
HTTP request (mocked) - Output

### 4.4 AI agent studio

Features: - Agent list and agent details. - Agent name, description, and
system prompt. - Model selector using mock provider/model metadata. -
Temperature and maximum-token controls. - Tool configuration
interface. - Test playground with sample inputs and outputs. -
Configuration validation. - Clearly labeled demo responses.

### 4.5 Prompt playground

Features: - Prompt editor with variable placeholders. - Variable
declaration and sample values. - Prompt templates. - Input and output
preview. - JSON output preview and validation. - Version history and
comparison. - Copy and reset actions. - Sample test cases.

### 4.6 Execution monitor

Features: - Execution history table. - Status filters and date
filters. - Execution detail view. - Node-by-node timeline. - Per-node
input and output inspection. - Logs, duration, and simulated error
details. - Retry and replay simulation. - Clear distinction between
failed, cancelled, running, and completed states.

### 4.7 Integrations hub

Features: - Integration catalog with categories. - Mock connection and
disconnection states. - Configuration forms for demo integrations. -
Webhook configuration UI. - Test-connection simulation. - Credential
fields must use fictional placeholders and must never persist real
secrets.

### 4.8 Analytics

Features: - Execution volume over time. - Success and failure rates. -
Average simulated duration. - Estimated token usage and estimated
cost. - Workflow-level breakdown. - Date range and workflow filters. -
Export of demo analytics data where useful.

All metrics must be derived from the app's mock execution records. Label
estimated values clearly.

### 4.9 Workspace settings

Features: - Profile settings. - Workspace preferences. - Theme
preference. - Notification preferences. - Demo team members and role
presentation. - UI permission demonstrations.

Role-based UI visibility is a frontend demonstration only, not a
security boundary.

------------------------------------------------------------------------

## 5. Recommended technology stack

Use stable, compatible releases and commit the package lockfile.

  -----------------------------------------------------------------------
  Concern                 Recommended technology  Responsibility
  ----------------------- ----------------------- -----------------------
  UI framework            React                   Component-based
                                                  interface

  Language                TypeScript strict mode  Type safety

  Build tool              Vite                    Development and
                                                  production builds

  Styling                 Tailwind CSS            Utility styling and
                                                  design tokens

  UI primitives           shadcn/ui + Radix UI    Accessible reusable
                                                  primitives

  Workflow canvas         React Flow              Node and edge editor
                          (`@xyflow/react`)       

  Routing                 React Router            Application navigation

  Server-like state       TanStack Query          Queries, mutations,
                                                  caching

  Client state            Zustand                 Editor and transient UI
                                                  state

  Forms                   React Hook Form         Form state

  Validation              Zod                     Runtime schemas and
                                                  validation

  Tables                  TanStack Table          Sorting, filtering,
                                                  pagination

  Charts                  Recharts                Analytics
                                                  visualizations

  Icons                   Lucide                  Consistent iconography

  Animation               Motion, used            Subtle transitions
                          selectively             

  Mock network            MSW                     Realistic API behavior

  Local persistence       IndexedDB via Dexie     Workflow drafts and
                                                  local records

  Unit tests              Vitest                  Unit and module tests

  Component tests         React Testing Library   User-facing component
                                                  behavior

  E2E tests               Playwright              Critical end-to-end
                                                  journeys

  Component documentation Storybook               Component states and
                                                  documentation

  Quality                 ESLint + Prettier       Static checks and
                                                  formatting

  Git hooks               Husky + lint-staged     Pre-commit checks

  CI                      GitHub Actions          Automated validation

  Hosting                 Vercel                  Static frontend
                                                  deployment
  -----------------------------------------------------------------------

Do not add every dependency on day one. Install libraries when their
corresponding milestone begins.

------------------------------------------------------------------------

## 6. Architecture and folder structure

Use feature-oriented organization. Keep domain logic out of
presentational components.

``` text
neuraldesk-frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── router/
│   │   ├── layouts/
│   │   └── config/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── workflows/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── canvas/
│   │   │   ├── nodes/
│   │   │   ├── hooks/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── agents/
│   │   ├── prompts/
│   │   ├── executions/
│   │   ├── integrations/
│   │   ├── analytics/
│   │   └── settings/
│   ├── components/
│   │   ├── ui/
│   │   ├── shared/
│   │   └── forms/
│   ├── hooks/
│   ├── lib/
│   ├── mocks/
│   │   ├── browser.ts
│   │   ├── handlers/
│   │   └── data/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   ├── styles/
│   └── main.tsx
├── .github/
│   └── workflows/
├── docs/
│   ├── architecture.md
│   ├── decisions/
│   └── testing.md
├── .env.example
├── README.md
├── package.json
└── tsconfig.json
```

### Architecture rules

-   Feature modules own feature-specific components and domain logic.
-   Shared components must be genuinely reusable; avoid premature
    abstraction.
-   Keep API access in service/query modules, not inside visual
    components.
-   Keep Zod schemas near the feature that owns the data.
-   Keep workflow execution logic framework-independent where possible.
-   Keep Zustand stores focused; do not duplicate TanStack Query server
    state.
-   Keep persisted workflow data serializable and versioned.
-   Use explicit types for API responses, domain models, and UI view
    models.

------------------------------------------------------------------------

## 7. Workflow domain model

Start with a serializable workflow representation. Adapt it as the
editor and execution engine become more capable.

``` ts
type WorkflowStatus = "draft" | "active" | "archived";

type NodeKind =
  | "trigger"
  | "ai-prompt"
  | "condition"
  | "text-transform"
  | "http-request"
  | "output";

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

interface WorkflowNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
}

type NodeExecutionStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "skipped";

interface NodeExecutionRecord {
  nodeId: string;
  status: NodeExecutionStatus;
  input?: unknown;
  output?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: "queued" | "running" | "success" | "failed" | "cancelled";
  input: unknown;
  nodeRuns: NodeExecutionRecord[];
  startedAt: string;
  completedAt?: string;
}
```

Use more specific discriminated unions for each node's configuration
once node implementations are added. Avoid leaving
`Record<string, unknown>` as the permanent type for all node data.

------------------------------------------------------------------------

## 8. Workflow execution engine design

Keep the engine independent from React and the canvas.

Suggested responsibilities:

1.  Validate that node IDs are unique.
2.  Validate that every edge references existing nodes.
3.  Validate node-specific required configuration.
4.  Detect cycles unless a deliberate loop feature is implemented.
5.  Determine executable order.
6.  Resolve inputs from trigger data and upstream outputs.
7.  Execute a handler registered for each node type.
8.  Evaluate conditional branches.
9.  Record status, timestamps, outputs, and errors.
10. Stop or continue according to explicit failure policy.

Suggested interface:

``` ts
interface NodeExecutionContext {
  input: unknown;
  config: unknown;
  previousOutputs: Record<string, unknown>;
}

interface NodeHandler {
  execute(
    context: NodeExecutionContext
  ): Promise<unknown>;
}

interface ExecutionEngine {
  run(
    workflow: WorkflowDefinition,
    input: unknown
  ): Promise<WorkflowExecution>;
}
```

Implementation notes:

-   Use deterministic mock handlers for AI, HTTP, and transform nodes.
-   Make delays and failure scenarios controllable in tests.
-   Use an execution event/callback interface to update the UI as each
    node changes state.
-   Keep branch semantics explicit.
-   Test cycles, disconnected nodes, missing configuration, invalid
    edges, and failed handlers.
-   Do not use arbitrary `eval` or execute user-provided JavaScript.

------------------------------------------------------------------------

## 9. Design system and visual direction

### Overall direction

A premium enterprise SaaS interface with a calm, restrained visual
language.

-   Neutral light theme as the default.
-   Deep navy or charcoal for the workflow canvas.
-   One primary accent color, used consistently.
-   Clear typography hierarchy.
-   Compact but readable data-dense layouts.
-   Consistent spacing, radii, borders, and shadows.
-   Motion only when it explains state or interaction.

### Main application shell

-   Collapsible left navigation.
-   Workspace switcher.
-   Top bar with breadcrumbs and global actions.
-   Main content area with consistent page widths.
-   Toast notifications.
-   Command/search interface as a later enhancement.

### Design-system foundations

Define tokens for: - Color and semantic status. - Typography and line
height. - Spacing. - Border radius. - Elevation. - Focus rings. -
Breakpoints. - Motion duration and easing.

Build and document reusable: - Button, input, textarea, select,
checkbox, switch. - Dialog, drawer, popover, tooltip, dropdown. - Tabs,
badge, avatar, breadcrumb. - Table, pagination, skeleton, empty state. -
Toast, alert, error panel. - Form field and validation message.

------------------------------------------------------------------------

## 10. Quality, accessibility, and production standards

### TypeScript and code quality

-   Enable `strict` in TypeScript.
-   Avoid `any`; use `unknown` and narrow it safely when necessary.
-   Keep functions small and focused.
-   Avoid deeply nested conditional rendering.
-   Avoid unnecessary global state.
-   Use consistent naming and file conventions.
-   Keep dependencies current and lock versions through the package
    manager lockfile.

### Accessibility

-   Use semantic HTML.
-   Ensure all important controls work with a keyboard.
-   Provide visible focus indicators.
-   Associate labels and validation messages with form fields.
-   Use accessible dialog focus management.
-   Do not rely on color alone to communicate status.
-   Provide accessible controls or alternatives for canvas operations.
-   Check contrast and reduced-motion behavior.

### Performance

-   Lazy-load route-level features.
-   Split heavy workflow-editor code where appropriate.
-   Avoid unnecessary re-renders in large node graphs.
-   Memoize only when profiling or clear render boundaries justify it.
-   Virtualize large tables or lists when needed.
-   Optimize images and fonts.
-   Keep bundle size visible in CI or release checks.

### Reliability and user feedback

Every major screen should handle: - Initial loading. - Empty data. -
Successful data. - Recoverable errors. - Invalid user input. -
Destructive action confirmation. - Unsaved changes. -
Network/mock-service failure.

### Security awareness

-   Treat all browser input as untrusted.
-   Avoid unsafe HTML injection.
-   Never store real provider secrets in local storage or IndexedDB.
-   Do not present frontend role checks as real authorization.
-   Keep demo data clearly separate from real credentials or services.

------------------------------------------------------------------------

## 11. Testing strategy

### Unit tests

Test: - Workflow graph validation. - Cycle detection and execution
ordering. - Condition evaluation. - Node handler input/output
transformations. - Prompt variable interpolation. - Formatting and
analytics calculations.

### Component and integration tests

Test: - Forms and validation. - Node configuration panel. - Workflow
list filters. - Save and restore interactions. - Loading, empty, and
error states. - Keyboard-accessible controls.

### End-to-end tests

Critical Playwright journeys: 1. Enter demo workspace. 2. Create a
workflow. 3. Add and connect nodes. 4. Configure nodes. 5. Save and
reload the workflow. 6. Run a valid simulation. 7. Inspect execution
results. 8. Trigger and inspect a simulated failure. 9. Verify that
analytics reflect execution records.

### Definition of done

A feature is not complete until: - Acceptance criteria pass. - Type
checking and linting pass. - Relevant tests pass. - Loading, empty, and
error states are handled. - Keyboard and responsive behavior are
checked. - No secrets or misleading real-service claims are
introduced. - Documentation is updated where needed.

------------------------------------------------------------------------

## 12. Eight-week implementation roadmap

### Week 1 --- Foundation

-   Create Vite React TypeScript application.
-   Configure strict TypeScript.
-   Add Tailwind CSS and shadcn/ui.
-   Configure ESLint and Prettier.
-   Add routing and application providers.
-   Establish design tokens.
-   Create base application layout.
-   Add CI checks for install, lint, typecheck, and build.

**Milestone:** A clean, responsive application shell with automated
quality checks.

### Week 2 --- Dashboard and shared UI

-   Build sidebar, header, breadcrumbs, and workspace switcher.
-   Create reusable form and feedback components.
-   Add mock data and MSW.
-   Build dashboard KPIs and charts.
-   Add recent workflows and execution tables.
-   Implement responsive and empty states.

**Milestone:** A complete SaaS dashboard backed by mock API handlers.

### Week 3 --- Workflow editor

-   Integrate React Flow.
-   Define workflow and node types.
-   Implement node palette and custom nodes.
-   Add connection validation.
-   Add node configuration panel.
-   Implement save, restore, and unsaved-change behavior.
-   Add basic undo/redo.

**Milestone:** Users can construct, edit, validate, and persist workflow
graphs.

### Week 4 --- Simulation engine

-   Design the engine interface and node handler registry.
-   Implement graph validation and execution ordering.
-   Implement trigger, transform, condition, AI mock, HTTP mock, and
    output handlers.
-   Add execution event reporting.
-   Add success and failure states.
-   Add retry/replay simulation.
-   Write thorough unit tests.

**Milestone:** Workflows execute deterministically in the browser.

### Week 5 --- Agents and prompts

-   Build agent list and configuration screens.
-   Implement prompt editor and variable validation.
-   Add mock model settings.
-   Build prompt playground.
-   Add sample outputs and version comparison.
-   Add tests for prompt handling.

**Milestone:** A coherent AI configuration and prompt-testing
experience.

### Week 6 --- Monitoring and analytics

-   Build execution history.
-   Build execution detail and node trace views.
-   Add input/output inspection.
-   Add log filtering.
-   Derive analytics from mock execution records.
-   Add date and workflow filters.

**Milestone:** Users can understand and investigate simulated workflow
runs.

### Week 7 --- Quality engineering

-   Expand unit and integration coverage.
-   Add Playwright critical journeys.
-   Add accessibility checks.
-   Test responsive behavior and browser compatibility.
-   Profile and optimize the editor.
-   Review error handling and security boundaries.
-   Document important architecture decisions.

**Milestone:** Critical user journeys are tested and quality issues are
addressed.

### Week 8 --- Release

-   Finalize production build configuration.
-   Verify environment-variable handling.
-   Add GitHub Actions release checks.
-   Write README and architecture documentation.
-   Add screenshots and a concise product walkthrough.
-   Deploy to Vercel.
-   Configure the portfolio subdomain.
-   Perform a final production smoke test.

**Milestone:** A deployed, documented portfolio product.

------------------------------------------------------------------------

## 13. Suggested Git workflow

Use a simple professional workflow:

-   `main`: stable, deployable branch.
-   `develop`: integration branch if needed.
-   `feature/<short-name>`: focused feature branches.
-   `fix/<short-name>`: bug fixes.

Commit examples:

``` text
chore: initialize Vite and TypeScript project
feat: add responsive application shell
feat(workflows): add custom trigger node
feat(workflows): validate graph connections
feat(executions): add deterministic simulation engine
test(workflows): cover cycle detection
fix(editor): preserve node positions after reload
docs: document workflow execution architecture
```

Prefer small commits that explain one meaningful change.

------------------------------------------------------------------------

## 14. Repository documentation checklist

The final repository should contain:

-   `README.md` --- product overview, screenshots, features, setup,
    scripts, demo limitations.
-   `docs/architecture.md` --- module boundaries and data flow.
-   `docs/testing.md` --- test strategy and commands.
-   `docs/decisions/` --- important architecture decision records.
-   `.env.example` --- names and descriptions only; no secrets.
-   Screenshots or a short product demo.
-   Clear license and attribution for any third-party assets.

------------------------------------------------------------------------

## 15. Initial project setup checklist

Do these in order:

-   [ ] Create the Git repository `neuraldesk-frontend`.
-   [ ] Scaffold React + TypeScript using Vite.
-   [ ] Enable TypeScript strict mode.
-   [ ] Configure ESLint and Prettier.
-   [ ] Add Tailwind CSS and shadcn/ui.
-   [ ] Set up React Router.
-   [ ] Create the application shell.
-   [ ] Define color, typography, spacing, and radius tokens.
-   [ ] Add Vitest and React Testing Library.
-   [ ] Add a GitHub Actions workflow for lint, typecheck, tests, and
    build.
-   [ ] Add the first architecture decision record.
-   [ ] Create the first feature branch.

### Initial completion criteria

The foundation milestone is complete when a fresh clone can install
dependencies and run documented commands for development, linting, type
checking, tests, and production build; the application shell renders
responsively; and CI verifies the same checks.

------------------------------------------------------------------------

## 16. Portfolio presentation

Suggested portfolio entry:

**NeuralDesk --- AI Workflow Intelligence Platform**

Designed and developed a frontend-only enterprise SaaS application for
visually creating and monitoring AI workflows. Built an interactive
node-based editor, a deterministic client-side execution simulator,
prompt and agent configuration interfaces, and execution analytics using
React, TypeScript, and modern frontend tooling.

Be transparent that the execution engine and provider integrations are
simulated. Highlight the architecture, graph validation, state
management, accessibility, tests, and engineering decisions.

------------------------------------------------------------------------

## 17. Recommended first coding milestone

Start with **Week 1: Foundation**. Do not begin the workflow canvas
until the application shell, TypeScript standards, routing, design
tokens, testing setup, and CI checks are in place.

The first pull request should contain only: 1. Vite + React + TypeScript
setup. 2. Strict TypeScript and code-quality configuration. 3. Base
routing and application layout. 4. Initial design tokens. 5. One example
unit test. 6. CI checks for lint, typecheck, tests, and build. 7. Setup
instructions in the README.

This creates a dependable base for every feature that follows.
