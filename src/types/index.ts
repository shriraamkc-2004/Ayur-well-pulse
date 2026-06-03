// Shared TypeScript interfaces for API responses and component state

export interface DoshaProfile {
    vata: number;
    pitta: number;
    kapha: number;
}

export interface UserSummary {
    _id: string;
    fullName: string;
    email: string;
}

export interface PatientRecord {
    _id: string;
    patientId: UserSummary;
    dateOfBirth?: string;
    gender?: string;
    doshaProfile?: DoshaProfile;
    allergies?: string[];
    conditions?: string[];
    lifestyleNotes?: string;
    encryptedMetadata?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DoctorVerification {
    _id: string;
    doctorId: UserSummary;
    registrationNumber: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    certificateUrl?: string;
    govtIdUrl?: string;
    blockchainHash?: string;
    verifiedAt?: string;
    createdAt: string;
}

export interface Message {
    _id: string;
    sender: string;
    receiver: string;
    content: string;
    timestamp: string;
    attachments?: string[];
}

export interface AuditLog {
    _id: string;
    userId: string;
    action: string;
    resourceId: string;
    resourceType: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface BlockchainEntry {
    _id: string;
    transactionHash: string;
    resourceId: string;
    resourceType: string;
    dataHash: string;
    timestamp: string;
}

export interface AdminStats {
    totalUsers: number;
    verifiedDoctors: number;
    pendingVerifications: number;
    recentAuditLogs: AuditLog[];
    recentBlockchainEntries: BlockchainEntry[];
}

export interface DietPlanStats {
    activeClients: number;
    plansSent: number;
    adherenceRate: number;
    pendingReviews: number;
}

export interface PatientListResponse {
    patients: PatientRecord[];
    pagination?: {
        current: number;
        pages: number;
        total: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
