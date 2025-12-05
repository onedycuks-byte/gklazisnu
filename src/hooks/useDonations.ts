import { useState, useEffect } from "react";
import { Donation, RegionSummary } from "@/types/donation";
import { regions } from "@/data/regions";

const STORAGE_KEY = "laziznu-donations";

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDonations(JSON.parse(stored));
    }
  }, []);

  const saveDonations = (newDonations: Donation[]) => {
    setDonations(newDonations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDonations));
  };

  const addDonation = (donation: Omit<Donation, "id">) => {
    const newDonation: Donation = {
      ...donation,
      id: `donation-${Date.now()}`,
    };
    saveDonations([...donations, newDonation]);
  };

  const deleteDonation = (id: string) => {
    saveDonations(donations.filter((d) => d.id !== id));
  };

  const getRegionSummaries = (): RegionSummary[] => {
    return regions.map((region) => {
      const regionDonations = donations.filter((d) => d.regionId === region.id);
      const totalDonations = regionDonations.reduce((sum, d) => sum + d.amount, 0);
      return {
        ...region,
        totalDonations,
        donationCount: regionDonations.length,
      };
    });
  };

  const getTotalDonations = () => {
    return donations.reduce((sum, d) => sum + d.amount, 0);
  };

  const getDonationsByRegion = (regionId: string) => {
    return donations.filter((d) => d.regionId === regionId);
  };

  const getRecentDonations = (limit: number = 10) => {
    return [...donations]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  return {
    donations,
    addDonation,
    deleteDonation,
    getRegionSummaries,
    getTotalDonations,
    getDonationsByRegion,
    getRecentDonations,
  };
}
