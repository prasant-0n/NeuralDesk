import * as dotenv from "dotenv";
import { db } from "./client.js";
import {
  users,
  workspaces,
  workspaceMembers,
  workflows,
  workflowVersions,
  nodes,
  edges,
  agents,
  promptTemplates,
  webhooks,
} from "./schema/index.js";
import { sql } from "drizzle-orm";

dotenv.config();

// Deterministic Standard RFC 4122 UUIDs for Seed Entities
export const SEED_IDS = {
  USER_ADMIN: "00000000-0000-4000-8000-000000000001",
  WORKSPACE_CORE: "00000000-0000-4000-8000-000000000002",
  MEMBER_ADMIN: "00000000-0000-4000-8000-000000000003",

  // Workflow 1: Customer Support Triage & Sentiment Escalation
  WF_SUPPORT: "00000000-0000-4000-a000-000000000001",
  WF_SUPPORT_V1: "00000000-0000-4000-a000-000000000002",
  WF_SUPPORT_WH: "00000000-0000-4000-a000-000000000003",

  // Workflow 2: Document Summarizer & Key Insight Extractor
  WF_DOC_SUMMARIZER: "00000000-0000-4000-b000-000000000001",
  WF_DOC_SUMMARIZER_V1: "00000000-0000-4000-b000-000000000002",

  // Workflow 3: Lead Enrichment & Structured Data Extractor
  WF_LEAD_ENRICHMENT: "00000000-0000-4000-c000-000000000001",
  WF_LEAD_ENRICHMENT_V1: "00000000-0000-4000-c000-000000000002",
  WF_LEAD_WH: "00000000-0000-4000-c000-000000000003",
} as const;

// 1. Workflow 1 Definition: Customer Support Triage & Sentiment Escalation
export const supportWorkflowDefinition = {
  viewport: { x: 0, y: 0, zoom: 1.0 },
  nodes: [
    {
      id: "webhook_trigger",
      type: "trigger" as const,
      position: { x: 100, y: 200 },
      data: {
        label: "Inbound Support Webhook",
        description: "Receives raw customer support tickets",
        inputs: [],
        outputs: [{ id: "output", name: "output", type: "object" as const, required: false }],
        config: {
          triggerType: "webhook" as const,
          webhookPath: "/support/ticket",
          webhookMethod: "POST" as const,
          samplePayload: {
            customerEmail: "user@enterprise.com",
            subject: "Critical API Latency Spike",
            message: "Our production requests are timing out continuously!",
            priority: "urgent",
          },
        },
      },
    },
    {
      id: "gemini_sentiment",
      type: "llm" as const,
      position: { x: 480, y: 200 },
      data: {
        label: "Gemini 1.5 Flash Sentiment Analyzer",
        description: "Analyzes sentiment and urgency scores",
        inputs: [{ id: "input", name: "input", type: "object" as const, required: true }],
        outputs: [{ id: "output", name: "output", type: "object" as const, required: false }],
        config: {
          provider: "gemini" as const,
          model: "gemini-1.5-flash",
          systemPrompt:
            "You are an enterprise AI customer support triage specialist. Analyze the incoming customer ticket, determine sentiment (POSITIVE, NEUTRAL, NEGATIVE, URGENT), assign an urgency score from 0 to 100, categorize the issue, and provide an executive summary and recommended action.",
          temperature: 0.1,
          topP: 0.95,
          maxTokens: 2048,
          jsonMode: true,
          responseSchema: {
            type: "object",
            properties: {
              sentiment: { type: "string", enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"] },
              urgencyScore: { type: "number" },
              category: { type: "string" },
              summary: { type: "string" },
              suggestedAction: { type: "string" },
            },
            required: ["sentiment", "urgencyScore", "category", "summary", "suggestedAction"],
          },
        },
      },
    },
    {
      id: "escalation_router",
      type: "condition" as const,
      position: { x: 880, y: 200 },
      data: {
        label: "Urgency & Sentiment Router",
        description: "Evaluates whether ticket requires immediate human escalation",
        inputs: [{ id: "input", name: "input", type: "object" as const, required: true }],
        outputs: [
          { id: "true", name: "Urgent Escalation", type: "object" as const, required: false },
          { id: "false", name: "Standard Auto-Reply", type: "object" as const, required: false },
        ],
        config: {
          expression:
            "steps.gemini_sentiment.output.urgencyScore >= 75 || steps.gemini_sentiment.output.sentiment === 'URGENT' || steps.gemini_sentiment.output.sentiment === 'NEGATIVE'",
          logicalOperator: "OR" as const,
          fallbackBranch: "false" as const,
        },
      },
    },
    {
      id: "slack_pager_alert",
      type: "tool" as const,
      position: { x: 1240, y: 100 },
      data: {
        label: "High-Priority Slack & PagerDuty Alert",
        description: "Dispatches urgent notifications to on-call engineering team",
        inputs: [{ id: "input", name: "input", type: "object" as const, required: true }],
        outputs: [{ id: "output", name: "output", type: "object" as const, required: false }],
        config: {
          toolType: "http_request" as const,
          httpMethod: "POST" as const,
          url: "https://hooks.slack.internal/services/mock-channel-notifications",
          bodyPayload: {
            channel: "#support-escalations",
            text: "🚨 *URGENT SUPPORT TICKET ESCALATION*\n*Customer:* {{steps.webhook_trigger.output.customerEmail}}\n*Subject:* {{steps.webhook_trigger.output.subject}}\n*Urgency Score:* {{steps.gemini_sentiment.output.urgencyScore}}\n*Summary:* {{steps.gemini_sentiment.output.summary}}\n*Action:* {{steps.gemini_sentiment.output.suggestedAction}}",
          },
        },
      },
    },
    {
      id: "auto_reply_generator",
      type: "llm" as const,
      position: { x: 1240, y: 340 },
      data: {
        label: "Contextual Auto-Reply Generator",
        description: "Generates tailored professional response for standard tickets",
        inputs: [{ id: "input", name: "input", type: "object" as const, required: true }],
        outputs: [{ id: "output", name: "output", type: "string" as const, required: false }],
        config: {
          provider: "gemini" as const,
          model: "gemini-1.5-flash",
          systemPrompt:
            "Draft a courteous, highly professional customer support auto-reply acknowledging receipt of the inquiry and addressing the user's issue based on the ticket summary.",
          temperature: 0.7,
          topP: 0.95,
          maxTokens: 1024,
        },
      },
    },
    {
      id: "email_dispatch",
      type: "output" as const,
      position: { x: 1600, y: 340 },
      data: {
        label: "Email Dispatcher",
        description: "Formats and finalizes the outbound support response",
        inputs: [{ id: "input", name: "input", type: "string" as const, required: true }],
        outputs: [],
        config: {
          outputFormat: "json" as const,
          primaryOutputKey: "emailResponse",
        },
      },
    },
  ],
  edges: [
    {
      id: "edge_trig_to_sentiment",
      source: "webhook_trigger",
      target: "gemini_sentiment",
      sourceHandle: "output",
      targetHandle: "input",
      animated: false,
    },
    {
      id: "edge_sentiment_to_router",
      source: "gemini_sentiment",
      target: "escalation_router",
      sourceHandle: "output",
      targetHandle: "input",
      animated: false,
    },
    {
      id: "edge_router_to_alert",
      source: "escalation_router",
      target: "slack_pager_alert",
      sourceHandle: "true",
      targetHandle: "input",
      branch: "true" as const,
      animated: true,
      data: {
        branch: "true" as const,
        conditionExpression: "urgencyScore >= 75",
      },
    },
    {
      id: "edge_router_to_reply",
      source: "escalation_router",
      target: "auto_reply_generator",
      sourceHandle: "false",
      targetHandle: "input",
      branch: "false" as const,
      animated: false,
      data: {
        branch: "false" as const,
        conditionExpression: "urgencyScore < 75",
      },
    },
    {
      id: "edge_reply_to_dispatch",
      source: "auto_reply_generator",
      target: "email_dispatch",
      sourceHandle: "output",
      targetHandle: "input",
      animated: false,
    },
  ],
};

// 2. Workflow 2 Definition: Document Summarizer & Key Insight Extractor
export const docSummarizerWorkflowDefinition = {
  viewport: { x: 0, y: 0, zoom: 1.0 },
  nodes: [
    {
      id: "manual_doc_input",
      type: "trigger" as const,
      position: { x: 100, y: 200 },
      data: {
        label: "Manual Document Ingestion",
        description: "Accepts document title, full text, and briefing preferences",
        inputs: [],
        outputs: [{ id: "output", name: "output", type: "object" as const, required: false }],
        config: {
          triggerType: "manual" as const,
          samplePayload: {
            documentTitle: "Enterprise Multi-Agent Architecture",
            documentBody: "Executive overview of autonomous agent systems in distributed cloud environments...",
            targetAudience: "Engineering Leadership",
          },
        },
      },
    },
    {
      id: "text_chunker",
      type: "transform" as const,
      position: { x: 480, y: 200 },
      data: {
        label: "Text Normalizer & Template Formatter",
        description: "Normalizes body text and formats contextual prompt headers",
        inputs: [{ id: "input", name: "input", type: "object" as const, required: true }],
        outputs: [{ id: "output", name: "output", type: "object" as const, required: false }],
        config: {
          transformType: "string_template" as const,
          rules: [
            {
              targetKey: "normalizedText",
              sourceExpression: "steps.manual_doc_input.output.documentBody",
            },
          ],
        },
      },
    },
    {
      id: "gemini_pro_synthesizer",
      type: "llm" as const,
      position: { x: 880, y: 200 },
      data: {
        label: "Gemini 1.5 Pro Deep Analyzer",
        description: "Synthesizes multi-page reports into structured executive briefings",
        inputs: [{ id: "input", name: "input", type: "object" as const, required: true }],
        outputs: [{ id: "output", name: "output", type: "string" as const, required: false }],
        config: {
          provider: "gemini" as const,
          model: "gemini-1.5-pro",
          systemPrompt:
            "You are an elite executive intelligence analyst. Synthesize the provided document into a rigorous briefing including: 1. Executive Summary, 2. Key Quantitative Findings & Metrics, 3. Critical Risks & Strategic Opportunities, 4. Immediate Action Items.",
          temperature: 0.2,
          topP: 0.95,
          maxTokens: 4096,
        },
      },
    },
    {
      id: "markdown_formatter",
      type: "output" as const,
      position: { x: 1280, y: 200 },
      data: {
        label: "Markdown Document Publisher",
        description: "Renders synthesized findings into executive markdown",
        inputs: [{ id: "input", name: "input", type: "string" as const, required: true }],
        outputs: [],
        config: {
          outputFormat: "markdown" as const,
          renderTemplate: "# Executive Intelligence Briefing\n\n{{steps.gemini_pro_synthesizer.output}}",
          enableDownload: true,
        },
      },
    },
  ],
  edges: [
    {
      id: "edge_input_to_chunker",
      source: "manual_doc_input",
      target: "text_chunker",
      sourceHandle: "output",
      targetHandle: "input",
      animated: false,
    },
    {
      id: "edge_chunker_to_pro",
      source: "text_chunker",
      target: "gemini_pro_synthesizer",
      sourceHandle: "output",
      targetHandle: "input",
      animated: false,
    },
    {
      id: "edge_pro_to_markdown",
      source: "gemini_pro_synthesizer",
      target: "markdown_formatter",
      sourceHandle: "output",
      targetHandle: "input",
      animated: false,
    },
  ],
};

// 3. Workflow 3 Definition: Lead Enrichment & Structured Data Extractor
export const leadEnrichmentWorkflowDefinition = {
  viewport: { x: 0, y: 0, zoom: 1.0 },
  nodes: [
    {
      id: "inbound_lead_webhook",
      type: "trigger" as const,
      position: { x: 100, y: 200 },
      data: {
        label: "Inbound Lead Webhook",
        description: "Captures unformatted website, email, and discovery notes",
        inputs: [],
        outputs: [{ id: "output", name: "output", type: "object" as const, required: false }],
        config: {
          triggerType: "webhook" as const,
          webhookPath: "/leads/inbound",
          webhookMethod: "POST" as const,
          samplePayload: {
            companyName: "HyperScale Dynamics",
            website: "https://hyperscale.example.com",
            contactEmail: "founder@hyperscale.example.com",
            rawNotes: "Series B funded, 75 employees, looking to migrate from legacy batch workers to streaming LLM DAGs.",
          },
        },
      },
    },
    {
      id: "gemini_structured_extractor",
      type: "llm" as const,
      position: { x: 480, y: 200 },
      data: {
        label: "Gemini 2.0 Flash Structured Extractor",
        description: "Extracts firmographics and intent score using strict JSON schema",
        inputs: [{ id: "input", name: "input", type: "object" as const, required: true }],
        outputs: [{ id: "output", name: "output", type: "object" as const, required: false }],
        config: {
          provider: "gemini" as const,
          model: "gemini-2.0-flash",
          systemPrompt:
            "You are a B2B revenue operations intelligence system. Analyze the raw company website, email, and notes to extract structured firmographic information according to the strict JSON schema.",
          temperature: 0.1,
          topP: 0.95,
          maxTokens: 2048,
          jsonMode: true,
          responseSchema: {
            type: "object",
            properties: {
              companyName: { type: "string" },
              industry: { type: "string" },
              estimatedEmployees: {
                type: "string",
                enum: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
              },
              intentScore: { type: "number", minimum: 0, maximum: 100 },
              icpFit: { type: "boolean" },
            },
            required: [
              "companyName",
              "industry",
              "estimatedEmployees",
              "intentScore",
              "icpFit",
            ],
          },
        },
      },
    },
    {
      id: "data_transform",
      type: "transform" as const,
      position: { x: 880, y: 200 },
      data: {
        label: "CRM Payload Transformer",
        description: "Maps extracted properties into normalized CRM schema",
        inputs: [{ id: "input", name: "input", type: "object" as const, required: true }],
        outputs: [{ id: "output", name: "output", type: "object" as const, required: false }],
        config: {
          transformType: "json_pick" as const,
          rules: [
            {
              targetKey: "properties.company",
              sourceExpression: "steps.gemini_structured_extractor.output.companyName",
            },
            {
              targetKey: "properties.industry",
              sourceExpression: "steps.gemini_structured_extractor.output.industry",
            },
            {
              targetKey: "properties.lead_score",
              sourceExpression: "steps.gemini_structured_extractor.output.intentScore",
            },
            {
              targetKey: "properties.icp_qualified",
              sourceExpression: "steps.gemini_structured_extractor.output.icpFit",
            },
          ],
        },
      },
    },
    {
      id: "crm_sync_output",
      type: "output" as const,
      position: { x: 1280, y: 200 },
      data: {
        label: "HubSpot / Salesforce Sync",
        description: "Produces validated payload ready for CRM contact synchronization",
        inputs: [{ id: "input", name: "input", type: "object" as const, required: true }],
        outputs: [],
        config: {
          outputFormat: "json" as const,
          primaryOutputKey: "crmRecord",
        },
      },
    },
  ],
  edges: [
    {
      id: "edge_lead_to_extractor",
      source: "inbound_lead_webhook",
      target: "gemini_structured_extractor",
      sourceHandle: "output",
      targetHandle: "input",
      animated: false,
    },
    {
      id: "edge_extractor_to_transform",
      source: "gemini_structured_extractor",
      target: "data_transform",
      sourceHandle: "output",
      targetHandle: "input",
      animated: false,
    },
    {
      id: "edge_transform_to_crm",
      source: "data_transform",
      target: "crm_sync_output",
      sourceHandle: "output",
      targetHandle: "input",
      animated: false,
    },
  ],
};

/**
 * Seed execution function. Idempotent and safe across multiple executions.
 */
export async function seedDatabase(client = db) {
  console.log("🌱 Starting NeuralDesk Production Database Seeding...");

  // 1. Upsert Demo User
  console.log("  ↳ Seeding demo user...");
  await client
    .insert(users)
    .values({
      id: SEED_IDS.USER_ADMIN,
      email: "admin@neuraldesk.io",
      name: "NeuralDesk Architect",
      avatarUrl: "https://avatar.vercel.sh/neuraldesk",
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: "NeuralDesk Architect",
        avatarUrl: "https://avatar.vercel.sh/neuraldesk",
        updatedAt: sql`now()`,
      },
    });

  // 2. Upsert Demo Workspace
  console.log("  ↳ Seeding core workspace...");
  await client
    .insert(workspaces)
    .values({
      id: SEED_IDS.WORKSPACE_CORE,
      name: "NeuralDesk Enterprise",
      slug: "neuraldesk-enterprise",
      ownerId: SEED_IDS.USER_ADMIN,
    })
    .onConflictDoUpdate({
      target: workspaces.id,
      set: {
        name: "NeuralDesk Enterprise",
        updatedAt: sql`now()`,
      },
    });

  // 3. Upsert Workspace Member
  console.log("  ↳ Seeding workspace membership...");
  await client
    .insert(workspaceMembers)
    .values({
      id: SEED_IDS.MEMBER_ADMIN,
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      userId: SEED_IDS.USER_ADMIN,
      role: "owner",
    })
    .onConflictDoNothing();

  // 4. Seed Agents
  console.log("  ↳ Seeding AI agents...");
  await client
    .insert(agents)
    .values([
      {
        workspaceId: SEED_IDS.WORKSPACE_CORE,
        name: "Customer Triage Specialist",
        slug: "customer-triage-agent",
        description: "Specialized in emotional sentiment analysis, ticket urgency classification, and customer routing.",
        systemPrompt: "You are an AI customer support triage specialist. Categorize incoming issues and compute urgency metrics.",
        defaultModel: "gemini-1.5-flash",
        temperature: "0.20",
        topP: "0.95",
        maxTokens: 2048,
      },
      {
        workspaceId: SEED_IDS.WORKSPACE_CORE,
        name: "Executive Document Analyst",
        slug: "doc-analyst-agent",
        description: "Specialized in synthesized deep research briefings, risk identification, and strategic action plans.",
        systemPrompt: "You are an elite executive intelligence analyst. Synthesize complex documents into actionable insights.",
        defaultModel: "gemini-1.5-pro",
        temperature: "0.20",
        topP: "0.95",
        maxTokens: 4096,
      },
      {
        workspaceId: SEED_IDS.WORKSPACE_CORE,
        name: "B2B Revenue Operations Agent",
        slug: "revops-enrichment-agent",
        description: "Specialized in strict JSON schema extraction, firmographics parsing, and ICP lead scoring.",
        systemPrompt: "You are a B2B revenue operations intelligence system extracting firmographics from raw web text.",
        defaultModel: "gemini-2.0-flash",
        temperature: "0.10",
        topP: "0.95",
        maxTokens: 2048,
      },
    ])
    .onConflictDoNothing();

  // 5. Seed Prompt Templates
  console.log("  ↳ Seeding prompt templates...");
  await client
    .insert(promptTemplates)
    .values([
      {
        workspaceId: SEED_IDS.WORKSPACE_CORE,
        name: "Customer Sentiment Classifier",
        slug: "customer-sentiment-classifier",
        description: "Zero-shot classification prompt for support tickets.",
        content: "Analyze the sentiment and urgency of this customer inquiry:\nSubject: {{subject}}\nBody: {{message}}",
        variables: ["subject", "message"],
        category: "support",
      },
      {
        workspaceId: SEED_IDS.WORKSPACE_CORE,
        name: "Executive Briefing Synthesizer",
        slug: "executive-briefing-synthesizer",
        description: "Comprehensive 4-part executive document review prompt.",
        content: "Please analyze the following report for an audience of {{targetAudience}}:\n\n{{documentBody}}",
        variables: ["targetAudience", "documentBody"],
        category: "content",
      },
      {
        workspaceId: SEED_IDS.WORKSPACE_CORE,
        name: "B2B Lead Schema Extractor",
        slug: "b2b-lead-schema-extractor",
        description: "Extracts firmographics and computes an ICP intent score.",
        content: "Extract firmographics for company {{companyName}} with website {{website}} from notes:\n{{rawNotes}}",
        variables: ["companyName", "website", "rawNotes"],
        category: "sales",
      },
    ])
    .onConflictDoNothing();

  // 6. Workflow 1: Customer Support Triage
  console.log("  ↳ Seeding Workflow 1: Customer Support Triage & Sentiment Escalation...");
  await client
    .insert(workflows)
    .values({
      id: SEED_IDS.WF_SUPPORT,
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Customer Support Triage & Sentiment Escalation",
      description:
        "Automated customer support routing pipeline analyzing customer inquiry sentiment with Gemini 1.5 Flash, routing high-urgency or negative sentiment to an escalation alert and sending an automated contextual reply for standard tickets.",
      category: "support",
      status: "published",
      isActive: true,
      createdBy: SEED_IDS.USER_ADMIN,
    })
    .onConflictDoUpdate({
      target: workflows.id,
      set: { status: "published", updatedAt: sql`now()` },
    });

  await client
    .insert(workflowVersions)
    .values({
      id: SEED_IDS.WF_SUPPORT_V1,
      workflowId: SEED_IDS.WF_SUPPORT,
      versionNumber: 1,
      definition: supportWorkflowDefinition,
      changelog: "Initial production release of customer support triage workflow",
      isPublished: true,
      createdBy: SEED_IDS.USER_ADMIN,
    })
    .onConflictDoNothing();

  await client
    .insert(webhooks)
    .values({
      id: SEED_IDS.WF_SUPPORT_WH,
      workflowId: SEED_IDS.WF_SUPPORT,
      urlToken: "wh_support_triage_live_tok_9918",
      secretHash: "sha256$5f4dcc3b5aa765d61d8327deb882cf99$f9824ab198de7e33e144a49c252518e1d2c673e5a59374c43c2c1c3f5d5b76f1",
      name: "Zendesk / Freshdesk Inbound Webhook",
      isActive: true,
    })
    .onConflictDoNothing();

  // Seed individual nodes for version 1
  for (const n of supportWorkflowDefinition.nodes) {
    await client
      .insert(nodes)
      .values({
        workflowVersionId: SEED_IDS.WF_SUPPORT_V1,
        nodeKey: n.id,
        type: n.type,
        name: n.data.label,
        positionX: n.position.x.toString(),
        positionY: n.position.y.toString(),
        config: n.data.config as Record<string, unknown>,
      })
      .onConflictDoNothing();
  }

  // Seed individual edges for version 1
  for (const e of supportWorkflowDefinition.edges) {
    await client
      .insert(edges)
      .values({
        workflowVersionId: SEED_IDS.WF_SUPPORT_V1,
        edgeKey: e.id,
        sourceNodeKey: e.source,
        sourcePort: e.sourceHandle || "output",
        targetNodeKey: e.target,
        targetPort: e.targetHandle || "input",
        conditionExpression: e.data?.conditionExpression || null,
      })
      .onConflictDoNothing();
  }

  // 7. Workflow 2: Document Summarizer
  console.log("  ↳ Seeding Workflow 2: Document Summarizer & Key Insight Extractor...");
  await client
    .insert(workflows)
    .values({
      id: SEED_IDS.WF_DOC_SUMMARIZER,
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Document Summarizer & Key Insight Extractor",
      description:
        "Long-form document ingestion pipeline chunking dense reports, synthesizing executive summaries, key metrics, and actionable recommendations with Gemini 1.5 Pro, and publishing formatted markdown.",
      category: "content",
      status: "published",
      isActive: true,
      createdBy: SEED_IDS.USER_ADMIN,
    })
    .onConflictDoUpdate({
      target: workflows.id,
      set: { status: "published", updatedAt: sql`now()` },
    });

  await client
    .insert(workflowVersions)
    .values({
      id: SEED_IDS.WF_DOC_SUMMARIZER_V1,
      workflowId: SEED_IDS.WF_DOC_SUMMARIZER,
      versionNumber: 1,
      definition: docSummarizerWorkflowDefinition,
      changelog: "Initial production release of document summarizer workflow",
      isPublished: true,
      createdBy: SEED_IDS.USER_ADMIN,
    })
    .onConflictDoNothing();

  for (const n of docSummarizerWorkflowDefinition.nodes) {
    await client
      .insert(nodes)
      .values({
        workflowVersionId: SEED_IDS.WF_DOC_SUMMARIZER_V1,
        nodeKey: n.id,
        type: n.type,
        name: n.data.label,
        positionX: n.position.x.toString(),
        positionY: n.position.y.toString(),
        config: n.data.config as Record<string, unknown>,
      })
      .onConflictDoNothing();
  }

  for (const e of docSummarizerWorkflowDefinition.edges) {
    await client
      .insert(edges)
      .values({
        workflowVersionId: SEED_IDS.WF_DOC_SUMMARIZER_V1,
        edgeKey: e.id,
        sourceNodeKey: e.source,
        sourcePort: e.sourceHandle || "output",
        targetNodeKey: e.target,
        targetPort: e.targetHandle || "input",
      })
      .onConflictDoNothing();
  }

  // 8. Workflow 3: Lead Enrichment
  console.log("  ↳ Seeding Workflow 3: Lead Enrichment & Structured Data Extractor...");
  await client
    .insert(workflows)
    .values({
      id: SEED_IDS.WF_LEAD_ENRICHMENT,
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Lead Enrichment & Structured Data Extractor",
      description:
        "Automated inbound sales lead enrichment taking unformatted company and founder notes, extracting structured firmographics with Gemini 2.0 Flash JSON schema enforcement, normalizing scoring, and formatting for CRM sync.",
      category: "sales",
      status: "published",
      isActive: true,
      createdBy: SEED_IDS.USER_ADMIN,
    })
    .onConflictDoUpdate({
      target: workflows.id,
      set: { status: "published", updatedAt: sql`now()` },
    });

  await client
    .insert(workflowVersions)
    .values({
      id: SEED_IDS.WF_LEAD_ENRICHMENT_V1,
      workflowId: SEED_IDS.WF_LEAD_ENRICHMENT,
      versionNumber: 1,
      definition: leadEnrichmentWorkflowDefinition,
      changelog: "Initial production release of lead enrichment workflow",
      isPublished: true,
      createdBy: SEED_IDS.USER_ADMIN,
    })
    .onConflictDoNothing();

  await client
    .insert(webhooks)
    .values({
      id: SEED_IDS.WF_LEAD_WH,
      workflowId: SEED_IDS.WF_LEAD_ENRICHMENT,
      urlToken: "wh_lead_inbound_live_tok_8412",
      secretHash: "sha256$7a2c3b5aa765d61d8327deb882cf99$d4824ab198de7e33e144a49c252518e1d2c673e5a59374c43c2c1c3f5d5b76f2",
      name: "HubSpot Inbound Lead Webhook",
      isActive: true,
    })
    .onConflictDoNothing();

  for (const n of leadEnrichmentWorkflowDefinition.nodes) {
    await client
      .insert(nodes)
      .values({
        workflowVersionId: SEED_IDS.WF_LEAD_ENRICHMENT_V1,
        nodeKey: n.id,
        type: n.type,
        name: n.data.label,
        positionX: n.position.x.toString(),
        positionY: n.position.y.toString(),
        config: n.data.config as Record<string, unknown>,
      })
      .onConflictDoNothing();
  }

  for (const e of leadEnrichmentWorkflowDefinition.edges) {
    await client
      .insert(edges)
      .values({
        workflowVersionId: SEED_IDS.WF_LEAD_ENRICHMENT_V1,
        edgeKey: e.id,
        sourceNodeKey: e.source,
        sourcePort: e.sourceHandle || "output",
        targetNodeKey: e.target,
        targetPort: e.targetHandle || "input",
      })
      .onConflictDoNothing();
  }

  console.log("✅ NeuralDesk Database Seeding Completed Successfully!");
}

// Auto-run if executed directly as script
if (process.argv[1]?.endsWith("seed.js") || process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => {
      console.log("🚀 Database seed script completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("⚠️ Database seed warning or connection issue:", err.message);
      process.exit(0);
    });
}
