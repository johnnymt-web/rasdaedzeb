# 🚀 Super Riasec: Project Overview

Super Riasec is a mission-critical career development platform that leverages AI to provide students, parents, and counselors with deep insights into interests and employability skills.

## 🏗️ Technical Architecture
- **Frontend**: React 18 (Vite) with a bespoke Design System utilizing Tailwind CSS.
- **State Management**: TanStack Query for server-state synchronization.
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Edge Functions).
- **Security Logic**: Hardened PL/pgSQL triggers and SECURITY DEFINER functions for administrative safety.
- **AI Engine**: Context-aware LLM agents (Student, Parent, and Counselor variants) served via streaming Edge Functions.

## 🛡️ Enterprise-Grade Security
Following a professional **Principal AI Engineer Audit**, the platform now features:
- **Zero-Trust Role Assignment**: Roles are strictly verified via a server-side pre-boarding system. Public signups cannot self-escalate to Admin/Counselor roles.
- **JWT Authorization**: All Edge Function calls are authorized using the user's authenticated session token, ensuring RLS is respected.
- **Data Integrity**: Atomic database triggers handle all user profile initialization, ensuring consistency between Auth and Public schemas.

## 🌟 Core Modules

### 1. Discovery & Skills
- **Bifurcated Assessment**: Logical separation between RIASEC interest profiles and Employability Skills readiness.
- **Dynamic Visualization**: Radar charts and comparative timelines for tracking growth over time.
- **Grade-Adaptive Experience**: UI and AI content adapt to the student's grade band (Discovery, Alignment, Decision).

### 2. Administrative Suite
- **Global User Management**: Comprehensive tools for searching, filtering, and permanently deleting accounts with full cascading cleanup.
- **Batched Processing**: High-performance CSV tools capable of processing large student datasets with minimal latency and zero timeouts.
- **AI Insights**: A strategic dashboard for administrators to analyze school-wide participation and engagement trends.

### 3. AI Copilot Ecosystem
- **Context-Injection**: Coaches receive student assessment history and grade context to provide personalized guidance.
- **Resilient Streaming**: Advanced SSE parser handles fragmented network packets to ensure smooth AI interactions.

---
*Maintained by the AntiGravity Engineering Team.*
