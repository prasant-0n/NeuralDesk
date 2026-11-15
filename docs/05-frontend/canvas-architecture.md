# 05. Frontend — Visual Canvas & Custom Node Taxonomy

[← Back to Documentation Portal](../README.md) | [Next: State Management →](./state-management.md)

---

## 1.1 Canvas Viewport Architecture

The visual workflow editor is built on **React Flow 12 (`@xyflow/react`)**. The canvas provides hardware-accelerated SVG and HTML5 canvas rendering, sub-pixel zooming, interactive port wiring, and real-time cycle detection on edge connection.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Top Navigation Bar: [Workflow Title] [Version Dropdown] [Run Workflow] [Save]        │
├──────────────┬─────────────────────────────────────────────────────────┬───────────────┤
│ Node Palette │ Canvas Viewport (React Flow 12)                         │ Slide-Over    │
│              │                                                         │ Inspector     │
│ • Trigger    │    ┌──────────────┐          ┌──────────────┐           │               │
│ • LLM Node   │    │  Trigger     │          │  Prompt Node │           │ Node Name:    │
│ • Prompt     │    │  (Webhook)   │─────────►│  "Classify"  │           │ Sentiment LLM │
│ • Condition  │    └──────────────┘          └──────┬───────┘           │               │
│ • Transform  │                                     │                   │ Model:        │
│ • Tool / API │                                     ▼                   │ gemini-1.5-fl │
│ • Evaluator  │                              ┌──────────────┐           │               │
│ • Output     │                              │   LLM Node   │           │ Temperature:  │
│              │                              │ (Flash 1.5)  │           │ [ 0.20 =====] │
│              │                              └──────┬───────┘           │               │
│              │                                     ▼                   │ JSON Mode:    │
│              │                              ┌──────────────┐           │ [x] Enabled   │
│              │                              │    Output    │           │               │
│              │                              └──────────────┘           │ Live Output:  │
│              │                                                         │ { sentiment:  │
│              │ [Controls: Zoom/Fit/Grid]           [MiniMap]           │   "NEGATIVE" }│
└──────────────┴─────────────────────────────────────────────────────────┴───────────────┘
```

---

## 1.2 Custom Node Taxonomy Reference

| Node Type | Category | Ingress Handles | Egress Handles | Configuration Parameters |
| :--- | :--- | :--- | :--- | :--- |
| **`TriggerNode`** | Ingress | None | `output` | Trigger type (`manual`, `webhook`, `schedule`), input payload JSON schema. |
| **`LLMNode`** | AI Inference | `input`, `context` | `output`, `raw` | Model (`gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`), system prompt, temperature, max tokens, response schema. |
| **`PromptNode`** | Templating | Dynamic inputs (`{{var}}`) | `prompt` | Raw template string with Mustache variables, variable type tags. |
| **`ConditionNode`** | Routing | `input` | `true`, `false` | Binary boolean expression (`{{score}} >= 80`), fallback branch. |
| **`TransformNode`** | Data Utility | `input` | `output` | JSON path mappings, regex extractors, string interpolations. |
| **`ToolNode`** | Integration | `trigger`, `params` | `response`, `error` | HTTP method, URL, headers, timeout, retry count. |
| **`EvaluatorNode`** | Quality Audit | `input`, `groundTruth` | `passed`, `failed` | Evaluation metric (similarity, JSON validation, toxicity). |
| **`ApprovalNode`** | Governance | `input` | `approved`, `rejected` | Reviewer notification channels, timeout expiry, required reviewer roles. |
| **`OutputNode`** | Egress | `input` | None | Markdown renderer, JSON tree inspector, export download button. |

---

## 1.3 Node Resilience: `on_failure` Error Ports

Every compute node (`LLMNode`, `ToolNode`, `TransformNode`) supports an optional **`on_failure`** output port:

* When disabled: An unhandled node exception aborts the entire workflow execution.
* When wired: If an exception, API rate limit, or timeout occurs, the error details are serialized into `{ error: string, statusCode?: number }` and routed downstream through the `on_failure` edge, allowing automated alerting or graceful fallback.

---

## 1.4 Workflow Portability: JSON & YAML Export/Import

Users can share, backup, or promote workflows between environments using standardized workflow bundles (`neuraldesk-flow-v1.json`):

* **Export:** One-click download of the complete serialized graph (nodes, positions, edge bindings, parameters, and version metadata).
* **Import:** Drag-and-drop JSON file directly onto the canvas to clone and instantiate an editable draft workflow.

---

[Next: State Management →](./state-management.md)
