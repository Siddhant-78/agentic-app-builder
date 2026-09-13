"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import type { FileData, Message, WorkspaceUser, WorkspaceData } from "@/types/workspace";
import { checkUser } from "@/lib/checkUser";

export type { WorkspaceUser, WorkspaceData } from "@/types/workspace";

// ─── Get the current authenticated user ──────────────────────────────────────

export async function getWorkspaceUser(): Promise<WorkspaceUser> {
  const user = await checkUser();
  if (!user) redirect("/");

  return {
    id: user.id,
    credits: user.credits,
    plan: user.plan,
  };
}

// ─── Get a workspace by id (must belong to the current user) ─────────────────

export async function getWorkspaceById(
  workspaceId: string,
  userId: string
): Promise<WorkspaceData> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId, userId },
    select: {
      id: true,
      title: true,
      messages: true,
      fileData: true,
    },
  });

  if (!workspace) redirect("/");

  return {
    ...workspace,
    messages: (Array.isArray(workspace.messages)
      ? workspace.messages
      : []) as unknown as Message[],
    fileData: (workspace.fileData ?? {
      files: {},
      dependencies: {},
    }) as unknown as FileData,
  };
}