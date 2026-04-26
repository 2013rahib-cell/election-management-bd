'use client';

import { useState } from 'react';
import { useElectionStore } from '@/lib/election';
import { Voter } from '@/lib/election';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, User, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export default function VoterSearch() {
  const { data } = useElectionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<Voter | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    const trimmed = searchTerm.trim().toLowerCase();
    const found =
      data.voters.find((v) => v.voterId.toLowerCase() === trimmed) ??
      data.voters.find((v) => v.nid === trimmed);
    setResult(found ?? null);
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const constituency = result
    ? data.constituencies.find((c) => c.id === result.constituencyId)
    : null;
  const station = result
    ? data.pollingStations.find((s) => s.id === result.stationId)
    : null;
  const booth = result
    ? data.pollingBooths.find((b) => b.id === result.boothId)
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="size-5 text-emerald-600" />
            Voter Search
          </CardTitle>
          <CardDescription>
            Enter a Voter ID or National ID to look up voter information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Voter ID or National ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700">
              <Search className="size-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && !result && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-3">
            <XCircle className="size-6 text-red-500 shrink-0" />
            <div>
              <p className="font-medium text-red-700">Voter Not Found</p>
              <p className="text-sm text-red-600">
                No voter registered with the ID &quot;{searchTerm}&quot;. Please
                check the ID and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="size-5 text-emerald-600" />
              Voter Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Full Name</span>
                <p className="font-semibold text-base">{result.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Voter ID</span>
                <p className="font-semibold text-base">{result.voterId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">National ID</span>
                <p className="font-semibold text-base">{result.nid}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Constituency</span>
                <p className="font-semibold text-base">
                  {constituency?.name ?? 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Polling Station</span>
                <p className="font-semibold text-base">
                  {station?.name ?? 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Booth</span>
                <p className="font-semibold text-base">
                  {booth?.boothNo ?? 'N/A'}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Voting Status:</span>
              {result.hasVoted ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="size-3 mr-1" />
                  Voted
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <XCircle className="size-3 mr-1" />
                  Not Voted
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {result && station && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="size-5 text-emerald-600" />
              Polling Station Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Station Name:</span>
              <span className="font-medium">{station.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{station.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Constituency:</span>
              <span className="font-medium">{constituency?.name ?? 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
