// ============================================================
// Election Management System – Bangladesh
// Data Model & TypeScript Types
// ============================================================

export type Role = 'Voter' | 'APO' | 'PO' | 'ARO' | 'RO' | 'Admin';

export type VoteRecordStatus = 'draft' | 'submitted' | 'verified' | 'rejected' | 'approved';

export interface Constituency {
  id: string;
  name: string;
  status?: 'pending' | 'consolidated' | 'approved';
}

export interface PollingStation {
  id: string;
  name: string;
  location: string;
  constituencyId: string;
}

export interface PollingBooth {
  id: string;
  boothNo: string;
  stationId: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  constituencyId: string;
}

export interface Voter {
  voterId: string;
  nid: string;
  name: string;
  constituencyId: string;
  stationId: string;
  boothId: string;
  hasVoted: boolean;
}

export type OfficerRole = 'APO' | 'PO' | 'ARO' | 'RO' | 'Admin';

export interface Officer {
  id: string;
  name: string;
  role: OfficerRole;
  jurisdictionId: string; // stationId for APO/PO, constituencyId for ARO/RO
  jurisdictionType: 'station' | 'constituency' | 'system';
}

export interface CandidateVoteEntry {
  candidateId: string;
  votes: number;
}

export interface VoteRecord {
  id: string;
  stationId: string;
  constituencyId: string;
  issuedBallots: number;
  candidateVotes: CandidateVoteEntry[];
  rejectedBallots: number;
  totalVotes: number;
  status: VoteRecordStatus;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  timestamp: string;
  remarks?: string;
}

export interface ElectionData {
  constituencies: Constituency[];
  pollingStations: PollingStation[];
  pollingBooths: PollingBooth[];
  candidates: Candidate[];
  voters: Voter[];
  officers: Officer[];
  voteRecords: VoteRecord[];
  auditLogs: AuditLog[];
}

// Role -> Tab permissions
export interface RolePermissions {
  [role: string]: string[];
}

// Tab definitions
export type TabId =
  | 'home'
  | 'voter-search'
  | 'vote-entry'
  | 'station-verification'
  | 'consolidation'
  | 'approval'
  | 'public-results'
  | 'admin-panel';
