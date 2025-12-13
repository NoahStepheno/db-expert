-- 1. 项目表 (Projects)
CREATE TABLE projects (
id SERIAL PRIMARY KEY,
owner_id INTEGER NOT NULL,
name VARCHAR(255) NOT NULL,
description TEXT,
status VARCHAR(50) DEFAULT 'active',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP, -- 使用 timestamp 记录删除时间，NULL 表示未删除
FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- 2. 原始文档表 (Documents)
CREATE TABLE documents (
id SERIAL PRIMARY KEY,
project_id INTEGER NOT NULL,
filename VARCHAR(255) NOT NULL,
storage_path VARCHAR(512),
file_type VARCHAR(50),
content TEXT,
status VARCHAR(50) DEFAULT 'pending',
uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP, -- Soft Delete
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 3. 需求分析表 (Requirements)
CREATE TABLE requirements (
id SERIAL PRIMARY KEY,
project_id INTEGER NOT NULL,
source_document_id INTEGER,
title VARCHAR(255),
analysis_content TEXT NOT NULL,
structured_data JSONB,
version INTEGER DEFAULT 1,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE SET NULL
);

-- 4. 架构设计表 (Schemas)
CREATE TABLE schemas (
id SERIAL PRIMARY KEY,
project_id INTEGER NOT NULL,
requirement_id INTEGER,
ddl_script TEXT,
mermaid_diagram TEXT,
design_report TEXT,
version INTEGER DEFAULT 1,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
FOREIGN KEY (requirement_id) REFERENCES requirements(id) ON DELETE SET NULL
);

-- 5. 对话会话表 (Chats)
CREATE TABLE chats (
id SERIAL PRIMARY KEY,
project_id INTEGER NOT NULL,
title VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP, -- Soft Delete
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 6. 对话消息表 (ChatMessages)
CREATE TABLE chat_messages (
id SERIAL PRIMARY KEY,
chat_id INTEGER NOT NULL,
role VARCHAR(20) NOT NULL,
content TEXT NOT NULL,
meta_data JSONB,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_requirements_project ON requirements(project_id);
CREATE INDEX idx_schemas_project ON schemas(project_id);
CREATE INDEX idx_chats_project ON chats(project_id);
CREATE INDEX idx_chat_messages_chat ON chat_messages(chat_id);

Skill 更新详情
