# Product Requirement Document (PRD): DDD 业务建模与数据库优化专家 AI

## 1. Project Overview (项目概览)

- **Project Name**: DDD-DB-Expert-AI
- **Goal**: 打造一款基于领域驱动设计 (DDD) 理念的 AI 专家工具，通过对话交互帮助开发者优化业务模型、数据库表结构及索引设计，解决业务模型与技术实现脱节的问题。
- **Target Audience**: 后端开发工程师、架构师、DBA、产品经理（技术背景）。
- **Problem Statement**: 开发者在进行复杂业务系统设计时，常面临数据库设计不合理、索引缺失、与业务领域模型脱节等问题，导致系统难以维护和扩展。

## 2. Core Features (核心功能)

| Feature                            | Description                                                                                                                                   | Priority |
| :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| **项目隔离与管理**                 | 产品以“项目”为单位进行隔离。支持用户创建、切换项目，确保不同业务域的数据和上下文互不干扰。                                                    | P0       |
| **文档归档与分析**                 | 支持上传原始需求文档，系统自动归档存储。内置“产品分析”能力，对归档文档进行结构化分析，生成标准 PRD/需求分析结果，并再次归档。                 | P0       |
| **多模态输入解析**                 | 支持多种输入源：<br>1. **Schema/DDL 文件** (直接输入)；<br>2. **产品分析结果** (基于归档文档分析后的产出)；<br>3. **建表语句文本**。          | P0       |
| **DDD 领域建模分析**               | 基于输入内容，识别限界上下文 (Bounded Contexts)、聚合根 (Aggregates)、实体 (Entities) 和值对象 (Value Objects)，并生成分析报告。              | P0       |
| **智能数据库优化建议**             | 提供具体的表结构优化建议（规范化/反规范化）、索引策略（覆盖索引、联合索引）、字段类型建议，并解释其业务原因。                                 | P0       |
| **全方位产物输出**                 | 每次优化后提供：<br>1. **优化后的 SQL 脚本** (Create/Alter)；<br>2. **完整设计报告** (Markdown)；<br>3. **可视化 ER 图代码** (Mermaid 格式)。 | P0       |
| **领域知识记忆 (Context Caching)** | 在项目周期内记住用户的业务规则、特定术语和历史决策，充当“业务领域专家”角色，随对话深入不断完善领域知识库。                                    | P1       |

## 3. User Flow / Interaction (用户流程/交互)

1.  **项目创建与选择**: 用户进入应用，首先创建或选择一个“项目”。后续所有操作均在该项目隔离的上下文中进行。
2.  **资料归档与分析 (可选)**:
    - 用户上传原始需求文档（如 PRD、会议记录）。
    - 系统将文档**归档**。
    - **产品分析 AI** 对归档文档进行分析，生成标准化的需求/领域模型描述。
    - 分析结果再次**归档**，并作为后续步骤的输入。
3.  **DB 专家介入**:
    - 用户选择输入源：
      - 引用已归档的产品分析结果。
      - 直接上传 DDL/SQL 文件。
      - 直接粘贴建表语句。
    - **DB 专家 AI** 基于输入信息进行 DDD 建模与数据库设计。
4.  **多轮对话分析 (CoT)**:
    - AI 结合项目上下文数据库中的信息，逐步展示对领域的理解。
    - 若信息不足，主动反问。
5.  **生成优化方案**:
    - AI 输出包含 DDD 分析、ER 图 (Mermaid) 和 SQL 脚本的完整方案。
    - 生成的表结构等信息**存储回数据库**，更新项目知识库。
6.  **迭代反馈**:
    - 用户针对方案提出修改意见。
    - AI 基于上下文记忆（从 DB 加载）调整方案。

## 4. Technical Constraints & Requirements (技术约束与要求)

- **输入格式支持**: .sql, .txt, .md, .pdf (如果 AI Studio 支持文档解析)。
- **输出格式**: Markdown (用于报告), SQL 代码块, Mermaid 代码块。
- **数据存储**: 使用结构化数据库存储：
  1.  归档的原始文档 (Documents)
  2.  产品分析结果 (Requirements)
  3.  生成的表结构/DDL (Schemas)
  4.  项目元数据 (Projects)
- **上下文管理**: AI Chat 上下文需动态加载数据库中的项目相关信息，而非仅依赖临时会话缓存。
- **安全性**: 所有 Schema 分析在云端推理完成，数据按项目隔离，确保多租户安全。

## 5. Google AI Studio Build Mode Capabilities (Google AI Studio Build 模式能力)

_List specifically which capabilities/templates will be used to generate this application via Build Mode. Access: https://aistudio.google.com/apps?source=start_

- **Required Capability/Template**: **Conversational agent** (对话式智能体模板)
- **Model**: **Gemini 3.0 Pro** (推荐用于处理长上下文和复杂逻辑推理)
- **Prompting Strategy**:
  - **System Instructions**: 设定严格的 DDD 专家人设，要求输出必须包含理论依据（Why）和具体落地代码（How）。
  - **Chain-of-thought (CoT)**: 在给出 SQL 前，强制先进行领域分析 (Identify Aggregates -> Define Relationships -> Optimize Schema)。
- **Additional Features**:
  - **Context Caching**: 必须启用，用于存储用户提供的长篇需求文档和多轮对话中的业务规则，确保 AI 能够"记住"业务细节。
  - **Structured Output**: 部分输出（如最终的表结构定义）可尝试通过 JSON Schema 约束，便于后续可能的程序化处理（虽然主界面是对话）。

## 6. Success Metrics (成功指标)

- **采纳率**: 用户直接复制生成的 SQL 语句的使用比例。
- **交互轮数**: 在 3-5 轮对话内能产出用户满意的最终设计方案。
- **准确性**: 生成的 SQL 语法无误，且 Mermaid 图表能被主流工具正确渲染。
