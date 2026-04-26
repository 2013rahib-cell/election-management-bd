'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  useElectionStore,
  getVoteRecordForStation,
  calculateTotalVotes,
  createAuditLog,
  generateId,
  STATUS_COLORS,
} from '@/lib/election';
import type { CandidateVoteEntry } from '@/lib/election';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ClipboardList,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Pencil,
  MapPin,
} from 'lucide-react';

export default function VoteEntry() {
  const { data, currentOfficer, updateData } = useElectionStore();

  const station = currentOfficer
    ? data.pollingStations.find(
        (s) => s.id === currentOfficer.jurisdictionId
      )
    : null;

  const constituency = station
    ? data.constituencies.find((c) => c.id === station.constituencyId)
    : null;

  const candidates = constituency
    ? data.candidates.filter((c) => c.constituencyId === constituency.id)
    : [];

  const existingRecord = station
    ? getVoteRecordForStation(data, station.id)
    : undefined;

  const isReadOnly =
    existingRecord &&
    existingRecord.status !== 'draft' &&
    existingRecord.status !== 'submitted';

  // Derive initial values from record or candidates
  const initialCandidateVotes = useMemo(() => {
    if (existingRecord) {
      const map: Record<string, number> = {};
      existingRecord.candidateVotes.forEach((cv: CandidateVoteEntry) => {
        map[cv.candidateId] = cv.votes;
      });
      return map;
    }
    const map: Record<string, number> = {};
    candidates.forEach((c) => { map[c.id] = 0; });
    return map;
  }, [existingRecord, candidates]);

  // Use a ref to track if we have initialized from the derived values
  const initializedFromRef = useRef<string | null>(null);
  const currentRecordKey = existingRecord?.id ?? 'new';

  // Form state — initialize lazily
  const [issuedBallots, setIssuedBallots] = useState(() =>
    existingRecord?.issuedBallots ?? 0
  );
  const [candidateVotes, setCandidateVotes] = useState<
    Record<string, number>
  >(() => {
    if (existingRecord) {
      const map: Record<string, number> = {};
      existingRecord.candidateVotes.forEach((cv: CandidateVoteEntry) => {
        map[cv.candidateId] = cv.votes;
      });
      return map;
    }
    return {};
  });
  const [rejectedBallots, setRejectedBallots] = useState(() =>
    existingRecord?.rejectedBallots ?? 0
  );
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Sync when record changes (e.g. after submit, or different station)
  if (initializedFromRef.current !== currentRecordKey) {
    initializedFromRef.current = currentRecordKey;
    setIssuedBallots(initialCandidateVotes ? (existingRecord?.issuedBallots ?? 0) : 0);
    setCandidateVotes(initialCandidateVotes);
    setRejectedBallots(existingRecord?.rejectedBallots ?? 0);
  }

  const totalCandidateVotes = useMemo(
    () => Object.values(candidateVotes).reduce((s, v) => s + v, 0),
    [candidateVotes]
  );

  const totalVotes = useMemo(
    () => calculateTotalVotes(
      candidates.map((c) => ({
        candidateId: c.id,
        votes: candidateVotes[c.id] ?? 0,
      })),
      rejectedBallots
    ),
    [candidateVotes, rejectedBallots, candidates]
  );

  const remaining = issuedBallots - totalVotes;
  const isValid =
    issuedBallots > 0 &&
    totalVotes > 0 &&
    totalVotes <= issuedBallots &&
    remaining === 0;

  const hasAllFieldsFilled = candidates.every(
    (c) => (candidateVotes[c.id] ?? 0) >= 0
  );

  const handleCandidateVoteChange = useCallback(
    (candidateId: string, value: string) => {
      const num = Math.max(0, parseInt(value) || 0);
      setCandidateVotes((prev) => ({ ...prev, [candidateId]: num }));
      setMessage(null);
    },
    []
  );

  const handleSubmit = () => {
    if (!station || !constituency || !currentOfficer || !isValid) return;

    const cvEntries: CandidateVoteEntry[] = candidates.map((c) => ({
      candidateId: c.id,
      votes: candidateVotes[c.id] ?? 0,
    }));

    const total = calculateTotalVotes(cvEntries, rejectedBallots);

    updateData((d) => {
      // Create or update vote record
      const existingIdx = d.voteRecords.findIndex(
        (r) => r.stationId === station.id
      );
      const record = {
        id: existingRecord?.id ?? generateId('VREC'),
        stationId: station.id,
        constituencyId: constituency.id,
        issuedBallots,
        candidateVotes: cvEntries,
        rejectedBallots,
        totalVotes: total,
        status: 'submitted' as const,
      };

      if (existingIdx >= 0) {
        d.voteRecords[existingIdx] = record;
      } else {
        d.voteRecords.push(record);
      }

      createAuditLog(
        d,
        currentOfficer.id,
        currentOfficer.name,
        currentOfficer.role,
        `Submitted vote record for station ${station.name}`,
        `Issued: ${issuedBallots}, Total: ${total}, Rejected: ${rejectedBallots}`
      );

      return { ...d };
    });

    setMessage({ type: 'success', text: 'Vote record submitted successfully!' });
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

  return (
    <div className="space-y-6">
      {/* Station Info */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="size-5 text-emerald-600" />
            Vote Entry — {station.name}
          </CardTitle>
          <CardDescription>
            Constituency: {constituency.name} &bull; Location: {station.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingRecord && (
            <Badge className={STATUS_COLORS[existingRecord.status] ?? ''}>
              {existingRecord.status.charAt(0).toUpperCase() +
                existingRecord.status.slice(1)}
            </Badge>
          )}
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="size-5 text-emerald-600" />
            Ballot Count Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuedBallots">Issued Ballots</Label>
              <Input
                id="issuedBallots"
                type="number"
                min={0}
                value={issuedBallots}
                onChange={(e) => {
                  setIssuedBallots(Math.max(0, parseInt(e.target.value) || 0));
                  setMessage(null);
                }}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rejectedBallots">Rejected Ballots</Label>
              <Input
                id="rejectedBallots"
                type="number"
                min={0}
                value={rejectedBallots}
                onChange={(e) => {
                  setRejectedBallots(Math.max(0, parseInt(e.target.value) || 0));
                  setMessage(null);
                }}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <Separator />

          {/* Candidate Votes */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Candidate Votes
            </Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right w-28">Votes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.party}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.symbol}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isReadOnly ? (
                        <span className="font-semibold">
                          {candidateVotes[c.id] ?? 0}
                        </span>
                      ) : (
                        <Input
                          type="number"
                          min={0}
                          value={candidateVotes[c.id] ?? 0}
                          onChange={(e) =>
                            handleCandidateVoteChange(c.id, e.target.value)
                          }
                          className="w-24 text-right ml-auto"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-muted-foreground">Total Valid Votes</span>
              <p className="text-xl font-bold">{totalCandidateVotes}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-muted-foreground">Total Votes (incl. rejected)</span>
              <p className="text-xl font-bold">{totalVotes}</p>
            </div>
            <div
              className={`rounded-lg p-3 ${
                remaining === 0
                  ? 'bg-green-50'
                  : remaining > 0
                    ? 'bg-yellow-50'
                    : 'bg-red-50'
              }`}
            >
              <span className="text-muted-foreground">
                Remaining / Mismatch
              </span>
              <p
                className={`text-xl font-bold ${
                  remaining === 0
                    ? 'text-green-700'
                    : remaining > 0
                      ? 'text-yellow-700'
                      : 'text-red-700'
                }`}
              >
                {remaining}
              </p>
            </div>
          </div>

          {/* Validation hints */}
          {!isReadOnly && (
            <div className="space-y-1 text-sm">
              {issuedBallots === 0 && (
                <p className="text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="size-3" /> Issued ballots must be
                  greater than 0.
                </p>
              )}
              {totalVotes === 0 && issuedBallots > 0 && (
                <p className="text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="size-3" /> Enter votes for at least
                  one candidate.
                </p>
              )}
              {totalVotes > issuedBallots && totalVotes > 0 && (
                <p className="text-red-600 flex items-center gap-1">
                  <AlertTriangle className="size-3" /> Total votes exceed issued
                  ballots!
                </p>
              )}
              {remaining > 0 && totalVotes > 0 && (
                <p className="text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="size-3" /> {remaining} ballot(s)
                  remaining. Total must equal issued ballots.
                </p>
              )}
              {isValid && (
                <p className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> All validations passed.
                  Ready to submit.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isReadOnly ? (
              <Button disabled className="bg-gray-400">
                <Lock className="size-4 mr-2" />
                Record Locked ({existingRecord?.status})
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isValid || !hasAllFieldsFilled}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {existingRecord && existingRecord.status === 'submitted' ? (
                  <>
                    <Pencil className="size-4 mr-2" />
                    Re-Submit
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Submit Vote Record
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
