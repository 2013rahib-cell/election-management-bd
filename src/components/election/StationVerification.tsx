'use client';

import { useState, useMemo } from 'react';
import {
  useElectionStore,
  getVoteRecordForStation,
  createAuditLog,
  STATUS_COLORS,
} from '@/lib/election';
import type { VoteRecord } from '@/lib/election';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  UserCheck,
  FileText,
} from 'lucide-react';

interface ValidationRule {
  label: string;
  pass: boolean;
}

export default function StationVerification() {
  const { data, currentOfficer, updateData } = useElectionStore();

  const station = currentOfficer
    ? data.pollingStations.find(
        (s) => s.id === currentOfficer.jurisdictionId
      )
    : null;

  const constituency = station
    ? data.constituencies.find((c) => c.id === station.constituencyId)
    : null;

  const record: VoteRecord | undefined = station
    ? getVoteRecordForStation(data, station.id)
    : undefined;

  const [rejectRemarks, setRejectRemarks] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const candidates = useMemo(
    () =>
      constituency
        ? data.candidates.filter((c) => c.constituencyId === constituency.id)
        : [],
    [constituency, data.candidates]
  );

  const validationRules: ValidationRule[] = useMemo(() => {
    if (!record) return [];
    const cvSum = record.candidateVotes.reduce(
      (s, cv) => s + cv.votes,
      0
    );
    const total = cvSum + record.rejectedBallots;

    return [
      {
        label: 'Issued ballots is greater than 0',
        pass: record.issuedBallots > 0,
      },
      {
        label: 'Total valid votes is greater than 0',
        pass: cvSum > 0,
      },
      {
        label: 'Total votes (valid + rejected) equals issued ballots',
        pass: total === record.issuedBallots,
      },
      {
        label: 'No negative vote counts',
        pass: record.candidateVotes.every((cv) => cv.votes >= 0),
      },
      {
        label: 'Rejected ballots is not negative',
        pass: record.rejectedBallots >= 0,
      },
      {
        label: 'All candidates have vote entries',
        pass: candidates.every((c) =>
          record.candidateVotes.some((cv) => cv.candidateId === c.id)
        ),
      },
    ];
  }, [record, candidates]);

  const allPassed = validationRules.length > 0 && validationRules.every((r) => r.pass);

  const isFinalized =
    record?.status === 'verified' || record?.status === 'approved';

  const handleVerify = () => {
    if (!station || !currentOfficer || !record || !allPassed) return;

    updateData((d) => {
      const idx = d.voteRecords.findIndex(
        (r) => r.stationId === station.id
      );
      if (idx >= 0) {
        d.voteRecords[idx] = { ...d.voteRecords[idx], status: 'verified' };
      }
      createAuditLog(
        d,
        currentOfficer.id,
        currentOfficer.name,
        currentOfficer.role,
        `Verified vote record for station ${station.name}`
      );
      return { ...d };
    });

    setMessage({
      type: 'success',
      text: 'Vote record verified successfully!',
    });
  };

  const handleReject = () => {
    if (!station || !currentOfficer || !record || !rejectRemarks.trim()) return;

    updateData((d) => {
      const idx = d.voteRecords.findIndex(
        (r) => r.stationId === station.id
      );
      if (idx >= 0) {
        d.voteRecords[idx] = {
          ...d.voteRecords[idx],
          status: 'rejected',
          remarks: rejectRemarks.trim(),
        };
      }
      createAuditLog(
        d,
        currentOfficer.id,
        currentOfficer.name,
        currentOfficer.role,
        `Rejected vote record for station ${station.name}`,
        rejectRemarks.trim()
      );
      return { ...d };
    });

    setShowRejectDialog(false);
    setRejectRemarks('');
    setMessage({
      type: 'success',
      text: 'Vote record rejected. APO must resubmit.',
    });
  };

  const handleMarkVotersVoted = () => {
    if (!station || !currentOfficer) return;

    updateData((d) => {
      d.voters = d.voters.map((v) =>
        v.stationId === station.id ? { ...v, hasVoted: true } : v
      );
      createAuditLog(
        d,
        currentOfficer.id,
        currentOfficer.name,
        currentOfficer.role,
        `Marked all voters at station ${station.name} as voted`
      );
      return { ...d };
    });

    setMessage({
      type: 'success',
      text: 'All voters at this station marked as voted.',
    });
  };

  if (!station || !constituency) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <p className="text-yellow-700 font-medium">
            No polling station assigned. Please contact the administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!record) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6 flex items-center gap-3">
          <FileText className="size-6 text-yellow-500" />
          <div>
            <p className="font-medium text-yellow-700">No Vote Record Found</p>
            <p className="text-sm text-yellow-600">
              The APO has not yet submitted a vote record for station{' '}
              <strong>{station.name}</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Station Info */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            Station Verification — {station.name}
          </CardTitle>
          <CardDescription>
            Constituency: {constituency.name} &bull; Location: {station.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge className={STATUS_COLORS[record.status] ?? ''}>
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </Badge>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <Alert
          className={
            message.type === 'success'
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="size-4 text-green-600" />
          ) : (
            <AlertTriangle className="size-4 text-red-600" />
          )}
          <AlertTitle>
            {message.type === 'success' ? 'Success' : 'Error'}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Vote Record Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submitted Vote Record</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Votes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((c) => {
                const cv = record.candidateVotes.find(
                  (v) => v.candidateId === c.id
                );
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.party}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.symbol}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {cv?.votes ?? 0}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-gray-50 font-semibold">
                <TableCell colSpan={3}>Rejected Ballots</TableCell>
                <TableCell className="text-right">
                  {record.rejectedBallots}
                </TableCell>
              </TableRow>
              <TableRow className="bg-emerald-50 font-bold">
                <TableCell colSpan={3}>Issued Ballots / Total</TableCell>
                <TableCell className="text-right">
                  {record.issuedBallots}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {record.remarks && (
            <div className="mt-3 text-sm text-muted-foreground">
              <strong>Remarks:</strong> {record.remarks}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validationRules.map((rule, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {rule.pass ? (
                  <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="size-4 text-red-500 shrink-0" />
                )}
                <span className={rule.pass ? 'text-green-700' : 'text-red-600'}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6 space-y-3">
          {isFinalized ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-600" />
              <span className="font-medium text-green-700">
                This record has been{' '}
                {record.status === 'verified' ? 'verified' : 'approved'}. No
                further actions available.
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleVerify}
                  disabled={!allPassed}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="size-4 mr-2" />
                  Verify Record
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="size-4 mr-2" />
                  Reject Record
                </Button>
              </div>
              {!allPassed && (
                <p className="text-sm text-yellow-600">
                  <AlertTriangle className="size-3 inline mr-1" />
                  Some validation checks failed. Fix the issues before
                  verifying, or reject with remarks.
                </p>
              )}
            </>
          )}

          <Separator />

          <Button
            onClick={handleMarkVotersVoted}
            variant="outline"
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            disabled={record.status !== 'verified'}
          >
            <UserCheck className="size-4 mr-2" />
            Mark Voters as Voted
          </Button>
          <p className="text-xs text-muted-foreground">
            This marks all voters at this station as having voted. Only
            available after verification.
          </p>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vote Record</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this vote record. The APO
              will need to resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectRemarks">Remarks / Reason</Label>
            <Textarea
              id="rejectRemarks"
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectRemarks.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
