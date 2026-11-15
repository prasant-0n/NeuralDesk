# 02. Database — Entity-Relationship (ER) Diagram & Cardinality

[← Back to Documentation Portal](../README.md) | [Next: Schema Models →](./schema-models.md)

---

## 1.1 Complete Entity-Relationship Model

NeuralDesk models its persistence layer across 13 core entities using strict relational constraints:

```mermaid
erDiagram
    users ||--o{ workspaces : "owns"
    users ||--o{ workspace_members : "belongs to"
    users ||--o{ workflows : "authors"
    users ||--o{ executions : "triggers"
    users ||--o{ audit_logs : "initiates"

    workspaces ||--o{ workspace_members : "contains"
    workspaces ||--o{ workflows : "houses"
    workspaces ||--o{ agents : "configures"
    workspaces ||--o{ prompt_templates : "maintains"
    workspaces ||--o{ audit_logs : "records"

    workflows ||--o{ workflow_versions : "versions"
    workflows ||--o{ executions : "runs"
    workflows ||--o{ webhooks : "listens via"

    workflow_versions ||--o{ nodes : "defines"
    workflow_versions ||--o{ edges : "connects"
    workflow_versions ||--o{ executions : "instantiates"

    executions ||--o{ node_execution_runs : "executes"
    nodes ||--o{ node_execution_runs : "records run for"

    users {
        uuid id PK
        varchar email UK
        varchar name
        text avatar_url
        timestamp created_at
        timestamp updated_at
    }

    workspaces {
        uuid id PK
        varchar name
        varchar slug UK
        uuid owner_id FK
        text encrypted_api_keys
        timestamp created_at
        timestamp updated_at
    }

    workspace_members {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        varchar role
        timestamp created_at
    }

    workflows {
        uuid id PK
        uuid workspace_id FK
        varchar name
        text description
        varchar category
        varchar status
        boolean is_active
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    workflow_versions {
        uuid id PK
        uuid workflow_id FK
        integer version_number
        jsonb definition
        text changelog
        boolean is_published
        uuid created_by FK
        timestamp created_at
    }

    nodes {
        uuid id PK
        uuid workflow_version_id FK
        varchar node_key
        varchar type
        varchar name
        numeric position_x
        numeric position_y
        jsonb config
        jsonb inputs
        jsonb outputs
        timestamp created_at
    }

    edges {
        uuid id PK
        uuid workflow_version_id FK
        varchar edge_key
        varchar source_node_key
        varchar source_port
        varchar target_node_key
        varchar target_port
        text condition_expression
        timestamp created_at
    }

    executions {
        uuid id PK
        uuid workflow_id FK
        uuid workflow_version_id FK
        uuid triggered_by FK
        varchar trigger_source
        varchar mode
        varchar status
        jsonb initial_inputs
        jsonb final_outputs
        integer total_tokens_used
        integer prompt_tokens
        integer completion_tokens
        numeric cost_estimate_usd
        integer duration_ms
        text error_message
        timestamp started_at
        timestamp finished_at
    }

    node_execution_runs {
        uuid id PK
        uuid execution_id FK
        uuid node_id FK
        varchar node_key
        varchar node_type
        varchar status
        jsonb input_data
        jsonb output_data
        text prompt_resolved
        varchar llm_model
        integer prompt_tokens
        integer completion_tokens
        numeric cost_estimate_usd
        integer duration_ms
        text error_message
        integer attempt
        timestamp started_at
        timestamp finished_at
    }

    agents {
        uuid id PK
        uuid workspace_id FK
        varchar name
        varchar model_tier
        text system_instruction
        numeric temperature
        numeric top_p
        integer max_output_tokens
        jsonb tools_enabled
        timestamp created_at
        timestamp updated_at
    }

    prompt_templates {
        uuid id PK
        uuid workspace_id FK
        varchar name
        varchar slug UK
        text content
        jsonb variables
        varchar category
        timestamp created_at
        timestamp updated_at
    }

    webhooks {
        uuid id PK
        uuid workflow_id FK
        varchar url_token UK
        text secret_hash
        varchar name
        boolean is_active
        timestamp created_at
        timestamp last_triggered_at
    }

    audit_logs {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        varchar action
        varchar resource_type
        varchar resource_id
        jsonb details
        varchar ip_address
        timestamp created_at
    }
```

---

## 1.2 Entity Cardinality & Relational Governance

1. **Workspaces & Membership:** Users belong to Workspaces through `workspace_members`. Roles include `owner`, `admin`, `member`, `viewer`. Workspaces partition workflows, audit logs, and encrypted BYOK secrets.
2. **Workflows & Versions:** A Workflow possesses multiple immutable `workflow_versions`. Executions point to a specific version to guarantee reproducible execution audits.
3. **Execution Runs & Node Telemetry:** An `executions` row maintains aggregate telemetry (total duration, prompt/completion tokens, total USD cost). Every step instantiates a corresponding `node_execution_runs` row with microsecond timestamps and input/output snapshots.

---

[Next: Schema Models →](./schema-models.md)
