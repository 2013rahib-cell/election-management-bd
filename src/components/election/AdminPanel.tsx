'use client';

import { useState, useCallback } from 'react';
import {
  useElectionStore,
  createAuditLog,
  generateId,
  getOfficersByRole,
  STATUS_COLORS,
} from '@/lib/election';
import type {
  Constituency,
  PollingStation,
  PollingBooth,
  Candidate,
  Voter,
  Officer,
  AuditLog,
} from '@/lib/election';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  MapPin,
  Building2,
  UserCheck,
  Shield,
  ClipboardList,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
} from 'lucide-react';

export default function AdminPanel() {
  const { data, currentOfficer, updateData, resetAllData } = useElectionStore();
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const dismissMessage = () => setMessage(null);

  return (
    <div className="space-y-6">
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
          <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>
            {message.text}
            <button
              onClick={dismissMessage}
              className="ml-2 underline text-xs"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Accordion
        type="single"
        collapsible
        value={activeSection}
        onValueChange={setActiveSection}
      >
        {/* Dashboard */}
        <AccordionItem value="dashboard">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <LayoutDashboard className="size-4" /> Admin Dashboard
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <DashboardSection data={data} />
          </AccordionContent>
        </AccordionItem>

        {/* Constituencies */}
        <AccordionItem value="constituencies">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Building2 className="size-4" /> Constituencies ({data.constituencies.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ConstituencySection data={data} updateData={updateData} currentOfficer={currentOfficer} onMessage={setMessage} />
          </AccordionContent>
        </AccordionItem>

        {/* Polling Stations */}
        <AccordionItem value="stations">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" /> Polling Stations ({data.pollingStations.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <StationSection data={data} updateData={updateData} currentOfficer={currentOfficer} onMessage={setMessage} />
          </AccordionContent>
        </AccordionItem>

        {/* Booths */}
        <AccordionItem value="booths">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <ClipboardList className="size-4" /> Polling Booths ({data.pollingBooths.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <BoothSection data={data} updateData={updateData} currentOfficer={currentOfficer} onMessage={setMessage} />
          </AccordionContent>
        </AccordionItem>

        {/* Candidates */}
        <AccordionItem value="candidates">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <UserCheck className="size-4" /> Candidates ({data.candidates.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <CandidateSection data={data} updateData={updateData} currentOfficer={currentOfficer} onMessage={setMessage} />
          </AccordionContent>
        </AccordionItem>

        {/* Voters */}
        <AccordionItem value="voters">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Users className="size-4" /> Voters ({data.voters.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <VoterSection data={data} updateData={updateData} currentOfficer={currentOfficer} onMessage={setMessage} />
          </AccordionContent>
        </AccordionItem>

        {/* Officers */}
        <AccordionItem value="officers">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Shield className="size-4" /> Officers ({data.officers.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <OfficerSection data={data} updateData={updateData} currentOfficer={currentOfficer} onMessage={setMessage} />
          </AccordionContent>
        </AccordionItem>

        {/* Audit Logs */}
        <AccordionItem value="audit">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <ClipboardList className="size-4" /> Audit Logs ({data.auditLogs.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <AuditLogSection logs={data.auditLogs} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Reset All Data */}
      <Card className="border-red-200">
        <CardContent className="p-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <RotateCcw className="size-4 mr-2" />
                Reset All Data to Seed
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all vote records, audit logs, and
                  reset all entities to their original seed data. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetAllData();
                    setMessage({
                      type: 'success',
                      text: 'All data has been reset to seed values.',
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirm Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs text-muted-foreground mt-2">
            This will clear all vote records, audit logs, and restore original seed data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---- Dashboard Section ---- */
function DashboardSection({ data }: { data: import('@/lib/election').ElectionData }) {
  const totalVoters = data.voters.length;
  const votesCounted = data.voteRecords.filter(
    (r) => r.status === 'verified' || r.status === 'approved'
  ).length;
  const stationsVerified = data.voteRecords.filter(
    (r) => r.status === 'verified'
  ).length;
  const constituenciesPublished = data.constituencies.filter(
    (c) => c.status === 'approved'
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
          <Users className="size-6 text-emerald-600" />
          <span className="text-xl font-bold">{totalVoters}</span>
          <span className="text-xs text-muted-foreground">Registered Voters</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
          <ClipboardList className="size-6 text-blue-600" />
          <span className="text-xl font-bold">{votesCounted}</span>
          <span className="text-xs text-muted-foreground">Records Verified/Approved</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
          <CheckCircle2 className="size-6 text-green-600" />
          <span className="text-xl font-bold">{stationsVerified}</span>
          <span className="text-xs text-muted-foreground">Stations Verified</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
          <Building2 className="size-6 text-emerald-600" />
          <span className="text-xl font-bold">{constituenciesPublished}</span>
          <span className="text-xs text-muted-foreground">Published</span>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---- Audit Log Section ---- */
function AuditLogSection({ logs }: { logs: AuditLog[] }) {
  return (
    <ScrollArea className="max-h-96">
      {logs.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No audit logs yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-normal">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">{log.actorName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.actorRole}</Badge>
                </TableCell>
                <TableCell className="text-sm">{log.action}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-normal max-w-48">
                  {log.remarks ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ScrollArea>
  );
}

/* ---- Generic helpers ---- */
interface SectionProps {
  data: import('@/lib/election').ElectionData;
  updateData: (updater: (data: import('@/lib/election').ElectionData) => import('@/lib/election').ElectionData) => void;
  currentOfficer: import('@/lib/election').Officer | null;
  onMessage: (msg: { type: 'success' | 'error'; text: string }) => void;
}

/* ---- Constituency Section ---- */
function ConstituencySection({ data, updateData, currentOfficer, onMessage }: SectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '' });

  const log = useCallback(
    (d: import('@/lib/election').ElectionData, action: string, remarks?: string) => {
      if (currentOfficer) {
        createAuditLog(d, currentOfficer.id, currentOfficer.name, currentOfficer.role, action, remarks);
      }
    },
    [currentOfficer]
  );

  const startAdd = () => {
    setEditing('new');
    setFormData({ id: generateId('CON'), name: '' });
  };

  const startEdit = (c: Constituency) => {
    setEditing(c.id);
    setFormData({ id: c.id, name: c.name });
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    const name = formData.name.trim();
    updateData((d) => {
      if (editing === 'new') {
        d.constituencies.push({ id: formData.id, name });
        log(d, `Added constituency: ${name}`);
      } else {
        const idx = d.constituencies.findIndex((c) => c.id === editing);
        if (idx >= 0) d.constituencies[idx].name = name;
        log(d, `Updated constituency: ${name}`);
      }
      return { ...d };
    });
    setEditing(null);
    onMessage({ type: 'success', text: editing === 'new' ? 'Constituency added.' : 'Constituency updated.' });
  };

  const handleDelete = (id: string) => {
    const deps = data.pollingStations.filter((s) => s.constituencyId === id).length;
    if (deps > 0) {
      onMessage({ type: 'error', text: `Cannot delete: ${deps} polling station(s) depend on this constituency.` });
      return;
    }
    const con = data.constituencies.find((c) => c.id === id);
    updateData((d) => {
      d.constituencies = d.constituencies.filter((c) => c.id !== id);
      log(d, `Deleted constituency: ${con?.name ?? id}`);
      return { ...d };
    });
    onMessage({ type: 'success', text: 'Constituency deleted.' });
  };

  return (
    <div className="space-y-3">
      <Button onClick={startAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
        <Plus className="size-3 mr-1" /> Add Constituency
      </Button>
      <ScrollArea className="max-h-60">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.constituencies.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs font-mono">{c.id}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><Badge className={STATUS_COLORS[c.status ?? 'pending'] ?? ''}>{(c.status ?? 'pending').charAt(0).toUpperCase() + (c.status ?? 'pending').slice(1)}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(c)}><Pencil className="size-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="size-3 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Add Constituency' : 'Edit Constituency'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>ID</Label>
            <Input value={formData.id} disabled />
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Station Section ---- */
function StationSection({ data, updateData, currentOfficer, onMessage }: SectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', location: '', constituencyId: '' });

  const log = useCallback(
    (d: import('@/lib/election').ElectionData, action: string, remarks?: string) => {
      if (currentOfficer) createAuditLog(d, currentOfficer.id, currentOfficer.name, currentOfficer.role, action, remarks);
    },
    [currentOfficer]
  );

  const startAdd = () => {
    setEditing('new');
    setFormData({ id: generateId('STA'), name: '', location: '', constituencyId: data.constituencies[0]?.id ?? '' });
  };
  const startEdit = (s: PollingStation) => {
    setEditing(s.id);
    setFormData({ id: s.id, name: s.name, location: s.location, constituencyId: s.constituencyId });
  };
  const handleSave = () => {
    if (!formData.name.trim() || !formData.constituencyId) return;
    updateData((d) => {
      const entry = { id: formData.id, name: formData.name.trim(), location: formData.location.trim(), constituencyId: formData.constituencyId };
      if (editing === 'new') {
        d.pollingStations.push(entry);
        log(d, `Added station: ${entry.name}`);
      } else {
        const idx = d.pollingStations.findIndex((s) => s.id === editing);
        if (idx >= 0) d.pollingStations[idx] = entry;
        log(d, `Updated station: ${entry.name}`);
      }
      return { ...d };
    });
    setEditing(null);
    onMessage({ type: 'success', text: editing === 'new' ? 'Station added.' : 'Station updated.' });
  };
  const handleDelete = (id: string) => {
    const boothDeps = data.pollingBooths.filter((b) => b.stationId === id).length;
    const voterDeps = data.voters.filter((v) => v.stationId === id).length;
    const recordDeps = data.voteRecords.filter((r) => r.stationId === id).length;
    if (boothDeps + voterDeps + recordDeps > 0) {
      onMessage({ type: 'error', text: `Cannot delete: ${boothDeps} booth(s), ${voterDeps} voter(s), ${recordDeps} record(s) depend on this station.` });
      return;
    }
    const st = data.pollingStations.find((s) => s.id === id);
    updateData((d) => {
      d.pollingStations = d.pollingStations.filter((s) => s.id !== id);
      log(d, `Deleted station: ${st?.name ?? id}`);
      return { ...d };
    });
    onMessage({ type: 'success', text: 'Station deleted.' });
  };

  return (
    <div className="space-y-3">
      <Button onClick={startAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="size-3 mr-1" /> Add Station</Button>
      <ScrollArea className="max-h-60">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Constituency</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.pollingStations.map((s) => {
              const con = data.constituencies.find((c) => c.id === s.constituencyId);
              return (
                <TableRow key={s.id}>
                  <TableCell className="text-xs font-mono">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm">{con?.name ?? 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(s)}><Pencil className="size-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="size-3 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing === 'new' ? 'Add Station' : 'Edit Station'}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>ID</Label><Input value={formData.id} disabled />
            <Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <Label>Constituency</Label>
            <Select value={formData.constituencyId} onValueChange={(v) => setFormData({ ...formData, constituencyId: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {data.constituencies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Booth Section ---- */
function BoothSection({ data, updateData, currentOfficer, onMessage }: SectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ id: '', boothNo: '', stationId: '' });

  const log = useCallback(
    (d: import('@/lib/election').ElectionData, action: string) => {
      if (currentOfficer) createAuditLog(d, currentOfficer.id, currentOfficer.name, currentOfficer.role, action);
    },
    [currentOfficer]
  );

  const startAdd = () => {
    setEditing('new');
    setFormData({ id: generateId('BOO'), boothNo: '', stationId: data.pollingStations[0]?.id ?? '' });
  };
  const startEdit = (b: PollingBooth) => {
    setEditing(b.id);
    setFormData({ id: b.id, boothNo: b.boothNo, stationId: b.stationId });
  };
  const handleSave = () => {
    if (!formData.boothNo.trim() || !formData.stationId) return;
    updateData((d) => {
      const entry = { id: formData.id, boothNo: formData.boothNo.trim(), stationId: formData.stationId };
      if (editing === 'new') {
        d.pollingBooths.push(entry);
        log(d, `Added booth: ${entry.boothNo}`);
      } else {
        const idx = d.pollingBooths.findIndex((b) => b.id === editing);
        if (idx >= 0) d.pollingBooths[idx] = entry;
        log(d, `Updated booth: ${entry.boothNo}`);
      }
      return { ...d };
    });
    setEditing(null);
    onMessage({ type: 'success', text: editing === 'new' ? 'Booth added.' : 'Booth updated.' });
  };
  const handleDelete = (id: string) => {
    const deps = data.voters.filter((v) => v.boothId === id).length;
    if (deps > 0) {
      onMessage({ type: 'error', text: `Cannot delete: ${deps} voter(s) depend on this booth.` });
      return;
    }
    const bo = data.pollingBooths.find((b) => b.id === id);
    updateData((d) => {
      d.pollingBooths = d.pollingBooths.filter((b) => b.id !== id);
      log(d, `Deleted booth: ${bo?.boothNo ?? id}`);
      return { ...d };
    });
    onMessage({ type: 'success', text: 'Booth deleted.' });
  };

  return (
    <div className="space-y-3">
      <Button onClick={startAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="size-3 mr-1" /> Add Booth</Button>
      <ScrollArea className="max-h-60">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Booth No</TableHead><TableHead>Station</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.pollingBooths.map((b) => {
              const st = data.pollingStations.find((s) => s.id === b.stationId);
              return (
                <TableRow key={b.id}>
                  <TableCell className="text-xs font-mono">{b.id}</TableCell>
                  <TableCell className="font-medium">{b.boothNo}</TableCell>
                  <TableCell className="text-sm">{st?.name ?? 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(b)}><Pencil className="size-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)}><Trash2 className="size-3 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing === 'new' ? 'Add Booth' : 'Edit Booth'}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>ID</Label><Input value={formData.id} disabled />
            <Label>Booth Number</Label><Input value={formData.boothNo} onChange={(e) => setFormData({ ...formData, boothNo: e.target.value })} />
            <Label>Station</Label>
            <Select value={formData.stationId} onValueChange={(v) => setFormData({ ...formData, stationId: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {data.pollingStations.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Candidate Section ---- */
function CandidateSection({ data, updateData, currentOfficer, onMessage }: SectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', party: '', symbol: '', constituencyId: '' });

  const log = useCallback(
    (d: import('@/lib/election').ElectionData, action: string) => {
      if (currentOfficer) createAuditLog(d, currentOfficer.id, currentOfficer.name, currentOfficer.role, action);
    },
    [currentOfficer]
  );

  const startAdd = () => {
    setEditing('new');
    setFormData({ id: generateId('CAN'), name: '', party: '', symbol: '', constituencyId: data.constituencies[0]?.id ?? '' });
  };
  const startEdit = (c: Candidate) => {
    setEditing(c.id);
    setFormData({ id: c.id, name: c.name, party: c.party, symbol: c.symbol, constituencyId: c.constituencyId });
  };
  const handleSave = () => {
    if (!formData.name.trim() || !formData.constituencyId) return;
    updateData((d) => {
      const entry = { id: formData.id, name: formData.name.trim(), party: formData.party.trim(), symbol: formData.symbol.trim(), constituencyId: formData.constituencyId };
      if (editing === 'new') {
        d.candidates.push(entry);
        log(d, `Added candidate: ${entry.name}`);
      } else {
        const idx = d.candidates.findIndex((c) => c.id === editing);
        if (idx >= 0) d.candidates[idx] = entry;
        log(d, `Updated candidate: ${entry.name}`);
      }
      return { ...d };
    });
    setEditing(null);
    onMessage({ type: 'success', text: editing === 'new' ? 'Candidate added.' : 'Candidate updated.' });
  };
  const handleDelete = (id: string) => {
    const ca = data.candidates.find((c) => c.id === id);
    updateData((d) => {
      d.candidates = d.candidates.filter((c) => c.id !== id);
      log(d, `Deleted candidate: ${ca?.name ?? id}`);
      return { ...d };
    });
    onMessage({ type: 'success', text: 'Candidate deleted.' });
  };

  return (
    <div className="space-y-3">
      <Button onClick={startAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="size-3 mr-1" /> Add Candidate</Button>
      <ScrollArea className="max-h-60">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Party</TableHead><TableHead>Symbol</TableHead><TableHead>Constituency</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.candidates.map((c) => {
              const con = data.constituencies.find((co) => co.id === c.constituencyId);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.party}</TableCell>
                  <TableCell><Badge variant="outline">{c.symbol}</Badge></TableCell>
                  <TableCell className="text-sm">{con?.name ?? 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(c)}><Pencil className="size-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="size-3 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing === 'new' ? 'Add Candidate' : 'Edit Candidate'}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>ID</Label><Input value={formData.id} disabled />
            <Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Label>Party</Label><Input value={formData.party} onChange={(e) => setFormData({ ...formData, party: e.target.value })} />
            <Label>Symbol</Label><Input value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} />
            <Label>Constituency</Label>
            <Select value={formData.constituencyId} onValueChange={(v) => setFormData({ ...formData, constituencyId: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {data.constituencies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Voter Section ---- */
function VoterSection({ data, updateData, currentOfficer, onMessage }: SectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    voterId: '', nid: '', name: '', constituencyId: '', stationId: '', boothId: '',
  });

  const log = useCallback(
    (d: import('@/lib/election').ElectionData, action: string) => {
      if (currentOfficer) createAuditLog(d, currentOfficer.id, currentOfficer.name, currentOfficer.role, action);
    },
    [currentOfficer]
  );

  const filteredStations = formData.constituencyId
    ? data.pollingStations.filter((s) => s.constituencyId === formData.constituencyId)
    : [];
  const filteredBooths = formData.stationId
    ? data.pollingBooths.filter((b) => b.stationId === formData.stationId)
    : [];

  const startAdd = () => {
    setEditing('new');
    setFormData({
      voterId: generateId('VOT'), nid: '', name: '',
      constituencyId: data.constituencies[0]?.id ?? '',
      stationId: data.pollingStations[0]?.id ?? '',
      boothId: data.pollingBooths[0]?.id ?? '',
    });
  };
  const startEdit = (v: Voter) => {
    setEditing(v.voterId);
    setFormData({
      voterId: v.voterId, nid: v.nid, name: v.name,
      constituencyId: v.constituencyId, stationId: v.stationId, boothId: v.boothId,
    });
  };
  const handleSave = () => {
    if (!formData.name.trim() || !formData.nid.trim()) return;
    updateData((d) => {
      const entry: Voter = {
        voterId: formData.voterId, nid: formData.nid.trim(), name: formData.name.trim(),
        constituencyId: formData.constituencyId, stationId: formData.stationId, boothId: formData.boothId, hasVoted: false,
      };
      if (editing === 'new') {
        d.voters.push(entry);
        log(d, `Added voter: ${entry.name}`);
      } else {
        const idx = d.voters.findIndex((v) => v.voterId === editing);
        if (idx >= 0) d.voters[idx] = { ...entry, hasVoted: d.voters[idx].hasVoted };
        log(d, `Updated voter: ${entry.name}`);
      }
      return { ...d };
    });
    setEditing(null);
    onMessage({ type: 'success', text: editing === 'new' ? 'Voter added.' : 'Voter updated.' });
  };
  const handleDelete = (id: string) => {
    const vo = data.voters.find((v) => v.voterId === id);
    updateData((d) => {
      d.voters = d.voters.filter((v) => v.voterId !== id);
      log(d, `Deleted voter: ${vo?.name ?? id}`);
      return { ...d };
    });
    onMessage({ type: 'success', text: 'Voter deleted.' });
  };

  return (
    <div className="space-y-3">
      <Button onClick={startAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="size-3 mr-1" /> Add Voter</Button>
      <ScrollArea className="max-h-60">
        <Table>
          <TableHeader><TableRow><TableHead>Voter ID</TableHead><TableHead>Name</TableHead><TableHead>NID</TableHead><TableHead>Station</TableHead><TableHead>Voted</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.voters.map((v) => {
              const st = data.pollingStations.find((s) => s.id === v.stationId);
              return (
                <TableRow key={v.voterId}>
                  <TableCell className="text-xs font-mono">{v.voterId}</TableCell>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="text-sm">{v.nid}</TableCell>
                  <TableCell className="text-sm">{st?.name ?? 'N/A'}</TableCell>
                  <TableCell>{v.hasVoted ? <Badge className="bg-green-100 text-green-800">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(v)}><Pencil className="size-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(v.voterId)}><Trash2 className="size-3 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing === 'new' ? 'Add Voter' : 'Edit Voter'}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Voter ID</Label><Input value={formData.voterId} disabled />
            <Label>National ID</Label><Input value={formData.nid} onChange={(e) => setFormData({ ...formData, nid: e.target.value })} />
            <Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Label>Constituency</Label>
            <Select value={formData.constituencyId} onValueChange={(v) => setFormData({ ...formData, constituencyId: v, stationId: '', boothId: '' })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {data.constituencies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Label>Station</Label>
            <Select value={formData.stationId} onValueChange={(v) => setFormData({ ...formData, stationId: v, boothId: '' })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {filteredStations.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Label>Booth</Label>
            <Select value={formData.boothId} onValueChange={(v) => setFormData({ ...formData, boothId: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {filteredBooths.map((b) => <SelectItem key={b.id} value={b.id}>{b.boothNo}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Officer Section ---- */
function OfficerSection({ data, updateData, currentOfficer, onMessage }: SectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '', name: '', role: 'APO' as string, jurisdictionId: '', jurisdictionType: 'station' as string,
  });

  const log = useCallback(
    (d: import('@/lib/election').ElectionData, action: string) => {
      if (currentOfficer) createAuditLog(d, currentOfficer.id, currentOfficer.name, currentOfficer.role, action);
    },
    [currentOfficer]
  );

  const filteredStations = formData.jurisdictionType === 'station' ? data.pollingStations : [];

  const startAdd = () => {
    setEditing('new');
    setFormData({
      id: generateId('OFF'), name: '', role: 'APO',
      jurisdictionId: data.pollingStations[0]?.id ?? '', jurisdictionType: 'station',
    });
  };
  const startEdit = (o: Officer) => {
    setEditing(o.id);
    setFormData({ id: o.id, name: o.name, role: o.role, jurisdictionId: o.jurisdictionId, jurisdictionType: o.jurisdictionType });
  };
  const handleSave = () => {
    if (!formData.name.trim() || !formData.jurisdictionId) return;
    updateData((d) => {
      const entry: Officer = {
        id: formData.id, name: formData.name.trim(),
        role: formData.role as Officer['role'],
        jurisdictionId: formData.jurisdictionId,
        jurisdictionType: formData.jurisdictionType as Officer['jurisdictionType'],
      };
      if (editing === 'new') {
        d.officers.push(entry);
        log(d, `Added officer: ${entry.name} (${entry.role})`);
      } else {
        const idx = d.officers.findIndex((o) => o.id === editing);
        if (idx >= 0) d.officers[idx] = entry;
        log(d, `Updated officer: ${entry.name} (${entry.role})`);
      }
      return { ...d };
    });
    setEditing(null);
    onMessage({ type: 'success', text: editing === 'new' ? 'Officer added.' : 'Officer updated.' });
  };
  const handleDelete = (id: string) => {
    if (currentOfficer && currentOfficer.id === id) {
      onMessage({ type: 'error', text: 'Cannot delete your own officer account.' });
      return;
    }
    const of = data.officers.find((o) => o.id === id);
    updateData((d) => {
      d.officers = d.officers.filter((o) => o.id !== id);
      log(d, `Deleted officer: ${of?.name ?? id}`);
      return { ...d };
    });
    onMessage({ type: 'success', text: 'Officer deleted.' });
  };

  return (
    <div className="space-y-3">
      <Button onClick={startAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="size-3 mr-1" /> Add Officer</Button>
      <ScrollArea className="max-h-60">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Jurisdiction</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.officers.map((o) => {
              const jName = o.jurisdictionType === 'system'
                ? 'System'
                : o.jurisdictionType === 'station'
                  ? data.pollingStations.find((s) => s.id === o.jurisdictionId)?.name ?? o.jurisdictionId
                  : data.constituencies.find((c) => c.id === o.jurisdictionId)?.name ?? o.jurisdictionId;
              return (
                <TableRow key={o.id}>
                  <TableCell className="text-xs font-mono">{o.id}</TableCell>
                  <TableCell className="font-medium">{o.name}</TableCell>
                  <TableCell><Badge variant="outline">{o.role}</Badge></TableCell>
                  <TableCell className="text-sm">{jName}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(o)}><Pencil className="size-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(o.id)}><Trash2 className="size-3 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing === 'new' ? 'Add Officer' : 'Edit Officer'}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>ID</Label><Input value={formData.id} disabled />
            <Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Label>Role</Label>
            <Select value={formData.role} onValueChange={(v) => {
              const jt = (v === 'ARO' || v === 'RO') ? 'constituency' : v === 'Admin' ? 'system' : 'station';
              setFormData({ ...formData, role: v, jurisdictionType: jt, jurisdictionId: '' });
            }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['APO', 'PO', 'ARO', 'RO', 'Admin'] as const).map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Jurisdiction</Label>
            {formData.jurisdictionType === 'system' ? (
              <Input value="System-wide" disabled />
            ) : formData.jurisdictionType === 'station' ? (
              <Select value={formData.jurisdictionId} onValueChange={(v) => setFormData({ ...formData, jurisdictionId: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {filteredStations.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Select value={formData.jurisdictionId} onValueChange={(v) => setFormData({ ...formData, jurisdictionId: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {data.constituencies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
