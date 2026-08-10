'use client'

import { useState, useMemo } from 'react'
import { Project } from '@/lib/types'
import { ProjectCard } from '@/components/dashboard/project-card'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { Input } from '@/components/ui/input'
import { Search, X, FolderOpen, SearchX, ArrowUpDown } from 'lucide-react'

interface ProjectSearchListProps {
  projects: Project[]
  title?: string
  emptyTitle?: string
  emptyDescription?: string
}

type SortOption = 'newest' | 'oldest' | 'alpha-asc' | 'alpha-desc'

export function ProjectSearchList({
  projects,
  emptyTitle = 'No projects yet',
  emptyDescription = 'Create your first project to get started.'
}: ProjectSearchListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const result = projects.filter(project => {
      if (!query) return true
      return project.title.toLowerCase().includes(query) || (project.description || '').toLowerCase().includes(query)
    })

    return [...result].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'alpha-asc') return a.title.localeCompare(b.title)
      return b.title.localeCompare(a.title)
    })
  }, [projects, searchQuery, sortBy])

  if (projects.length === 0) {
    return (
      <div className="card-elevated p-10 sm:p-14 text-center animate-fade-in border border-dashed border-border/80">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40 text-primary shadow-sm">
          <FolderOpen className="h-7 w-7" />
        </div>
        <h3 className="mb-1 text-base font-bold text-foreground">{emptyTitle}</h3>
        <p className="mx-auto mb-6 max-w-sm text-xs leading-relaxed text-muted-foreground">{emptyDescription}</p>
        <CreateProjectDialog />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-xl border-border/80 bg-muted/30 pl-10 pr-10 text-sm transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <label className="relative flex shrink-0 items-center">
          <ArrowUpDown className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort projects"
            className="h-11 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 pl-9 pr-8 text-xs font-semibold text-foreground transition-colors hover:border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-auto"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alpha-asc">Title: A → Z</option>
            <option value="alpha-desc">Title: Z → A</option>
          </select>
        </label>
      </div>

      {searchQuery && (
        <div className="flex items-center justify-between gap-3 px-1 text-xs text-muted-foreground animate-fade-in">
          <span>{filteredProjects.length} matching project{filteredProjects.length !== 1 ? 's' : ''}</span>
          <button onClick={() => setSearchQuery('')} className="font-medium text-primary hover:underline">Clear search</button>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="card-elevated p-10 sm:p-12 text-center animate-fade-in border border-dashed border-border/80">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-foreground">No matching projects</h3>
          <p className="mx-auto mb-5 max-w-xs text-xs leading-relaxed text-muted-foreground">Try a different project name or search term.</p>
          <button onClick={() => setSearchQuery('')} className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15">
            <X className="h-3.5 w-3.5" /> Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </div>
  )
}
