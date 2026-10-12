import type { Account, Category, FireInputs, NetWorthSnapshot, PersonalFinanceData } from '../types'
import { CATEGORIES, categoryMeta } from './categories'
import { DEFAULT_FIRE_INPUTS } from './fireInputs'

/**
 * Backup file format (spec §7, ST1–ST2):
 *   { app: 'yangfan-personal-finance', exportedAt, data: PersonalFinanceData }
 * Imports are untrusted: every field is checked, and nothing is applied unless
 * the whole file is valid.
 */
export const BACKUP_APP = 'yangfan-personal-finance'

export interface BackupFile {
  app: typeof BACKUP_APP
  exportedAt: string
  data: PersonalFinanceData
}

export function serializeBackup(data: PersonalFinanceData, now = new Date()): string {
  const file: BackupFile = { app: BACKUP_APP, exportedAt: now.toISOString(), data }
  return JSON.stringify(file, null, 2)
}

export const backupFileName = (isoDate: string) => `personal-finance-backup-${isoDate}.json`

export type ParseResult =
  | { ok: true; data: PersonalFinanceData; exportedAt: string; counts: { accounts: number; snapshots: number } }
  | { ok: false; error: string }

class Invalid extends Error {}

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id))
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isCents = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

function fail(msg: string): never {
  throw new Invalid(msg)
}

function account(v: unknown, i: number): Account {
  const where = `Account ${i + 1}`
  if (!isObj(v)) fail(`${where} is malformed.`)
  const { id, name, kind, category, balance, invested, liquid, note, createdAt, updatedAt } = v
  if (typeof id !== 'string' || !id) fail(`${where} has no id.`)
  if (typeof name !== 'string' || !name.trim() || name.length > 200) fail(`${where} has an invalid name.`)
  if (typeof category !== 'string' || !CATEGORY_IDS.has(category)) fail(`${where} (“${name}”) has an unknown category.`)
  if (kind !== categoryMeta(category as Category).kind) fail(`${where} (“${name}”) has a kind that doesn't match its category.`)
  if (!isCents(balance)) fail(`${where} (“${name}”) has an invalid balance.`)
  if (typeof invested !== 'boolean' || typeof liquid !== 'boolean') fail(`${where} (“${name}”) has invalid flags.`)
  if (note !== undefined && typeof note !== 'string') fail(`${where} (“${name}”) has an invalid note.`)
  if (typeof createdAt !== 'string' || typeof updatedAt !== 'string') fail(`${where} (“${name}”) has invalid timestamps.`)
  return { id, name, kind: kind as Account['kind'], category: category as Category, balance, invested, liquid, ...(note ? { note } : {}), createdAt, updatedAt }
}

function snapshot(v: unknown, i: number): NetWorthSnapshot {
  const where = `Snapshot ${i + 1}`
  if (!isObj(v)) fail(`${where} is malformed.`)
  const { date, assets, liabilities, invested, liquid, byCategory, note } = v
  if (typeof date !== 'string' || !DATE_RE.test(date)) fail(`${where} has an invalid date.`)
  for (const [k, n] of Object.entries({ assets, liabilities, invested, liquid })) if (!isCents(n)) fail(`${where} (${date}) has an invalid ${k} total.`)
  if (!isObj(byCategory)) fail(`${where} (${date}) has an invalid category breakdown.`)
  for (const [k, n] of Object.entries(byCategory)) if (!CATEGORY_IDS.has(k) || !isCents(n)) fail(`${where} (${date}) has an invalid category breakdown.`)
  if (note !== undefined && typeof note !== 'string') fail(`${where} (${date}) has an invalid note.`)
  return {
    date,
    assets: assets as number,
    liabilities: liabilities as number,
    invested: invested as number,
    liquid: liquid as number,
    byCategory: byCategory as NetWorthSnapshot['byCategory'],
    ...(note ? { note } : {}),
  }
}

function fire(v: unknown): FireInputs {
  if (v === undefined) return { ...DEFAULT_FIRE_INPUTS }
  if (!isObj(v)) fail('FIRE inputs are malformed.')
  const out: FireInputs = { ...DEFAULT_FIRE_INPUTS }
  const required = ['currentAge', 'investedAssets', 'annualContribution', 'contributionGrowthPct', 'annualSpending', 'realReturnPct', 'withdrawalRatePct', 'targetRetirementAge'] as const
  for (const k of required) {
    if (v[k] === undefined) continue // older backups: keep the default
    if (!isNum(v[k])) fail(`FIRE input “${k}” is invalid.`)
    out[k] = v[k]
  }
  for (const k of ['afterTaxIncome', 'partTimeIncome'] as const) {
    if (v[k] === undefined || v[k] === null) continue
    if (!isCents(v[k])) fail(`FIRE input “${k}” is invalid.`)
    out[k] = v[k]
  }
  if (v.projectionMode !== undefined) {
    if (v.projectionMode !== 'full' && v.projectionMode !== 'barista') fail('FIRE projection mode is invalid.')
    out.projectionMode = v.projectionMode
  }
  return out
}

/** Validate an imported file's text. Never throws. */
export function parseBackup(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: "This file isn't valid JSON, so it can't be a backup." }
  }
  try {
    if (!isObj(raw) || raw.app !== BACKUP_APP) fail("This file isn't a Personal Finance backup.")
    const { data, exportedAt } = raw
    if (typeof exportedAt !== 'string' || Number.isNaN(Date.parse(exportedAt))) fail('The backup has no valid export date.')
    if (!isObj(data)) fail('The backup has no data.')
    if (typeof data.schemaVersion !== 'number') fail('The backup has no version.')
    if (data.schemaVersion > 1) fail('This backup was made by a newer version of the app.')
    if (data.schemaVersion !== 1) fail('The backup has an unknown version.')
    if (!Array.isArray(data.accounts)) fail('The backup has no account list.')
    if (!Array.isArray(data.snapshots)) fail('The backup has no snapshot list.')

    const accounts = data.accounts.map(account)
    if (new Set(accounts.map((a) => a.id)).size !== accounts.length) fail('The backup has duplicate account ids.')
    const snapshots = data.snapshots.map(snapshot).sort((a, b) => a.date.localeCompare(b.date))
    if (new Set(snapshots.map((s) => s.date)).size !== snapshots.length) fail('The backup has two snapshots on the same date.')
    if (data.isSampleData !== undefined && typeof data.isSampleData !== 'boolean') fail('The backup has an invalid sample-data flag.')

    return {
      ok: true,
      exportedAt,
      counts: { accounts: accounts.length, snapshots: snapshots.length },
      data: { schemaVersion: 1, accounts, snapshots, fire: fire(data.fire), isSampleData: data.isSampleData === true },
    }
  } catch (e) {
    if (e instanceof Invalid) return { ok: false, error: e.message }
    return { ok: false, error: 'The backup could not be read.' }
  }
}
