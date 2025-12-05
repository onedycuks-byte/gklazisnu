export interface Region {
  id: string;
  name: string;
  coordinator: string;
  phone: string;
}

export interface Donation {
  id: string;
  regionId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface RegionSummary extends Region {
  totalDonations: number;
  donationCount: number;
}
