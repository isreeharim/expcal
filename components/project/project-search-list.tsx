'use client'

import { useState, useMemo } from 'react'
import { Project } from '@/lib/types'
import { ProjectCard } from '@/components/dashboard/project-card'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { Input } from '@/components/ui/input'
import {
  Search,
  X,
  SlidersHorizontal,
  FolderOpen,
  SearchX,
  ArrowUpDown
} from 'lucide-react'

interface ProjectSearchListProps {
  projects: Project[]
  title?: string
  emptyTitle?: string
  emptyDescription?: string
}

type SortOption = 'newest' | 'oldest' | 'alpha-asc' | 'alpha-desc'

export function ProjectSearchList({
  projects,
  title,
  emptyTitle = 'No projects yet',
  emptyDescription = 'Create your first project to get started.'
}: ProjectSearchListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Filter and sort projects in real time
  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    let result = projects.filter(p => {
      if (!query) return true
      const titleMatch = p.title.toLowerCase().includes(query)
      const descMatch = (p.description || '').toLowerCase().includes(query)
      return titleMatch || descMatch
    })

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sortBy === 'alpha-asc') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'alpha-desc') {
        return b.title.localeCompare(a.title)
      }
      return 0
    })

    return result
  }, [projects, searchQuery, sortBy])

  if (projects.length === 0) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in rounded-3xl border border-border/80">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <FolderOpen className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{emptyTitle}</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">{emptyDescription}</p>
        <CreateProjectDialog />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
          <Input
            type="text"
            placeholder="Search projects by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 rounded-xl h-11 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none h-11 pl-9 pr-8 bg-muted/40 border border-border/80 hover:border-border text-foreground text-xs font-semibold rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha-asc">Title: A → Z</option>
              <option value="alpha-desc">Title: Z → A</option>
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-[10px] text-muted-foreground">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Count / Status Bar */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 animate-fade-in">
          <span>
            Found <strong>{filteredProjects.length}</strong> matching project{filteredProjects.length !== 1 ? 's' : ''} for &quot;<span className="text-foreground">{searchQuery}</span>&quot;
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Projects Grid or No Search Results */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card p-10 sm:p-12 text-center rounded-3xl border border-border/60 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-muted/50 text-muted-foreground border border-border/80">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">No matching projects found</h3>
          <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">
            No projects matched &quot;{searchQuery}&quot;. Try checking for typos or searching a different term.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
