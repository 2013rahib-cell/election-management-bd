// ============================================================
// Election Management System – Bangladesh
// localStorage CRUD Operations & Data Access Layer
// ============================================================

import { ElectionData, VoteRecord, AuditLog, CandidateVoteEntry, Role, Officer } from './types';
import { SEED_DATA } from './seed-data';

const STORAGE_KEY = 'bd_election_data';

// ---- Initialize / Load Data ----

export function initializeData(): ElectionData {
  if (typeof window === 'undefined') return SEED_DATA;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as ElectionData;
    } catch {
      console.warn('Corrupted localStorage data, re-seeding...');
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
  return SEED_DATA;
}

export function saveData(data: ElectionData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): ElectionData {
  if (typeof window === 'undefined') return SEED_DATA;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
  return SEED_DATA;
}

export function loadData(): ElectionData | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ElectionData;
  } catch {
    return null;
  }
}

// ---- Audit Log Helper ----

export function createAuditLog(
  data: ElectionData,
  actorId: string,
  actorName: string,
  actorRole: string,
  action: string,
  remarks?: string
): AuditLog {
  const log: AuditLog = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actorId,
    actorName,
    actorRole,
    action,
    timestamp: new Date().toISOString(),
    remarks,
  };
  data.auditLogs.unshift(log); // newest first
  return log;
}

// ---- ID Generator ----

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ---- Vote Record Helpers ----

export function getVoteRecordForStation(data: ElectionData, stationId: string): VoteRecord | undefined {
  return data.voteRecords.find((r) => r.stationId === stationId);
}

export function calculateTotalVotes(candidateVotes: CandidateVoteEntry[], rejectedBallots: number): number {
  return candidateVotes.reduce((sum, cv) => sum + cv.votes, 0) + rejectedBallots;
}

// ---- Role Permission Matrix ----

export const ROLE_TABS: Record<Role, string[]> = {
  Voter: ['home', 'voter-search', 'public-results'],
  APO: ['home', 'voter-search', 'vote-entry', 'public-results'],
  PO: ['home', 'voter-search', 'vote-entry', 'station-verification', 'public-results'],
  ARO: ['home', 'voter-search', 'vote-entry', 'station-verification', 'consolidation', 'public-results'],
  RO: ['home', 'voter-search', 'vote-entry', 'station-verification', 'consolidation', 'approval', 'public-results'],
  Admin: ['home', 'voter-search', 'vote-entry', 'station-verification', 'consolidation', 'approval', 'public-results', 'admin-panel'],
};

// ---- Role Label Map ----

export const ROLE_LABELS: Record<Role, string> = {
  Voter: 'Voter',
  APO: 'Assistant Presiding Officer (APO)',
  PO: 'Presiding Officer (PO)',
  ARO: 'Assistant Returning Officer (ARO)',
  RO: 'Returning Officer (RO)',
  Admin: 'System Administrator',
};

// ---- Tab Labels ----

export const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  'voter-search': 'Voter Search',
  'vote-entry': 'Vote Entry',
  'station-verification': 'Verification',
  consolidation: 'Consolidation',
  approval: 'Approval',
  'public-results': 'Public Results',
  'admin-panel': 'Admin Panel',
};

// ---- Get Officer by Role ----

export function getOfficersByRole(data: ElectionData, role: string): Officer[] {
  return data.officers.filter((o) => o.role === role);
}

// ---- Get Default Officer for a Role (first match) ----

export function getDefaultOfficer(data: ElectionData, role: Role): Officer | undefined {
  return data.officers.find((o) => o.role === role);
}

// ---- Consolidated Result Helpers ----

export interface ConsolidatedResult {
  constituencyId: string;
  constituencyName: string;
  candidateTotals: { candidateId: string; candidateName: string; party: string; symbol: string; votes: number }[];
  totalIssuedBallots: number;
  totalRejectedBallots: number;
  totalValidVotes: number;
  totalVotes: number;
  stationsVerified: number;
  stationsTotal: number;
  leadingCandidate: { candidateId: string; candidateName: string; party: string; votes: number } | null;
  allVerified: boolean;
}

export function getConsolidatedResult(data: ElectionData, constituencyId: string): ConsolidatedResult {
  const constituency = data.constituencies.find((c) => c.id === constituencyId)!;
  const stations = data.pollingStations.filter((s) => s.constituencyId === constituencyId);
  const candidates = data.candidates.filter((c) => c.constituencyId === constituencyId);

  const verifiedRecords = data.voteRecords.filter(
    (r) => r.constituencyId === constituencyId && r.status === 'verified'
  );

  const candidateTotals = candidates.map((c) => {
    const votes = verifiedRecords.reduce((sum, r) => {
      const entry = r.candidateVotes.find((cv) => cv.candidateId === c.id);
      return sum + (entry?.votes || 0);
    }, 0);
    return {
      candidateId: c.id,
      candidateName: c.name,
      party: c.party,
      symbol: c.symbol,
      votes,
    };
  });

  const totalIssuedBallots = verifiedRecords.reduce((s, r) => s + r.issuedBallots, 0);
  const totalRejectedBallots = verifiedRecords.reduce((s, r) => s + r.rejectedBallots, 0);
  const totalValidVotes = candidateTotals.reduce((s, ct) => s + ct.votes, 0);
  const totalVotes = totalValidVotes + totalRejectedBallots;

  const sorted = [...candidateTotals].sort((a, b) => b.votes - a.votes);
  const leadingCandidate = sorted[0]?.votes > 0 ? sorted[0] : null;

  return {
    constituencyId,
    constituencyName: constituency.name,
    candidateTotals,
    totalIssuedBallots,
    totalRejectedBallots,
    totalValidVotes,
    totalVotes,
    stationsVerified: verifiedRecords.length,
    stationsTotal: stations.length,
    leadingCandidate,
    allVerified: verifiedRecords.length === stations.length,
  };
}

// ---- Status badge helpers ----

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-200 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  approved: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-yellow-100 text-yellow-800',
  consolidated: 'bg-blue-100 text-blue-800',
  missing: 'bg-gray-100 text-gray-600',
};
