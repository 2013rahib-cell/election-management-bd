'use client';

import {
  useElectionStore,
  getConsolidatedResult,
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
import { Separator } from '@/components/ui/separator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CheckCircle2,
  AlertTriangle,
  Stamp,
  Trophy,
  Lock,
} from 'lucide-react';

export default function Approval() {
  const { data, currentOfficer, updateData } = useElectionStore();

  const constituencyId =
    currentOfficer?.jurisdictionType === 'constituency'
      ? currentOfficer.jurisdictionId
      : null;

  const constituency = constituencyId
    ? data.constituencies.find((c) => c.id === constituencyId)
    : null;

  const consolidated = constituencyId
    ? getConsolidatedResult(data, constituencyId)
    : null;

  const isApproved = constituency?.status === 'approved';
  const isConsolidated = constituency?.status === 'consolidated';

  const handleApprove = () => {
    if (!constituencyId || !currentOfficer || !constituency || !isConsolidated)
      return;

    updateData((d) => {
      const idx = d.constituencies.findIndex(
        (c) => c.id === constituencyId
      );
      if (idx >= 0) {
        d.constituencies[idx] = {
          ...d.constituencies[idx],
          status: 'approved',
        };
      }
      createAuditLog(
        d,
        currentOfficer.id,
        currentOfficer.name,
        currentOfficer.role,
        `Approved results for ${constituency.name}`,
        `${consolidated?.candidateTotals.length ?? 0} candidates, ${consolidated?.totalVotes ?? 0} total votes`
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
            <Stamp className="size-5 text-emerald-600" />
            Result Approval — {constituency.name}
          </CardTitle>
          <CardDescription>
            Review and approve the consolidated election results for publication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge className={STATUS_COLORS[constituency.status ?? 'pending'] ?? ''}>
            {(constituency.status ?? 'pending').charAt(0).toUpperCase() +
              (constituency.status ?? 'pending').slice(1)}
          </Badge>
        </CardContent>
      </Card>

      {/* Not consolidated warning */}
      {!isConsolidated && !isApproved && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="size-4 text-yellow-600" />
          <AlertTitle>Awaiting Consolidation</AlertTitle>
          <AlertDescription>
            The ARO has not yet consolidated results for this constituency.
            Approval is only available after consolidation is complete.
          </AlertDescription>
        </Alert>
      )}

      {/* Consolidated Results (read-only) */}
      {consolidated && (isConsolidated || isApproved) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Consolidated Results Summary
            </CardTitle>
            <CardDescription>
              {consolidated.stationsVerified} of {consolidated.stationsTotal}{' '}
              stations verified
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
                        ? (
                            (ct.votes / consolidated.totalValidVotes) *
                            100
                          ).toFixed(1)
                        : '0.0';
                    const isLeading =
                      consolidated.leadingCandidate?.candidateId ===
                      ct.candidateId;
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
                <span className="text-muted-foreground">Total Votes</span>
                <p className="text-xl font-bold">
                  {consolidated.totalVotes}
                </p>
              </div>
            </div>

            {consolidated.leadingCandidate && (
              <Alert className="mt-4 border-emerald-200 bg-emerald-50">
                <Trophy className="size-4 text-emerald-600" />
                <AlertTitle>Winning Candidate</AlertTitle>
                <AlertDescription>
                  <strong>
                    {consolidated.leadingCandidate.candidateName}
                  </strong>{' '}
                  ({consolidated.leadingCandidate.party}) with{' '}
                  <strong>{consolidated.leadingCandidate.votes}</strong> votes.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approve Button */}
      <Card>
        <CardContent className="p-6 space-y-3">
          {isApproved ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-600" />
              <span className="font-medium text-green-700">
                Results have been approved and published. This action cannot be
                undone.
              </span>
            </div>
          ) : isConsolidated ? (
            <>
              <Button
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Stamp className="size-4 mr-2" />
                Approve Results
              </Button>
              <p className="text-xs text-muted-foreground">
                Once approved, results will be visible to the public and cannot
                be changed.
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="size-5 text-gray-400" />
              <span className="text-muted-foreground">
                Approval is locked until the ARO consolidates results.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
