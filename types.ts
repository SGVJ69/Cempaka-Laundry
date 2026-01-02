export enum MachineStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum MachineType {
  WASHER = 'WASHER',
  DRYER = 'DRYER'
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  remainingMinutes?: number;
  capacityKg: number;
}

export interface Booking {
  id: string;
  machineId: string;
  userId: string;
  startTime: Date;
  durationMinutes: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}