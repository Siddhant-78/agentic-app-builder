import Link from "next/link";
import { ArrowUpRight, Clock3, MessageSquare } from "lucide-react";
import type { ProjectSummary } from "@/types/project";

interface ProjectCardProps {
  projects: ProjectSummary[];
}

export function ProjectCard({ projects }: ProjectCardProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/workspace?id=${project.id}`}
          className="group rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-colors hover:border-blue-400/30 hover:bg-white/[0.06]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-medium text-white/85">
                {project.title || "Untitled project"}
              </h2>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/35">
                {project.firstPrompt || "No prompt recorded yet."}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition-colors group-hover:text-blue-300" />
          </div>
          <div className="mt-5 flex items-center gap-4 text-[11px] text-white/25">
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3" />
              {project.messageCount} messages
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3 w-3" />
              {project.updatedAt.toLocaleDateString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
