'use client';

import { useElectionStore, getConsolidatedResult, STATUS_COLORS } from '@/lib/election';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Trophy, Lock, BarChart3 } from 'lucide-react';

export default function PublicResults() {
  const { data } = useElectionStore();

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="size-5 text-emerald-600" />
            Published Election Results
          </CardTitle>
          <CardDescription>
            Results are published only after approval by the Returning Officer.
          </CardDescription>
        </CardHeader>
      </Card>

      {data.constituencies.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No constituencies configured.
          </CardContent>
        </Card>
      )}

      {data.constituencies.map((con) => {
        const isApproved = con.status === 'approved';
        const consolidated = getConsolidatedResult(data, con.id);

        return (
          <Card key={con.id} className={isApproved ? 'border-emerald-200' : 'border-gray-200'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{con.name}</CardTitle>
                <Badge className={STATUS_COLORS[con.status ?? 'pending'] ?? ''}>
                  {isApproved
                    ? 'Published'
                    : (con.status ?? 'pending').charAt(0).toUpperCase() +
                      (con.status ?? 'pending').slice(1)}
                </Badge>
              </div>
              {isApproved && (
                <CardDescription>
                  {consolidated.stationsVerified}/{consolidated.stationsTotal}{' '}
                  stations verified &bull; {consolidated.totalVotes} total votes
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {isApproved ? (
                <div className="space-y-4">
                  {/* Candidate Bar Chart */}
                  <div className="space-y-3">
                    {[...consolidated.candidateTotals]
                      .sort((a, b) => b.votes - a.votes)
                      .map((ct, idx) => {
                        const maxVotes = Math.max(
                          ...consolidated.candidateTotals.map((c) => c.votes),
                          1
                        );
                        const pct =
                          consolidated.totalValidVotes > 0
                            ? (
                                (ct.votes / consolidated.totalValidVotes) *
                                100
                              ).toFixed(1)
                            : '0.0';
                        const barWidth = (ct.votes / maxVotes) * 100;
                        const isWinner = idx === 0 && ct.votes > 0;

                        return (
                          <div key={ct.candidateId} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                {isWinner && (
                                  <Trophy className="size-4 text-emerald-600" />
                                )}
                                <span className="font-medium">
                                  {ct.candidateName}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {ct.party}
                                </Badge>
                                {isWinner && (
                                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                                    Winner
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold">
                                  {ct.votes} votes
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  ({pct}%)
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isWinner
                                    ? 'bg-emerald-500'
                                    : 'bg-emerald-300'
                                }`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3 text-sm text-center">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Valid Votes
                      </p>
                      <p className="font-bold text-lg">
                        {consolidated.totalValidVotes}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Rejected
                      </p>
                      <p className="font-bold text-lg text-red-600">
                        {consolidated.totalRejectedBallots}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Total
                      </p>
                      <p className="font-bold text-lg">
                        {consolidated.totalVotes}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground py-4">
                  <Lock className="size-5" />
                  <span className="text-sm">
                    Results not yet published. The Returning Officer has not
                    approved the results for this constituency.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
