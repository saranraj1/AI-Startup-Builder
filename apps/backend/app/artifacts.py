from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ArtifactDefinition:
    category: str
    title: str
    prompt_focus: str


ARTIFACTS: tuple[ArtifactDefinition, ...] = (
    ArtifactDefinition("analysis", "Idea analysis", "problem, market gap, USP, startup score, risks"),
    ArtifactDefinition("research", "Market research", "TAM/SAM/SOM estimates, competitors, SWOT"),
    ArtifactDefinition("business", "Business model", "business model canvas and go-to-market assumptions"),
    ArtifactDefinition("revenue", "Revenue model", "pricing, CAC, break-even, and projections"),
    ArtifactDefinition("brand", "Brand system", "name, positioning, voice, palette, and tagline"),
    ArtifactDefinition("marketing", "Marketing launch", "landing copy, channels, SEO, launch plan"),
    ArtifactDefinition("product", "Product blueprint", "personas, MVP, workflows, and success metrics"),
    ArtifactDefinition("engineering", "Technical architecture", "stack, integrations, security, operations"),
    ArtifactDefinition("ai", "AI strategy", "model strategy, evaluation, safety, and data loop"),
    ArtifactDefinition("legal", "Legal checklist", "policies, compliance, risk disclaimers"),
    ArtifactDefinition("investor", "Investor narrative", "pitch, milestones, moat, funding strategy"),
    ArtifactDefinition("docs", "Launch documentation", "readme, operating docs, deployment outline"),
)


def slug_name(idea: str) -> str:
    words = re.findall(r"[A-Za-z]+", idea)[:3]
    return " ".join(word.capitalize() for word in words) or "New venture"


def calculate_startup_score(idea: str) -> int:
    h = sum(ord(c) for c in idea)
    return 65 + (h % 26)


def demo_content(category: str, idea: str) -> dict[str, Any]:
    if category == "analysis":
        return {
            "problem": f"People struggle with the workflow behind: {idea}",
            "marketGap": "Most tools optimize isolated tasks, not the complete outcome.",
            "usp": "A guided, evidence-aware workspace that turns intent into execution.",
            "risks": ["Crowded category", "Need measurable activation"],
            "startupScore": calculate_startup_score(idea),
            "difficultyScore": 64,
            "revenuePotential": "High",
            "competitionLevel": "Medium",
        }
    if category == "research":
        return {
            "tam": "$4.8B estimated category spend",
            "sam": "$620M reachable initial segment",
            "som": "$18M three-year wedge",
            "competitors": [
                {"name": "Incumbent suites", "pricing": "$20-100/user/month", "weakness": "Fragmented workflows"},
                {"name": "Consultancies", "pricing": "$5k-50k/project", "weakness": "Slow and expensive"},
            ],
            "swot": {
                "strengths": ["Speed", "Personalization"],
                "weaknesses": ["New brand"],
                "opportunities": ["Founder-led growth"],
                "threats": ["Platform bundling"],
            },
        }
    if category == "business":
        return {
            "customerSegments": ["Early-stage founders", "Product teams", "Startup studios"],
            "valueProposition": "Compress weeks of startup planning into one guided workspace.",
            "channels": ["Founder communities", "SEO templates", "Product-led referrals"],
            "revenueStreams": ["Pro subscription", "Team workspace", "Expert marketplace"],
            "keyActivities": ["Generation quality", "Template iteration", "Distribution"],
            "keyResources": ["Agent system", "Research corpus", "Workflow UX"],
            "costStructure": ["Inference", "Infrastructure", "Support"],
            "partnerships": ["Accelerators", "Cloud providers"],
        }
    if category == "revenue":
        return {
            "plans": [
                {"name": "Starter", "price": 0, "limit": "1 project"},
                {"name": "Builder", "price": 29, "limit": "10 projects"},
                {"name": "Studio", "price": 99, "limit": "Unlimited projects + collaboration"},
            ],
            "mrrAt12Months": "$48,600",
            "cac": "$42",
            "breakEven": "Month 11",
            "fiveYearProjection": ["Y1 $280k", "Y2 $1.1M", "Y3 $3.4M", "Y4 $8.2M", "Y5 $16.5M"],
        }
    if category == "brand":
        return {
            "name": "Forgeway",
            "alternatives": ["VentureOS", "Launchcraft", "Northstar"],
            "domainSuggestions": ["forgeway.ai", "tryforgeway.com"],
            "tagline": "From spark to shipped.",
            "mission": "Give every ambitious idea a fair shot at becoming real.",
            "vision": "The operating system for turning conviction into companies.",
            "personality": ["Clear", "Optimistic", "Decisive"],
            "palette": {"ink": "#07111F", "electric": "#6EE7F9", "violet": "#9B8AFB", "paper": "#F4F7FB"},
            "typography": "Inter with Space Grotesk display headings",
        }
    if category == "marketing":
        return {
            "hero": "Build the company behind your idea.",
            "subhead": "Forgeway turns one sentence into strategy, product, brand, and a launch plan you can act on.",
            "cta": "Build my startup",
            "launchPlan": [
                "Private beta with 25 founders",
                "Publish the startup teardown series",
                "Launch on Product Hunt with founder stories",
            ],
            "seoTopics": ["startup idea validator", "AI business plan generator", "how to validate a startup idea"],
            "referral": "Give a month, get a month",
        }
    if category == "product":
        return {
            "surfaces": ["Idea intake", "Generation timeline", "Artifact workspace", "Export center"],
            "mvp": ["One-sentence intake", "12 artifact sections", "Editable assumptions", "Markdown export"],
            "northStarMetric": "Percentage of projects reaching a validated next action",
            "personas": ["Solo founder", "Startup studio operator", "Innovation lead"],
        }
    if category == "engineering":
        return {
            "frontend": "Next.js App Router, TypeScript, Tailwind, accessible component primitives",
            "backend": "FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery",
            "storage": "S3-compatible object storage for exports",
            "api": "Versioned REST with OpenAPI",
            "security": ["JWT/OAuth boundary", "Tenant-scoped authorization", "Secret redaction", "Rate limits"],
        }
    if category == "ai":
        return {
            "provider": "Gemini first, with a provider interface for future Groq support",
            "models": ["Gemini 1.5 Pro", "Gemini 1.5 Flash"],
            "retrieval": "Qdrant can be added after private-beta generation is stable",
            "agents": ["Founder", "CTO", "Product", "Designer", "Marketing", "Finance", "Investor", "QA"],
            "evaluation": ["Schema validation", "Assumption labeling", "Golden startup fixtures"],
            "safety": ["No fabricated market certainty", "Prompt injection isolation", "PII redaction"],
        }
    if category == "legal":
        return {
            "documents": ["Privacy policy", "Terms of service", "Cookie policy", "Refund policy"],
            "gdprChecklist": ["Data map", "Processor register", "Deletion workflow", "Consent records"],
            "note": "Have counsel review before production launch.",
        }
    if category == "investor":
        return {
            "elevatorPitch": "Forgeway is the AI operating system that turns startup ideas into launch-ready companies.",
            "deck": ["Problem", "Insight", "Product", "Market", "Traction", "Business model", "Moat", "Go-to-market", "Team", "Ask"],
            "milestones": ["100 beta projects", "30% activation to export", "$50k MRR"],
            "fundingStrategy": "Raise after proving repeatable activation and paid conversion.",
        }
    return {
        "readme": "Run the intake, review assumptions, choose a next action, and export the plan.",
        "architectureDocs": ["System overview", "Agent contracts", "Data model", "Operations runbook"],
        "apiDocs": "OpenAPI is available at /docs.",
        "deployment": ["Docker Compose for local", "Managed PostgreSQL", "Redis", "Object storage", "CI/CD with health checks"],
    }
