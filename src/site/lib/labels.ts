import type { ProjectStatus } from '@/content/schema'

export const statusLabel: Record<ProjectStatus, string> = { live: 'Live', wip: 'In progress', planned: 'Planned' }
