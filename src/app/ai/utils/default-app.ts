// Resolve the (org, workspace, project) tuple to pre-select in filter dropdowns.
//
// Order of preference:
//   1. The project flagged `is_default = true` (set in the AI Registry → Projects tab).
//   2. The first active project in the first org's workspaces.
//   3. The first active org-level project (legacy projects with no workspace).
//   4. Just the first org with no project.
//
// Replace per-page `getDefaultAppOrg()` methods that ignored step 1.

export interface OrgWithApps {
  id: string
  name: string
  workspaces?: { id: string; projects?: any[] }[]
  projects?: any[]
}

export interface DefaultSelection {
  org: any | null
  workspace: any | null
  app: any | null
}

export function resolveDefaultAppOrg(orgs: OrgWithApps[]): DefaultSelection {
  if (!orgs || orgs.length === 0) {
    return { org: null, workspace: null, app: null }
  }

  // De-prioritise an org literally named "Default" so user-created orgs win.
  const sortedOrgs = [...orgs].sort((a, b) => {
    if (a.name === 'Default') {return 1}
    if (b.name === 'Default') {return -1}
    return 0
  })

  // 1. Prefer the project marked `is_default`.
  // If multiple orgs each have a default, prefer the most-recently-created
  // project. That keeps the choice deterministic when seeders or admins
  // create new orgs without un-defaulting older ones.
  type Candidate = { org: any; workspace: any; app: any; ts: number }
  const candidates: Candidate[] = []
  for (const org of sortedOrgs) {
    for (const ws of org.workspaces ?? []) {
      for (const p of (ws.projects ?? [])) {
        if (p.is_default && p.is_active !== false) {
          candidates.push({ org, workspace: ws, app: p, ts: Date.parse(p.created_at) || 0 })
        }
      }
    }
    for (const p of (org.projects ?? [])) {
      if (p.is_default && p.is_active !== false) {
        candidates.push({ org, workspace: null, app: p, ts: Date.parse(p.created_at) || 0 })
      }
    }
  }
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.ts - a.ts)              // newest first
    const { org, workspace, app } = candidates[0]
    return { org, workspace, app }
  }

  // 2. Fallback: first active workspace-scoped project.
  for (const org of sortedOrgs) {
    for (const ws of org.workspaces ?? []) {
      const first = (ws.projects ?? []).find((p: any) => p.is_active !== false)
      if (first) {return { org, workspace: ws, app: first }}
    }
    // 3. Org-level projects (legacy).
    const orgFirst = (org.projects ?? []).find((p: any) => p.is_active !== false)
    if (orgFirst) {return { org, workspace: null, app: orgFirst }}
  }

  // 4. Org with no projects.
  const fallbackOrg = sortedOrgs[0]
  return {
    org: fallbackOrg,
    workspace: fallbackOrg.workspaces?.[0] ?? null,
    app: null,
  }
}
