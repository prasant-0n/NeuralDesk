/**
 * NeuralDesk Enterprise OpenAPI 3.1.0 Specification
 * Definitive machine-readable schema for all NeuralDesk REST, SSE, and Webhook APIs.
 */

export const openApiSpec: Record<string, any> = {
  openapi: "3.1.0",
  info: {
    title: "NeuralDesk Workflow Intelligence & Autonomous Agent API",
    version: "1.0.0",
    description: `
**NeuralDesk** is an enterprise-grade visual AI workflow intelligence and autonomous agent orchestration platform.
This API provides programmatic access to workflow execution engines, real-time Server-Sent Events (SSE) telemetry streams, autonomous multi-turn agent personas, versioned prompt template compilation, and cryptographically verified webhook ingress.

### Key Architectural Standards
* **Protocol:** HTTPS, \`application/json\` charset UTF-8.
* **Real-Time Telemetry:** HTTP \`text/event-stream\` Server-Sent Events.
* **Error Envelope:** Strict RFC 7807 Problem Details for HTTP APIs.
* **Security:** Bearer JWT authentication, AES-256-GCM BYOK credential isolation, and HMAC-SHA256 webhook signatures.
* **Deterministic Guarantees:** Client and server-side Kahn's Algorithm (DAG cycle protection) and deterministic simulation mode.
    `,
    contact: {
      name: "NeuralDesk Engineering Team",
      url: "https://github.com/prasant-0n/NeuralDesk",
      email: "engineering@neuraldesk.dev",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local Development Server",
    },
    {
      url: "https://api.neuraldesk.dev",
      description: "Production Cloud Cluster (Edge Nginx / Hono)",
    },
  ],
  tags: [
    { name: "System & Health", description: "Liveness, readiness, and internal cluster diagnostics" },
    { name: "Workspaces & Multi-Tenancy", description: "Tenant boundaries, members, and BYOK credential vault" },
    { name: "Workflows & DAG Topology", description: "Visual canvas persistence, version snapshots, and graph validation" },
    { name: "Execution Engine", description: "Topological DAG execution, re-run replay, cancellation, and statistics" },
    { name: "Real-Time Telemetry (SSE)", description: "Low-latency streaming of step waterfalls and execution states" },
    { name: "Human-in-the-Loop Governance", description: "Approval gates, manual intervention, and audit signoffs" },
    { name: "AI Agent Studio", description: "Autonomous personas, tool calling, and multi-turn conversational inference" },
    { name: "Prompt Template Library", description: "Mustache variable compilation, cost estimators, and test runner" },
    { name: "Webhook Gateway", description: "Cryptographically verified HMAC-SHA256 ingress for external triggers" },
  ],
  paths: {
    "/api/v1/health": {
      get: {
        tags: ["System & Health"],
        summary: "Comprehensive Readiness & Diagnostics Probe",
        description: "Returns detailed system health, database pool ping, active SSE connections, memory utilization, and uptime.",
        responses: {
          "200": {
            description: "System diagnostics successfully retrieved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthCheckResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/health/live": {
      get: {
        tags: ["System & Health"],
        summary: "Lightweight Liveness Probe",
        description: "High-frequency probe for Kubernetes, Docker Compose, or AWS ALB liveness checks without internal detail leak.",
        responses: {
          "200": {
            description: "Process is alive",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    uptimeSeconds: { type: "integer", example: 3600 },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/workspaces": {
      get: {
        tags: ["Workspaces & Multi-Tenancy"],
        summary: "List Accessible Workspaces",
        description: "Retrieves all workspaces accessible to the authenticated tenant.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Workspaces array",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Workspace" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Workspaces & Multi-Tenancy"],
        summary: "Create New Workspace",
        description: "Initializes a new isolated tenant workspace with optional encrypted BYOK credentials.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateWorkspaceRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Workspace created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Workspace" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/400BadRequest" },
        },
      },
    },
    "/api/v1/workspaces/{id}": {
      get: {
        tags: ["Workspaces & Multi-Tenancy"],
        summary: "Get Workspace Details",
        description: "Fetches workspace metadata by ID.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkspaceIdParam" }],
        responses: {
          "200": {
            description: "Workspace details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Workspace" } },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/404NotFound" },
        },
      },
      patch: {
        tags: ["Workspaces & Multi-Tenancy"],
        summary: "Update Workspace",
        description: "Modifies workspace name, slug, or updates encrypted API credentials.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkspaceIdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateWorkspaceRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Workspace updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Workspace" } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Workspaces & Multi-Tenancy"],
        summary: "Delete Workspace",
        description: "Deletes a workspace and cascades soft-deletion to contained workflows and credentials.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkspaceIdParam" }],
        responses: {
          "200": {
            description: "Workspace deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/workspaces/{id}/members": {
      get: {
        tags: ["Workspaces & Multi-Tenancy"],
        summary: "List Workspace Members",
        description: "Retrieves team members and their associated RBAC roles.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkspaceIdParam" }],
        responses: {
          "200": {
            description: "Array of workspace members",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/WorkspaceMember" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Workspaces & Multi-Tenancy"],
        summary: "Add Team Member",
        description: "Invites or adds a user to the workspace with specified RBAC role (owner, admin, member, viewer).",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkspaceIdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: { type: "string", format: "uuid" },
                  role: { type: "string", enum: ["owner", "admin", "member", "viewer"], default: "member" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Member added successfully" },
        },
      },
    },
    "/api/v1/workflows": {
      get: {
        tags: ["Workflows & DAG Topology"],
        summary: "List Workflows",
        description: "Returns paginated list of workflows with optional category and status filtering.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["draft", "published", "archived"] } },
        ],
        responses: {
          "200": {
            description: "Paginated workflow list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedWorkflowResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Workflows & DAG Topology"],
        summary: "Create New Workflow",
        description: "Initializes a new workflow record with draft status in the target workspace.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateWorkflowRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Workflow created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Workflow" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/workflows/{id}": {
      get: {
        tags: ["Workflows & DAG Topology"],
        summary: "Get Workflow Canvas Definition",
        description: "Retrieves workflow metadata, active published version snapshot, and historical version list.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkflowIdParam" }],
        responses: {
          "200": {
            description: "Workflow graph details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      allOf: [
                        { $ref: "#/components/schemas/Workflow" },
                        {
                          type: "object",
                          properties: {
                            version: { $ref: "#/components/schemas/WorkflowVersion" },
                            versions: { type: "array", items: { $ref: "#/components/schemas/WorkflowVersion" } },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/404NotFound" },
        },
      },
      patch: {
        tags: ["Workflows & DAG Topology"],
        summary: "Update Workflow Metadata",
        description: "Updates workflow name, description, category, or status.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkflowIdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateWorkflowRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Workflow updated" },
        },
      },
      delete: {
        tags: ["Workflows & DAG Topology"],
        summary: "Delete Workflow",
        description: "Soft-deletes the workflow canvas and its versions.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkflowIdParam" }],
        responses: {
          "200": { description: "Workflow deleted" },
        },
      },
    },
    "/api/v1/workflows/{id}/versions": {
      get: {
        tags: ["Workflows & DAG Topology"],
        summary: "List Version Snapshots",
        description: "Retrieves immutable version history for a workflow.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkflowIdParam" }],
        responses: {
          "200": {
            description: "Versions array",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/WorkflowVersion" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Workflows & DAG Topology"],
        summary: "Snapshot New Workflow Version",
        description: "Creates an immutable snapshot of the canvas nodes and edges, auto-incrementing the version number.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkflowIdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateVersionRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Version created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/WorkflowVersion" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/workflows/{id}/versions/{verId}/publish": {
      post: {
        tags: ["Workflows & DAG Topology"],
        summary: "Publish Workflow Version",
        description: "Promotes a version snapshot to active production status. Webhook triggers route to this version.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/WorkflowIdParam" },
          { name: "verId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Version successfully published" },
        },
      },
    },
    "/api/v1/workflows/{id}/validate": {
      post: {
        tags: ["Workflows & DAG Topology"],
        summary: "Validate DAG Topology & Invariants",
        description: "Validates graph acyclicity using Kahn's Algorithm, port compatibility, and required configuration properties without executing.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkflowIdParam" }],
        responses: {
          "200": {
            description: "Validation results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: { type: "boolean", example: true },
                    nodeCount: { type: "integer", example: 6 },
                    edgeCount: { type: "integer", example: 5 },
                    executionOrder: { type: "array", items: { type: "string" } },
                    warnings: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/workflows/{id}/execute": {
      post: {
        tags: ["Execution Engine"],
        summary: "Trigger DAG Workflow Execution",
        description: "Dispatches workflow execution across the topological orchestrator. Returns 202 Accepted with a dedicated SSE streaming URL for real-time progress.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/WorkflowIdParam" }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TriggerExecutionRequest" },
            },
          },
        },
        responses: {
          "202": {
            description: "Execution queued and started",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TriggerExecutionResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/400BadRequest" },
        },
      },
    },
    "/api/v1/executions": {
      get: {
        tags: ["Execution Engine"],
        summary: "List Workflow Executions",
        description: "Retrieves execution history with status filters, duration, and token usage.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 15 } },
          { name: "status", in: "query", schema: { type: "string", enum: ["running", "completed", "failed", "cancelled", "waiting_for_approval"] } },
          { name: "workflow_id", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "List of executions",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedExecutionsResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/executions/{id}": {
      get: {
        tags: ["Execution Engine"],
        summary: "Get Execution Details & Telemetry",
        description: "Retrieves top-level execution metrics, token ledger, USD cost estimation, and overall completion state.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ExecutionIdParam" }],
        responses: {
          "200": {
            description: "Execution record",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Execution" } },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/404NotFound" },
        },
      },
    },
    "/api/v1/executions/{id}/runs": {
      get: {
        tags: ["Execution Engine"],
        summary: "Get Step Run Waterfall & Node Traces",
        description: "Returns step-by-step forensic execution traces, exact node input/output JSON payloads, microsecond latencies, and token consumption.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ExecutionIdParam" }],
        responses: {
          "200": {
            description: "Array of node step runs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/NodeRun" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/executions/{id}/stream": {
      get: {
        tags: ["Real-Time Telemetry (SSE)"],
        summary: "Subscribe to Live Execution Stream (SSE)",
        description: "Establishes a persistent `text/event-stream` connection streaming step-by-step state changes, token deltas, and glowing halos in real time.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ExecutionIdParam" }],
        responses: {
          "200": {
            description: "Server-Sent Events event stream",
            content: {
              "text/event-stream": {
                schema: {
                  type: "string",
                  example: "event: node:running\\ndata: {\"nodeId\":\"llm_1\",\"status\":\"running\"}\\n\\n",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/executions/{id}/rerun": {
      post: {
        tags: ["Execution Engine"],
        summary: "Re-run Execution Replay",
        description: "Re-executes an existing workflow run with identical or overridden input payloads for deterministic debugging.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ExecutionIdParam" }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  inputs: { type: "object", description: "Optional overridden input parameters" },
                },
              },
            },
          },
        },
        responses: {
          "202": {
            description: "Re-run dispatched successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TriggerExecutionResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/executions/{id}/cancel": {
      post: {
        tags: ["Execution Engine"],
        summary: "Cancel In-Flight Execution",
        description: "Aborts an active DAG execution and terminates downstream queued node dispatches.",
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ExecutionIdParam" }],
        responses: {
          "200": {
            description: "Execution aborted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean", example: true }, message: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/executions/stats": {
      get: {
        tags: ["Execution Engine"],
        summary: "Aggregated Operations Telemetry & SLA Percentiles",
        description: "Computes real-time P50, P90, P95, P99 latency percentiles, throughput over time, token volumes, model breakdown, and cluster health.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "timeframe", in: "query", schema: { type: "string", enum: ["1h", "24h", "7d", "30d", "all"], default: "24h" } },
        ],
        responses: {
          "200": {
            description: "Operational metrics payload",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DashboardTelemetryResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/approvals": {
      get: {
        tags: ["Human-in-the-Loop Governance"],
        summary: "List Pending Human Gate Approvals",
        description: "Retrieves paused workflow executions requiring manual human signoff or rejection.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Array of pending approvals",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/ApprovalRecord" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/approvals/{id}/decide": {
      post: {
        tags: ["Human-in-the-Loop Governance"],
        summary: "Submit Approval Decision",
        description: "Submits approval or rejection for a paused Human Gate node. Resumes workflow execution along the approved or rejected branch.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["decision"],
                properties: {
                  decision: { type: "string", enum: ["approved", "rejected"] },
                  feedback: { type: "string", example: "Approved for deployment by Lead SRE" },
                  decidedBy: { type: "string", example: "user_sre_lead" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Decision applied and workflow resumed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/agents/chat": {
      post: {
        tags: ["AI Agent Studio"],
        summary: "Multi-Turn Agent Chat & Tool Calling",
        description: "Dispatches interactive prompts to an autonomous agent persona with Gemini streaming inference, automatic tool execution, and token calculation.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AgentChatRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Agent conversational response with tool calling trace",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AgentChatResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/agents": {
      get: {
        tags: ["AI Agent Studio"],
        summary: "List Agent Personas",
        description: "Retrieves configured autonomous agent personas and default model configurations.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Array of agent personas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { type: "array", items: { $ref: "#/components/schemas/AgentPersona" } } },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["AI Agent Studio"],
        summary: "Create Agent Persona",
        description: "Registers a new autonomous persona with system instructions and tools.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAgentPersonaRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Agent persona created" },
        },
      },
    },
    "/api/v1/prompts/test": {
      post: {
        tags: ["Prompt Template Library"],
        summary: "Test Run Prompt Template & Token Estimation",
        description: "Compiles dynamic Mustache parameters, projects token usage and micro-cent cost, and runs test AI inference.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PromptTestRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Compiled prompt preview, token metrics, and test inference output",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PromptTestResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/prompts": {
      get: {
        tags: ["Prompt Template Library"],
        summary: "List Reusable Prompt Templates",
        description: "Retrieves enterprise prompt templates with category and variable filtering.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "category", in: "query", schema: { type: "string", enum: ["support", "summarization", "sales", "security", "extraction"] } },
        ],
        responses: {
          "200": {
            description: "List of prompt templates",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { type: "array", items: { $ref: "#/components/schemas/PromptTemplate" } } },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Prompt Template Library"],
        summary: "Create Prompt Template",
        description: "Stores a reusable Mustache-formatted prompt template in the enterprise library.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePromptRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Prompt template created" },
        },
      },
    },
    "/api/v1/webhooks/ingress/{webhookPath}": {
      post: {
        tags: ["Webhook Gateway"],
        summary: "Ingress Inbound Webhook Event",
        description: "External trigger endpoint. Validates payload authenticity using HMAC-SHA256 signature verification in `X-NeuralDesk-Signature` header and triggers associated workflow asynchronously.",
        parameters: [
          { name: "webhookPath", in: "path", required: true, schema: { type: "string" }, description: "Unique path token for the webhook configuration" },
          { name: "X-NeuralDesk-Signature", in: "header", required: false, schema: { type: "string" }, description: "HMAC-SHA256 hex signature computed with shared secret: `sha256=...`" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true, description: "Raw event payload passed to workflow ingress trigger node" },
            },
          },
        },
        responses: {
          "202": {
            description: "Webhook accepted and workflow execution dispatched",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    executionId: { type: "string", example: "exec_a1b2c3d4" },
                    workflowId: { type: "string", example: "wf_9a8b7c6d" },
                    status: { type: "string", example: "running" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/401Unauthorized" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JSON Web Token (JWT) issued during workspace authentication.",
      },
      WebhookHmac: {
        type: "apiKey",
        in: "header",
        name: "X-NeuralDesk-Signature",
        description: "HMAC-SHA256 hex digest prefixed with `sha256=` computed over the raw request payload using your webhook secret.",
      },
    },
    parameters: {
      WorkspaceIdParam: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Unique workspace UUID or identifier",
      },
      WorkflowIdParam: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Unique workflow identifier (e.g., `wf_customer_support`)",
      },
      ExecutionIdParam: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Unique execution identifier (e.g., `exec_39a8bcde`)",
      },
    },
    responses: {
      "400BadRequest": {
        description: "Bad Request — Input payload validation failed (RFC 7807)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
        },
      },
      "401Unauthorized": {
        description: "Unauthorized — Missing or invalid authentication token / HMAC signature",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
        },
      },
      "404NotFound": {
        description: "Resource Not Found — The requested entity does not exist",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
        },
      },
    },
    schemas: {
      ProblemDetails: {
        type: "object",
        required: ["type", "title", "status", "detail"],
        properties: {
          type: { type: "string", example: "about:blank" },
          title: { type: "string", example: "Validation Error" },
          status: { type: "integer", example: 400 },
          detail: { type: "string", example: "Invalid workflow graph configuration" },
          instance: { type: "string", example: "/api/v1/workflows/wf_123/execute" },
          code: { type: "string", example: "VALIDATION_FAILED" },
          traceId: { type: "string", example: "req_f48d9a2b" },
          timestamp: { type: "string", format: "date-time" },
          errors: { type: "array", items: { type: "object" } },
        },
      },
      HealthCheckResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["healthy", "degraded"], example: "healthy" },
          server: { type: "string", example: "ok" },
          version: { type: "string", example: "1.0.0" },
          environment: { type: "string", example: "production" },
          timestamp: { type: "string", format: "date-time" },
          uptimeSeconds: { type: "integer", example: 14400 },
          database: {
            type: "object",
            properties: {
              status: { type: "string", example: "connected" },
              latencyMs: { type: "integer", example: 2 },
            },
          },
          activeExecutions: { type: "integer", example: 0 },
          activeSubscribers: { type: "integer", example: 1 },
          memory: {
            type: "object",
            properties: {
              heapUsedMb: { type: "number", example: 42.5 },
              heapTotalMb: { type: "number", example: 68.2 },
              rssMb: { type: "number", example: 110.4 },
            },
          },
        },
      },
      Workspace: {
        type: "object",
        required: ["id", "name", "slug"],
        properties: {
          id: { type: "string", example: "ws_default_production" },
          name: { type: "string", example: "NeuralDesk Production" },
          slug: { type: "string", example: "neuraldesk-prod" },
          ownerId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateWorkspaceRequest: {
        type: "object",
        required: ["name", "slug"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 128, example: "AI Research Lab" },
          slug: { type: "string", minLength: 1, maxLength: 128, example: "ai-research-lab" },
          encryptedApiKeys: { type: "string", description: "Optional AES-256-GCM ciphertext containing BYOK credentials" },
        },
      },
      UpdateWorkspaceRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          slug: { type: "string" },
          encryptedApiKeys: { type: "string" },
        },
      },
      WorkspaceMember: {
        type: "object",
        properties: {
          id: { type: "string" },
          workspaceId: { type: "string" },
          userId: { type: "string" },
          role: { type: "string", enum: ["owner", "admin", "member", "viewer"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Workflow: {
        type: "object",
        required: ["id", "name", "workspaceId"],
        properties: {
          id: { type: "string", example: "wf_customer_support" },
          workspaceId: { type: "string", example: "ws_default_production" },
          name: { type: "string", example: "Customer Support Triage & Sentiment Escalation" },
          description: { type: "string", example: "Classifies ticket sentiment, scores urgency, routes VIPs" },
          category: { type: "string", example: "support" },
          status: { type: "string", enum: ["draft", "published", "archived"], example: "published" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      WorkflowVersion: {
        type: "object",
        required: ["id", "workflowId", "versionNumber", "definition"],
        properties: {
          id: { type: "string", example: "ver_1" },
          workflowId: { type: "string", example: "wf_customer_support" },
          versionNumber: { type: "integer", example: 1 },
          changeSummary: { type: "string", example: "Initial published baseline DAG" },
          isPublished: { type: "boolean", example: true },
          definition: {
            type: "object",
            properties: {
              nodes: { type: "array", items: { type: "object" } },
              edges: { type: "array", items: { type: "object" } },
            },
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateWorkflowRequest: {
        type: "object",
        required: ["name", "workspaceId"],
        properties: {
          name: { type: "string", example: "Enterprise CRM Lead Routing" },
          workspaceId: { type: "string", example: "ws_default_production" },
          description: { type: "string" },
          category: { type: "string", default: "general" },
        },
      },
      UpdateWorkflowRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          status: { type: "string", enum: ["draft", "published", "archived"] },
        },
      },
      CreateVersionRequest: {
        type: "object",
        required: ["definition"],
        properties: {
          changeSummary: { type: "string", example: "Added condition router for VIP leads" },
          isPublished: { type: "boolean", default: false },
          definition: {
            type: "object",
            required: ["nodes", "edges"],
            properties: {
              nodes: { type: "array", items: { type: "object" } },
              edges: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
      PaginatedWorkflowResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Workflow" } },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              total: { type: "integer", example: 3 },
              totalPages: { type: "integer", example: 1 },
            },
          },
        },
      },
      TriggerExecutionRequest: {
        type: "object",
        properties: {
          mode: { type: "string", enum: ["real", "simulation", "mock", "live"], default: "real", description: "Execution mode: `real` invokes Gemini streaming; `simulation` uses deterministic PRNG." },
          triggerSource: { type: "string", enum: ["manual", "webhook", "schedule", "api"], default: "api" },
          versionNumber: { type: "integer", description: "Target snapshot version number (defaults to published)" },
          inputs: {
            type: "object",
            example: {
              customerEmail: "cto@enterprise.com",
              subject: "Database connection timeouts in EU cluster",
              messageBody: "Urgent: payments API failing on checkout.",
            },
          },
        },
      },
      TriggerExecutionResponse: {
        type: "object",
        properties: {
          executionId: { type: "string", example: "exec_98af21d0" },
          workflowId: { type: "string", example: "wf_customer_support" },
          versionNumber: { type: "integer", example: 1 },
          mode: { type: "string", example: "real" },
          status: { type: "string", example: "running" },
          startedAt: { type: "string", format: "date-time" },
          streamUrl: { type: "string", example: "/api/v1/executions/exec_98af21d0/stream" },
        },
      },
      Execution: {
        type: "object",
        properties: {
          id: { type: "string", example: "exec_98af21d0" },
          workflowId: { type: "string", example: "wf_customer_support" },
          status: { type: "string", enum: ["running", "completed", "failed", "cancelled", "waiting_for_approval"] },
          triggerSource: { type: "string", example: "api" },
          startedAt: { type: "string", format: "date-time" },
          completedAt: { type: "string", format: "date-time" },
          durationMs: { type: "integer", example: 742 },
          promptTokens: { type: "integer", example: 280 },
          completionTokens: { type: "integer", example: 138 },
          totalTokens: { type: "integer", example: 418 },
          costUsd: { type: "number", example: 0.0002 },
        },
      },
      NodeRun: {
        type: "object",
        properties: {
          id: { type: "string", example: "run_node_gemini_sentiment" },
          executionId: { type: "string", example: "exec_98af21d0" },
          nodeId: { type: "string", example: "gemini_sentiment" },
          status: { type: "string", enum: ["pending", "running", "completed", "failed", "skipped"] },
          startedAt: { type: "string", format: "date-time" },
          completedAt: { type: "string", format: "date-time" },
          durationMs: { type: "integer", example: 382 },
          inputPayload: { type: "object" },
          outputPayload: { type: "object" },
          error: { type: "string" },
        },
      },
      PaginatedExecutionsResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Execution" } },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 15 },
              total: { type: "integer", example: 34 },
              totalPages: { type: "integer", example: 3 },
            },
          },
        },
      },
      DashboardTelemetryResponse: {
        type: "object",
        properties: {
          timeframe: { type: "string", example: "24h" },
          activeWorkflows: { type: "integer", example: 3 },
          totalExecutions: { type: "integer", example: 34 },
          successRate: { type: "number", example: 94.1 },
          tokensConsumed: { type: "integer", example: 34350 },
          totalSpendUsd: { type: "number", example: 0.0051 },
          slaMetrics: {
            type: "object",
            properties: {
              p50LatencyMs: { type: "integer", example: 524 },
              p90LatencyMs: { type: "integer", example: 703 },
              p95LatencyMs: { type: "integer", example: 739 },
              p99LatencyMs: { type: "integer", example: 746 },
              minLatencyMs: { type: "integer", example: 280 },
              maxLatencyMs: { type: "integer", example: 746 },
              avgLatencyMs: { type: "integer", example: 518 },
            },
          },
          throughputSeries: { type: "array", items: { type: "object" } },
          modelMetrics: { type: "array", items: { type: "object" } },
          systemHealth: {
            type: "object",
            properties: {
              engineStatus: { type: "string", example: "healthy" },
              databasePingMs: { type: "integer", example: 1 },
              activeConcurrency: { type: "integer", example: 0 },
              maxConcurrency: { type: "integer", example: 10 },
            },
          },
        },
      },
      ApprovalRecord: {
        type: "object",
        properties: {
          id: { type: "string", example: "appr_7c8d9e" },
          executionId: { type: "string", example: "exec_98af21d0" },
          nodeId: { type: "string", example: "human_gate_sre" },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          promptMessage: { type: "string", example: "Confirm high-value refund authorization of $4,500.00" },
          contextData: { type: "object" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AgentChatRequest: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string", example: "Classify this inbound request and route to PagerDuty if critical: 'All payments hanging'." },
          agentId: { type: "string", example: "agent_triage_sentinel" },
          model: { type: "string", example: "gemini-1.5-flash" },
          temperature: { type: "number", example: 0.2 },
          history: { type: "array", items: { type: "object" } },
        },
      },
      AgentChatResponse: {
        type: "object",
        properties: {
          reply: { type: "string", example: "Inbound ticket classified as CRITICAL urgency (Sentiment: Negative). Dispatched tool call to `slack_pager_router`." },
          toolCalls: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", example: "slack_pager_router" },
                parameters: { type: "object" },
                result: { type: "object" },
              },
            },
          },
          tokensUsed: { type: "integer", example: 342 },
          latencyMs: { type: "integer", example: 480 },
          model: { type: "string", example: "gemini-1.5-flash" },
        },
      },
      AgentPersona: {
        type: "object",
        properties: {
          id: { type: "string", example: "agent_triage_sentinel" },
          name: { type: "string", example: "Triage Sentinel" },
          role: { type: "string", example: "Support Inbound Classifier" },
          defaultModel: { type: "string", example: "gemini-1.5-flash" },
          temperature: { type: "number", example: 0.2 },
          tools: { type: "array", items: { type: "string" } },
        },
      },
      CreateAgentPersonaRequest: {
        type: "object",
        required: ["name", "role", "systemPrompt"],
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          systemPrompt: { type: "string" },
          defaultModel: { type: "string", default: "gemini-1.5-flash" },
          temperature: { type: "number", default: 0.2 },
          tools: { type: "array", items: { type: "string" } },
        },
      },
      PromptTemplate: {
        type: "object",
        required: ["id", "title", "category", "template", "variables"],
        properties: {
          id: { type: "string", example: "p1" },
          title: { type: "string", example: "Customer Support Urgency & Sentiment Triage" },
          category: { type: "string", example: "support" },
          template: { type: "string", example: "Analyze ticket: {{customer_message}}" },
          variables: { type: "array", items: { type: "string" }, example: ["customer_message"] },
          description: { type: "string" },
        },
      },
      PromptTestRequest: {
        type: "object",
        required: ["template"],
        properties: {
          template: { type: "string", example: "Summarize: {{document_body}}" },
          variables: { type: "object", example: { document_body: "RFC 9110 HTTP Semantics defines standards..." } },
          model: { type: "string", default: "gemini-1.5-flash" },
        },
      },
      PromptTestResponse: {
        type: "object",
        properties: {
          compiledPrompt: { type: "string" },
          extractedVariables: { type: "array", items: { type: "string" } },
          projectedTokens: { type: "integer", example: 124 },
          estimatedCostUsd: { type: "number", example: 0.00003 },
          testOutput: { type: "string" },
          latencyMs: { type: "integer", example: 310 },
        },
      },
      CreatePromptRequest: {
        type: "object",
        required: ["title", "category", "template"],
        properties: {
          title: { type: "string" },
          category: { type: "string" },
          template: { type: "string" },
          description: { type: "string" },
        },
      },
    },
  },
};
