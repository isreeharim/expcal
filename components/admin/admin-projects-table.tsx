'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { Search, X, ExternalLink, SearchX } from 'lucide-react'

interface AdminProjectsTableProps {
  projects: Array<{
    id: string
    title: string
    description: string | null
    color: string | null
    created_at: string
    profiles?: { full_name?: string | null } | Array<{ full_name?: string | null }> | null
  }>
  entries: Array<{
    project_id: string
  }>
}

export function AdminProjectsTable({ projects, entries }: AdminProjectsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const entryCountMap = useMemo(() => {
    const map = new Map<string, number>()
    entries.forEach(e => {
      map.set(e.project_id, (map.get(e.project_id) || 0) + 1)
    })
    return map
  }, [entries])

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return projects

    return projects.filter(p => {
      const ownerProfile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
      const ownerName = (ownerProfile?.full_name || '').toLowerCase()
      const titleMatch = p.title.toLowerCase().includes(q)
      const descMatch = (p.description || '').toLowerCase().includes(q)
      const ownerMatch = ownerName.includes(q)
      return titleMatch || descMatch || ownerMatch
    })
  }, [projects, searchQuery])

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative group max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by project title, owner, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-muted/40 border-border/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 rounded-xl h-11 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {searchQuery && (
        <div className="text-xs text-muted-foreground px-1">
          Showing <strong>{filteredProjects.length}</strong> of {projects.length} projects
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-x-auto w-full rounded-2xl border border-border/80 shadow-xl">
        {filteredProjects.length === 0 ? (
          <div className="p-10 text-center">
            <SearchX className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">No projects matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-primary mt-2 hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <Table className="premium-table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Project</TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Owner</TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Created Date</TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Entries</TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((proj) => {
                const entryCount = entryCountMap.get(proj.id) || 0
                const ownerProfile = Array.isArray(proj.profiles) ? proj.profiles[0] : proj.profiles
                const ownerName = ownerProfile?.full_name || 'Unknown Owner'
                return (
                  <TableRow key={proj.id} className="border-border/60">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: proj.color || '#6366f1' }} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{proj.title}</p>
                          {proj.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{proj.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ownerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(proj.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {entryCount} entries
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/project/${proj.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors p-2 -m-2 min-h-[36px]"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
