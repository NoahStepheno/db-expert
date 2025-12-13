"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

import type {
  Attachment,
  Message,
  Project,
  ProjectDocument,
  ViewMode,
} from "~/types";
import { INITIAL_MESSAGE } from "~/constants";
import { useTRPC } from "~/trpc/react";
import { ModelType, Sender } from "~/types";
import ChatList from "./_components/Chat/ChatList";
import InputBox from "./_components/Chat/InputBox";
import LandingPage from "./_components/LandingPage/LandingPage";
import Header from "./_components/Layout/Header";
import Sidebar from "./_components/Layout/Sidebar";
import DocManager from "./_components/Project/DocManager";
import SchemaVisualizer from "./_components/Project/SchemaVisualizer";

// Default initial project
const DEFAULT_PROJECT_ID = "default-project";
const DEFAULT_SCHEMA = `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int id
        string status
    }`;

export default function ExpertPage() {
  const { mutateAsync } = useMutation(useTRPC().ai.generate.mutationOptions());

  // State: Landing Page
  const [showLanding, setShowLanding] = useState(true);

  // State: Projects
  const [projects, setProjects] = useState<Project[]>([
    {
      id: DEFAULT_PROJECT_ID,
      name: "Demo Project",
      description: "A sample project to explore features.",
      messages: [
        {
          id: "init",
          sender: Sender.AI,
          content: INITIAL_MESSAGE,
          timestamp: Date.now(),
          modelUsed: ModelType.EXPERT,
        },
      ],
      documents: [
        {
          id: "doc-1",
          title: "Requirements",
          content:
            "# Project Requirements\n\n1. User Authentication\n2. Order Processing",
          lastUpdated: Date.now(),
        },
      ],
      schemaCode: DEFAULT_SCHEMA,
    },
  ]);

  // State: UI
  const [activeProjectId, setActiveProjectId] =
    useState<string>(DEFAULT_PROJECT_ID);
  const [activeTab, setActiveTab] = useState<ViewMode>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(
    ModelType.EXPERT,
  );

  // Refs
  const activeRequestIdRef = useRef<string | null>(null);

  // Derived State
  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0]!;

  // --- Project Handlers ---

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      description: "",
      messages: [
        {
          id: uuidv4(),
          sender: Sender.AI,
          content: `Welcome to the **${name}** workspace! I am ready to help you model your domain.`,
          timestamp: Date.now(),
          modelUsed: ModelType.EXPERT,
        },
      ],
      documents: [],
      schemaCode: "",
    };
    setProjects([...projects, newProject]);
    setActiveProjectId(newProject.id);
    setActiveTab("chat");
  };

  const handleUpdateProject = (
    id: string,
    name: string,
    description: string,
  ) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name, description } : p)),
    );
  };

  const handleDeleteProject = (id: string) => {
    const newProjects = projects.filter((p) => p.id !== id);
    if (newProjects.length === 0) return; // Prevent deleting last project
    setProjects(newProjects);
    if (activeProjectId === id) {
      setActiveProjectId(newProjects[0]!.id);
    }
  };

  // --- Chat Handlers ---

  const updateProjectMessages = (
    projectId: string,
    newMessages: Message[] | ((prev: Message[]) => Message[]),
  ) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id !== projectId) return p;
        const updatedMessages =
          typeof newMessages === "function"
            ? newMessages(p.messages)
            : newMessages;

        // OPTIONAL: Simple heuristic to auto-detect Schema code in AI response and update project schema
        // This is a "nice to have" that makes the AI feel integrated
        const lastMsg = updatedMessages[updatedMessages.length - 1];
        let newSchema = p.schemaCode;

        if (lastMsg && lastMsg.sender === Sender.AI && !lastMsg.isThinking) {
          const mermaidMatch = /```mermaid\n([\s\S]*?)```/.exec(
            lastMsg.content,
          );
          if (mermaidMatch?.[1]) {
            // We found a diagram. Let's update the schema view automatically if it's an ERD
            if (
              mermaidMatch[1].includes("erDiagram") ||
              mermaidMatch[1].includes("classDiagram")
            ) {
              newSchema = mermaidMatch[1];
            }
          }
        }

        return { ...p, messages: updatedMessages, schemaCode: newSchema };
      }),
    );
  };

  const handleSendMessage = async (
    text: string,
    model: ModelType,
    attachments: Attachment[],
  ) => {
    const currentProjectId = activeProjectId; // Capture current ID
    const projectHistory = activeProject.messages;

    // 1. Add User Message
    const userMessage: Message = {
      id: uuidv4(),
      sender: Sender.USER,
      content: text,
      timestamp: Date.now(),
      attachments: attachments,
    };

    updateProjectMessages(currentProjectId, (prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Generate Request ID
    const currentRequestId = uuidv4();
    activeRequestIdRef.current = currentRequestId;

    try {
      // 2. Add Thinking State
      const thinkingId = "temp-loading";
      updateProjectMessages(currentProjectId, (prev) => [
        ...prev,
        {
          id: thinkingId,
          sender: Sender.AI,
          content: "",
          timestamp: Date.now(),
          isThinking: true,
          modelUsed: model,
        },
      ]);

      // 3. API Call
      // Construct history including the new user message
      const historyToSend = [...projectHistory, userMessage];
      const result = await mutateAsync({
        text,
        modelType: model,
        history: historyToSend,
        attachments,
      });
      const responseText = result.text;

      // 4. Update with Response
      if (activeRequestIdRef.current === currentRequestId) {
        updateProjectMessages(currentProjectId, (prev) =>
          prev.map((msg) =>
            msg.id === thinkingId
              ? {
                  ...msg,
                  id: uuidv4(),
                  content: responseText,
                  isThinking: false,
                  modelUsed: model,
                }
              : msg,
          ),
        );
        setIsLoading(false);
        activeRequestIdRef.current = null;
      }
    } catch (error) {
      if (activeRequestIdRef.current === currentRequestId) {
        updateProjectMessages(currentProjectId, (prev) =>
          prev
            .filter((msg) => msg.id !== "temp-loading")
            .concat({
              id: uuidv4(),
              sender: Sender.AI,
              content: `**Error:** ${(error as Error).message}`,
              timestamp: Date.now(),
              modelUsed: model,
            }),
        );
        setIsLoading(false);
        activeRequestIdRef.current = null;
      }
    }
  };

  const handleStopGeneration = () => {
    if (isLoading && activeRequestIdRef.current) {
      activeRequestIdRef.current = null;
      setIsLoading(false);
      // Currently we can't truly cancel the backend request unless we use AbortSignal with TRPC,
      // but we can stop showing the loading state.
      updateProjectMessages(activeProjectId, (prev) =>
        prev.map((msg) =>
          msg.id === "temp-loading"
            ? {
                ...msg,
                id: uuidv4(),
                content: "_(Stopped)_",
                isThinking: false,
              }
            : msg,
        ),
      );
    }
  };

  // --- Doc Handlers ---

  const handleAddDoc = (title: string, content: string) => {
    const newDoc: ProjectDocument = {
      id: uuidv4(),
      title,
      content,
      lastUpdated: Date.now(),
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? { ...p, documents: [...p.documents, newDoc] }
          : p,
      ),
    );
  };

  const handleUpdateDoc = (docId: string, content: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              documents: p.documents.map((d) =>
                d.id === docId ? { ...d, content, lastUpdated: Date.now() } : d,
              ),
            }
          : p,
      ),
    );
  };

  const handleDeleteDoc = (docId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? { ...p, documents: p.documents.filter((d) => d.id !== docId) }
          : p,
      ),
    );
  };

  // --- Schema Handlers ---
  const handleUpdateSchema = (code: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId ? { ...p, schemaCode: code } : p,
      ),
    );
  };

  // Render Landing Page if active
  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  // Render Main App
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <div className="shrink-0 border-b border-gray-200 bg-white">
          <Header activeProject={activeProject} />
          {/* Project Toolbar / Tabs */}
          <div className="flex items-end gap-6 px-6 pt-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${activeTab === "chat" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              <i className="fa-regular fa-comments mr-2"></i>Expert Chat
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${activeTab === "docs" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              <i className="fa-regular fa-file-lines mr-2"></i>Documents
            </button>
            <button
              onClick={() => setActiveTab("schema")}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${activeTab === "schema" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              <i className="fa-solid fa-diagram-project mr-2"></i>Table
              Structure (UML)
            </button>
          </div>
        </div>

        {/* View Content */}
        <div className="relative flex-1 overflow-hidden">
          {/* Chat View */}
          <div
            className={`absolute inset-0 flex flex-col ${activeTab === "chat" ? "z-10" : "invisible z-0"}`}
          >
            <div className="flex flex-1 flex-col overflow-hidden">
              <ChatList messages={activeProject.messages} />
            </div>
            <InputBox
              onSend={handleSendMessage}
              onStop={handleStopGeneration}
              isLoading={isLoading}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>

          {/* Docs View */}
          {activeTab === "docs" && (
            <div className="absolute inset-0 z-10">
              <DocManager
                documents={activeProject.documents}
                onAddDoc={handleAddDoc}
                onUpdateDoc={handleUpdateDoc}
                onDeleteDoc={handleDeleteDoc}
              />
            </div>
          )}

          {/* Schema View */}
          {activeTab === "schema" && (
            <div className="absolute inset-0 z-10">
              <SchemaVisualizer
                code={activeProject.schemaCode}
                onUpdate={handleUpdateSchema}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
