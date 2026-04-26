'use client';

import { useMemo } from 'react';
import {
  useElectionStore,
  getConsolidatedResult,
  getVoteRecordForStation,
  createAuditLog,
  STATUS_COLORS,
} from '@/lib/election';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Save,
  Trophy,
  MapPin,
} from 'lucide-react';

export default function Consolidation() {
  const { data, currentOfficer, updateData } = useElectionStore();

  const constituencyId = currentOfficer?.jurisdictionType === 'constituency'
    ? currentOfficer.jurisdictionId
    : null;

  const constituency = constituencyId
    ? data.constituencies.find((c) => c.id === constituencyId)
    : null;

  const stations = constituencyId
    ? data.pollingStations.filter(
        (s) => s.constituencyId === constituencyId
      )
    : [];

  const consolidated = constituencyId
    ? getConsolidatedResult(data, constituencyId)
    : null;

  const isAlreadyConsolidated =
    constituency?.status === 'consolidated' ||
    constituency?.status === 'approved';

  const handleSave = () => {
    if (!constituencyId || !currentOfficer || !constituency) return;

    updateData((d) => {
      const idx = d.constituencies.findIndex(
        (c) => c.id === constituencyId
      );
      if (idx >= 0) {
        d.constituencies[idx] = {
          ...d.constituencies[idx],
          status: 'consolidated',
        };
      }
      createAuditLog(
        d,
        currentOfficer.id,
        currentOfficer.name,
        currentOfficer.role,
        `Consolidated results for ${constituency.name}`,
        `${consolidated?.stationsVerified ?? 0}/${stations.length} stations verified, ${consolidated?.totalVotes ?? 0} total votes`
      );
      return { ...d };
    });
  };

  if (!constituency) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <p className="text-yellow-700 font-medium">
            No constituency assigned. Please contact the administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="size-5 text-emerald-600" />
            Result Consolidation — {constituency.name}
          </CardTitle>
          <CardDescription>
            Review and consolidate verified vote records from all polling
            stations in this constituency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[constituency.status ?? 'pending'] ?? ''}>
              {(constituency.status ?? 'pending').charAt(0).toUpperCase() +
                (constituency.status ?? 'pending').slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Station Status Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="size-5 text-emerald-600" />
            Station Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((s) => {
                const record = getVoteRecordForStation(data, s.id);
                const status = record?.status ?? 'missing';
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.location}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[status] ?? ''}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-2">
            <Progress
              value={
                consolidated
                  ? (consolidated.stationsVerified / consolidated.stationsTotal) * 100
                  : 0
              }
              className="h-2"
            />
            <p className="text-sm text-muted-foreground">
              {consolidated?.stationsVerified ?? 0} of {stations.length}{' '}
              stations verified
              {!consolidated?.allVerified && (
                <span className="text-yellow-600 ml-1">
                  — Only verified stations are included in aggregation.
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aggregated Results */}
      {consolidated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aggregated Candidate Results</CardTitle>
            <CardDescription>
              Total votes from {consolidated.stationsVerified} verified station(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...consolidated.candidateTotals]
                  .sort((a, b) => b.votes - a.votes)
                  .map((ct) => {
                    const pct =
                      consolidated.totalValidVotes > 0
                        ? ((ct.votes / consolidated.totalValidVotes) * 100).toFixed(1)
                        : '0.0';
                    const isLeading =
                      consolidated.leadingCandidate?.candidateId === ct.candidateId;
                    return (
                      <TableRow
                        key={ct.candidateId}
                        className={isLeading ? 'bg-emerald-50' : ''}
                      >
                        <TableCell className="font-medium">
                          {isLeading && (
                            <Trophy className="size-4 text-emerald-600 inline mr-1" />
                          )}
                          {ct.candidateName}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {ct.party}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {ct.votes}
                        </TableCell>
                        <TableCell className="text-right">{pct}%</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-muted-foreground">Total Valid Votes</span>
                <p className="text-xl font-bold">
                  {consolidated.totalValidVotes}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-muted-foreground">Rejected Ballots</span>
                <p className="text-xl font-bold text-red-600">
                  {consolidated.totalRejectedBallots}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-muted-foreground">Total Issued Ballots</span>
                <p className="text-xl font-bold">
                  {consolidated.totalIssuedBallots}
                </p>
              </div>
            </div>

            {consolidated.leadingCandidate && (
              <Alert className="mt-4 border-emerald-200 bg-emerald-50">
                <Trophy className="size-4 text-emerald-600" />
                <AlertTitle>Leading Candidate</AlertTitle>
                <AlertDescription>
                  <strong>{consolidated.leadingCandidate.candidateName}</strong> ({consolidated.leadingCandidate.party}) with{' '}
                  <strong>{consolidated.leadingCandidate.votes}</strong> votes.
                </AlertDescription>
              </Alert>
            )}

            {!consolidated.allVerified && (
              <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                <AlertTriangle className="size-4 text-yellow-600" />
                <AlertTitle>Not All Stations Verified</AlertTitle>
                <AlertDescription>
                  Only verified stations are counted.{' '}
                  {consolidated.stationsTotal - consolidated.stationsVerified}{' '}
                  station(s) still need verification.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Card>
        <CardContent className="p-6 space-y-3">
          {isAlreadyConsolidated ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-600" />
              <span className="font-medium text-green-700">
                Results have been consolidated and{' '}
                {constituency.status === 'approved' ? 'approved' : 'saved'}.
                {constituency.status === 'consolidated' &&
                  ' Awaiting RO approval.'}
              </span>
            </div>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={consolidated?.stationsVerified === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="size-4 mr-2" />
                Save Aggregation
              </Button>
              <p className="text-xs text-muted-foreground">
                This will mark the constituency as consolidated. The RO can then
                approve the results for publication.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
