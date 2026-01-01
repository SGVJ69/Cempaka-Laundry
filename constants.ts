
import { Machine, MachineStatus, MachineType } from './types';

export const INITIAL_MACHINES: Machine[] = [
  { id: 'w1', name: 'Washer 1', type: MachineType.WASHER, status: MachineStatus.AVAILABLE, capacityKg: 8 },
  { id: 'w2', name: 'Washer 2', type: MachineType.WASHER, status: MachineStatus.BUSY, remainingMinutes: 15, capacityKg: 8 },
  { id: 'w3', name: 'Washer 3', type: MachineType.WASHER, status: MachineStatus.AVAILABLE, capacityKg: 10 },
  { id: 'w4', name: 'Washer 4', type: MachineType.WASHER, status: MachineStatus.BUSY, remainingMinutes: 5, capacityKg: 8 },
  { id: 'd1', name: 'Dryer 1', type: MachineType.DRYER, status: MachineStatus.AVAILABLE, capacityKg: 10 },
  { id: 'd2', name: 'Dryer 2', type: MachineType.DRYER, status: MachineStatus.AVAILABLE, capacityKg: 10 },
  { id: 'd3', name: 'Dryer 3', type: MachineType.DRYER, status: MachineStatus.AVAILABLE, capacityKg: 10 },
  { id: 'd4', name: 'Dryer 4', type: MachineType.DRYER, status: MachineStatus.BUSY, remainingMinutes: 22, capacityKg: 10 },
];

export const SYSTEM_INSTRUCTION = `
You are the Cempaka Laundry AI Fabric Expert. 
Your goal is to provide visual tutorials and expert advice for college students.
Focus on:
1. Identifying fabrics from images.
2. Explaining laundry labels.
3. Providing stain removal bullet points.
Keep responses concise, instructional, and matching the app's clean minimalist aesthetic.
`;
