'use client';

import { useElectionStore } from '@/lib/election';
import { ROLE_LABELS, STATUS_COLORS } from '@/lib/election';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  MapPin,
  Building2,
  UserCheck,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Vote,
} from 'lucide-react';

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Voter:
    'As a registered voter, you can search for your voter information, view your polling station details, and check published election results.',
  APO:
    'As an Assistant Presiding Officer, you are responsible for entering vote counts at your assigned polling station. You can search voters and view results.',
  PO:
    'As a Presiding Officer, you verify vote records submitted by APOs at your assigned station. You can also enter votes, search voters, and view results.',
  ARO:
    'As an Assistant Returning Officer, you consolidate results across all polling stations in your assigned constituency. You can verify entries and manage the consolidation process.',
  RO:
    'As the Returning Officer, you approve the final consolidated results for your constituency. Once approved, results can be published to the public.',
  Admin:
    'As the System Administrator, you have full access to manage all master data including constituencies, polling stations, candidates, voters, and officers. You can also view audit logs and reset all data.',
};

export default function HomeTab() {
  const { data, currentRole, currentOfficer } = useElectionStore();

  const totalVoters = data.voters.length;
  const totalStations = data.pollingStations.length;
  const totalConstituencies = data.constituencies.length;
  const totalCandidates = data.candidates.length;

  const submittedCount = data.voteRecords.filter(
    (r) => r.status === 'submitted'
  ).length;
  const verifiedCount = data.voteRecords.filter(
    (r) => r.status === 'verified'
  ).length;
  const rejectedCount = data.voteRecords.filter(
    (r) => r.status === 'rejected'
  ).length;
  const approvedCount = data.constituencies.filter(
    (c) => c.status === 'approved'
  ).length;
  const consolidatedCount = data.constituencies.filter(
    (c) => c.status === 'consolidated'
  ).length;

  // Jurisdiction info
  let jurisdictionInfo: React.ReactNode = null;
  if (currentOfficer) {
    if (currentOfficer.jurisdictionType === 'station') {
      const station = data.pollingStations.find(
        (s) => s.id === currentOfficer.jurisdictionId
      );
      const constituency = station
        ? data.constituencies.find((c) => c.id === station.constituencyId)
        : null;
      jurisdictionInfo = (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="size-5 text-emerald-600" />
              Your Jurisdiction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Station:</span>
              <span className="font-medium">{station?.name ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{station?.location ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Constituency:</span>
              <span className="font-medium">{constituency?.name ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <Badge className={STATUS_COLORS[currentRole] ?? ''}>
                {ROLE_LABELS[currentRole]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    } else if (currentOfficer.jurisdictionType === 'constituency') {
      const constituency = data.constituencies.find(
        (c) => c.id === currentOfficer.jurisdictionId
      );
      const stationCount = data.pollingStations.filter(
        (s) => s.constituencyId === currentOfficer.jurisdictionId
      ).length;
      jurisdictionInfo = (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="size-5 text-emerald-600" />
              Your Jurisdiction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Constituency:</span>
              <span className="font-medium">{constituency?.name ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Polling Stations:</span>
              <span className="font-medium">{stationCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <Badge className={STATUS_COLORS[currentRole] ?? ''}>
                {ROLE_LABELS[currentRole]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="size-6 text-emerald-600" />
            Welcome, {ROLE_LABELS[currentRole]}
          </CardTitle>
          <CardDescription>{ROLE_DESCRIPTIONS[currentRole]}</CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
            <Users className="size-8 text-emerald-600" />
            <span className="text-2xl font-bold">{totalVoters}</span>
            <span className="text-xs text-muted-foreground">Registered Voters</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
            <MapPin className="size-8 text-emerald-600" />
            <span className="text-2xl font-bold">{totalStations}</span>
            <span className="text-xs text-muted-foreground">Polling Stations</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
            <Building2 className="size-8 text-emerald-600" />
            <span className="text-2xl font-bold">{totalConstituencies}</span>
            <span className="text-xs text-muted-foreground">Constituencies</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
            <UserCheck className="size-8 text-emerald-600" />
            <span className="text-2xl font-bold">{totalCandidates}</span>
            <span className="text-xs text-muted-foreground">Candidates</span>
          </CardContent>
        </Card>
      </div>

      {/* Jurisdiction Info (non-Voter) */}
      {jurisdictionInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jurisdictionInfo}
        </div>
      )}

      {/* Admin Dashboard */}
      {(currentRole === 'Admin' ||
        currentRole === 'ARO' ||
        currentRole === 'RO') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Vote className="size-5 text-emerald-600" />
              Election Progress Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <FileCheck className="size-4 text-blue-500" /> Submitted
                  </span>
                  <span className="font-semibold">{submittedCount}</span>
                </div>
                <Progress
                  value={
                    totalStations
                      ? (submittedCount / totalStations) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-4 text-green-500" /> Verified
                  </span>
                  <span className="font-semibold">{verifiedCount}</span>
                </div>
                <Progress
                  value={
                    totalStations
                      ? (verifiedCount / totalStations) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-4 text-emerald-500" /> Approved
                  </span>
                  <span className="font-semibold">
                    {approvedCount} / {totalConstituencies}
                  </span>
                </div>
                <Progress
                  value={
                    totalConstituencies
                      ? (approvedCount / totalConstituencies) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
            </div>
            {rejectedCount > 0 && (
              <p className="text-sm text-red-500">
                <strong>{rejectedCount}</strong> station(s) rejected and need
                resubmission.
              </p>
            )}
            {consolidatedCount > 0 && approvedCount === 0 && (
              <p className="text-sm text-blue-500">
                <strong>{consolidatedCount}</strong> constituency(ies) consolidated and
                awaiting approval.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
