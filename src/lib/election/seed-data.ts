// ============================================================
// Election Management System – Bangladesh
// Seed Data (Realistic Minimal Dataset)
// ============================================================

import { ElectionData } from './types';

export const SEED_DATA: ElectionData = {
  // ---- Constituencies ----
  constituencies: [
    { id: 'CON-1201', name: 'Dhaka-12' },
    { id: 'CON-1301', name: 'Dhaka-13' },
  ],

  // ---- Polling Stations ----
  pollingStations: [
    { id: 'STA-1201-01', name: 'Dhaka-12-1', location: 'Mirpur DOHS Community Center, Road 2', constituencyId: 'CON-1201' },
    { id: 'STA-1201-02', name: 'Dhaka-12-2', location: 'Rupnagar Government Primary School', constituencyId: 'CON-1201' },
    { id: 'STA-1301-01', name: 'Dhaka-13-1', location: 'Mohammadpur Youth Development Center', constituencyId: 'CON-1301' },
    { id: 'STA-1301-02', name: 'Dhaka-13-2', location: 'Shah Ali Govt. High School', constituencyId: 'CON-1301' },
  ],

  // ---- Polling Booths (2 per station) ----
  pollingBooths: [
    { id: 'BOO-1201-01A', boothNo: 'Booth-1', stationId: 'STA-1201-01' },
    { id: 'BOO-1201-01B', boothNo: 'Booth-2', stationId: 'STA-1201-01' },
    { id: 'BOO-1201-02A', boothNo: 'Booth-1', stationId: 'STA-1201-02' },
    { id: 'BOO-1201-02B', boothNo: 'Booth-2', stationId: 'STA-1201-02' },
    { id: 'BOO-1301-01A', boothNo: 'Booth-1', stationId: 'STA-1301-01' },
    { id: 'BOO-1301-01B', boothNo: 'Booth-2', stationId: 'STA-1301-01' },
    { id: 'BOO-1301-02A', boothNo: 'Booth-1', stationId: 'STA-1301-02' },
    { id: 'BOO-1301-02B', boothNo: 'Booth-2', stationId: 'STA-1301-02' },
  ],

  // ---- Candidates (3+ per constituency) ----
  candidates: [
    // Dhaka-12
    { id: 'CAN-1201-01', name: 'Abdul Karim', party: 'Bangladesh Awami League', symbol: 'Boat', constituencyId: 'CON-1201' },
    { id: 'CAN-1201-02', name: 'Fatema Begum', party: 'Bangladesh Nationalist Party', symbol: 'Sheaf of Paddy', constituencyId: 'CON-1201' },
    { id: 'CAN-1201-03', name: 'Rahim Uddin', party: 'Jatiya Party', symbol: 'Plough', constituencyId: 'CON-1201' },
    // Dhaka-13
    { id: 'CAN-1301-01', name: 'Kamal Hossain', party: 'Bangladesh Awami League', symbol: 'Boat', constituencyId: 'CON-1301' },
    { id: 'CAN-1301-02', name: 'Salma Akter', party: 'Bangladesh Nationalist Party', symbol: 'Sheaf of Paddy', constituencyId: 'CON-1301' },
    { id: 'CAN-1301-03', name: 'Jamil Ahmed', party: 'Jatiya Party', symbol: 'Plough', constituencyId: 'CON-1301' },
    { id: 'CAN-1301-04', name: 'Nusrat Jahan', party: 'Independent', symbol: 'Chair', constituencyId: 'CON-1301' },
  ],

  // ---- Voters (10, distributed across booths) ----
  voters: [
    { voterId: 'VOT-1001', nid: '19950101001', name: 'Ahmed Ali', constituencyId: 'CON-1201', stationId: 'STA-1201-01', boothId: 'BOO-1201-01A', hasVoted: false },
    { voterId: 'VOT-1002', nid: '19950101002', name: 'Rahima Khatun', constituencyId: 'CON-1201', stationId: 'STA-1201-01', boothId: 'BOO-1201-01A', hasVoted: false },
    { voterId: 'VOT-1003', nid: '19950101003', name: 'Mohammad Hasan', constituencyId: 'CON-1201', stationId: 'STA-1201-01', boothId: 'BOO-1201-01B', hasVoted: false },
    { voterId: 'VOT-1004', nid: '19950101004', name: 'Nasreen Sultana', constituencyId: 'CON-1201', stationId: 'STA-1201-02', boothId: 'BOO-1201-02A', hasVoted: false },
    { voterId: 'VOT-1005', nid: '19950101005', name: 'Jahangir Alam', constituencyId: 'CON-1201', stationId: 'STA-1201-02', boothId: 'BOO-1201-02B', hasVoted: false },
    { voterId: 'VOT-1006', nid: '19960101001', name: 'Taslima Begum', constituencyId: 'CON-1301', stationId: 'STA-1301-01', boothId: 'BOO-1301-01A', hasVoted: false },
    { voterId: 'VOT-1007', nid: '19960101002', name: 'Imran Hossain', constituencyId: 'CON-1301', stationId: 'STA-1301-01', boothId: 'BOO-1301-01B', hasVoted: false },
    { voterId: 'VOT-1008', nid: '19960101003', name: 'Firoza Akter', constituencyId: 'CON-1301', stationId: 'STA-1301-02', boothId: 'BOO-1301-02A', hasVoted: false },
    { voterId: 'VOT-1009', nid: '19960101004', name: 'Shafiqur Rahman', constituencyId: 'CON-1301', stationId: 'STA-1301-02', boothId: 'BOO-1301-02A', hasVoted: false },
    { voterId: 'VOT-1010', nid: '19960101005', name: 'Momena Begum', constituencyId: 'CON-1301', stationId: 'STA-1301-02', boothId: 'BOO-1301-02B', hasVoted: false },
  ],

  // ---- Officers ----
  officers: [
    // APO – assigned to specific stations
    { id: 'OFF-APO-01', name: 'Enayet Hossain', role: 'APO', jurisdictionId: 'STA-1201-01', jurisdictionType: 'station' },
    { id: 'OFF-APO-02', name: 'Mizanur Rahman', role: 'APO', jurisdictionId: 'STA-1201-02', jurisdictionType: 'station' },
    { id: 'OFF-APO-03', name: 'Shahidul Islam', role: 'APO', jurisdictionId: 'STA-1301-01', jurisdictionType: 'station' },
    { id: 'OFF-APO-04', name: 'Asma Khatun', role: 'APO', jurisdictionId: 'STA-1301-02', jurisdictionType: 'station' },
    // PO – assigned to specific stations
    { id: 'OFF-PO-01', name: 'Kazi Rafiqul', role: 'PO', jurisdictionId: 'STA-1201-01', jurisdictionType: 'station' },
    { id: 'OFF-PO-02', name: 'Nurul Amin', role: 'PO', jurisdictionId: 'STA-1201-02', jurisdictionType: 'station' },
    { id: 'OFF-PO-03', name: 'Rehana Begum', role: 'PO', jurisdictionId: 'STA-1301-01', jurisdictionType: 'station' },
    { id: 'OFF-PO-04', name: 'Mahbub Alam', role: 'PO', jurisdictionId: 'STA-1301-02', jurisdictionType: 'station' },
    // ARO – assigned to constituencies
    { id: 'OFF-ARO-01', name: 'Golam Sarwar', role: 'ARO', jurisdictionId: 'CON-1201', jurisdictionType: 'constituency' },
    { id: 'OFF-ARO-02', name: 'Shamima Akhter', role: 'ARO', jurisdictionId: 'CON-1301', jurisdictionType: 'constituency' },
    // RO – assigned to constituencies
    { id: 'OFF-RO-01', name: 'Mizanur Rahman Khan', role: 'RO', jurisdictionId: 'CON-1201', jurisdictionType: 'constituency' },
    { id: 'OFF-RO-02', name: 'Nazma Begum', role: 'RO', jurisdictionId: 'CON-1301', jurisdictionType: 'constituency' },
    // Admin
    { id: 'OFF-ADM-01', name: 'System Administrator', role: 'Admin', jurisdictionId: 'SYSTEM', jurisdictionType: 'system' },
  ],

  // ---- Vote Records (empty – to be filled by APO) ----
  voteRecords: [],

  // ---- Audit Logs (empty – to be filled during operations) ----
  auditLogs: [],
};
