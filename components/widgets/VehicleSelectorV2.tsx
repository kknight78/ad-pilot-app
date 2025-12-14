"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowRight,
  Loader2,
  Car,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Sparkles,
  Clock,
} from "lucide-react";
import { WhatsThis } from "@/components/ui/whats-this";

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  daysOnLot: number;
  imageUrl?: string;
  vin?: string;
  color?: string;
  driveType?: string; // AWD, 4WD, FWD, RWD
}

export interface AdSlot {
  id: string;
  platform: "tiktok" | "facebook" | "youtube" | "instagram";
  themeTopic: string;
  template: string;
  vehicleCount: number; // How many vehicles this ad needs
}

// Recommendation types
interface VehicleRecommendation {
  type: "aged" | "performance" | "budget" | "new_arrivals";
  icon: React.ReactNode;
  title: string;
  description: string;
  vehicleIds: string[];
  actionLabel: string;
}

interface VehicleSelectorV2Props {
  adSlots?: AdSlot[];
  onSelect?: (selections: Record<string, Vehicle[]>) => void;
  onContinue?: (selections: Record<string, Vehicle[]>) => void;
}

// Demo ad slots matching the Ad Plan Table
const demoAdSlots: AdSlot[] = [
  { id: "1", platform: "tiktok", themeTopic: "Holiday Spirit", template: "Deep Dive", vehicleCount: 1 },
  { id: "2", platform: "tiktok", themeTopic: "Holiday Spirit", template: "Deep Dive", vehicleCount: 1 },
  { id: "3", platform: "tiktok", themeTopic: "Winter Ready", template: "Multi-Car", vehicleCount: 3 },
  { id: "4", platform: "facebook", themeTopic: "Holiday Spirit", template: "Carousel", vehicleCount: 4 },
  { id: "5", platform: "facebook", themeTopic: "Family First", template: "Testimonial", vehicleCount: 0 },
  { id: "6", platform: "youtube", themeTopic: "Winter Tire Safety", template: "Capitol Smarts", vehicleCount: 0 },
];

// Fallback vehicles if API is unavailable
const fallbackVehicles: Vehicle[] = [
  { id: "1", year: 2019, make: "Honda", model: "CR-V", price: 22995, mileage: 45000, daysOnLot: 12, driveType: "AWD", vin: "1HGBH41JXMN109186" },
  { id: "2", year: 2020, make: "Toyota", model: "Camry", price: 19995, mileage: 38000, daysOnLot: 8, driveType: "FWD", vin: "4T1B11HK5LU123456" },
  { id: "3", year: 2018, make: "Ford", model: "F-150", price: 28995, mileage: 52000, daysOnLot: 67, driveType: "4WD", vin: "1FTEW1EP5JFB12345" },
  { id: "4", year: 2021, make: "Chevrolet", model: "Equinox", price: 24995, mileage: 28000, daysOnLot: 5, driveType: "AWD", vin: "2GNAXUEV5M6123456" },
  { id: "5", year: 2017, make: "Nissan", model: "Altima", price: 14995, mileage: 115000, daysOnLot: 72, driveType: "FWD", vin: "1N4AL3AP8HC123789" },
  { id: "6", year: 2019, make: "Jeep", model: "Cherokee", price: 21995, mileage: 41000, daysOnLot: 63, driveType: "4WD", vin: "1C4PJMLB0KD123456" },
  { id: "7", year: 2020, make: "Subaru", model: "Outback", price: 26995, mileage: 35000, daysOnLot: 15, driveType: "AWD", vin: "4S4BTAPC5L3123456" },
  { id: "8", year: 2018, make: "Toyota", model: "RAV4", price: 23995, mileage: 98000, daysOnLot: 45, driveType: "AWD", vin: "2T3RFREV7JW123456" },
  { id: "9", year: 2019, make: "Honda", model: "Civic", price: 17995, mileage: 42000, daysOnLot: 28, driveType: "FWD", vin: "2HGFC2F59KH123456" },
  { id: "10", year: 2017, make: "Ford", model: "Escape", price: 16995, mileage: 92000, daysOnLot: 58, driveType: "AWD", vin: "1FMCU9GD5HUA12345" },
  { id: "11", year: 2020, make: "Mazda", model: "CX-5", price: 25995, mileage: 32000, daysOnLot: 10, driveType: "AWD", vin: "JM3KFBCM5L0123456" },
  { id: "12", year: 2019, make: "Hyundai", model: "Tucson", price: 20995, mileage: 39000, daysOnLot: 22, driveType: "AWD", vin: "KM8J3CA46KU123456" },
];

const platformConfig = {
  tiktok: {
    name: "TikTok",
    icon: "▶",
    bgColor: "bg-black",
    textColor: "text-white",
    borderColor: "border-gray-800",
    headerBg: "bg-gray-900",
    headerText: "text-white",
  },
  facebook: {
    name: "Facebook",
    icon: "f",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    borderColor: "border-blue-500",
    headerBg: "bg-blue-600",
    headerText: "text-white",
  },
  youtube: {
    name: "YouTube",
    icon: "▷",
    bgColor: "bg-red-600",
    textColor: "text-white",
    borderColor: "border-red-500",
    headerBg: "bg-red-600",
    headerText: "text-white",
  },
  instagram: {
    name: "Instagram",
    icon: "◎",
    bgColor: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    textColor: "text-white",
    borderColor: "border-pink-400",
    headerBg: "bg-gradient-to-r from-purple-600 to-pink-500",
    headerText: "text-white",
  },
};

// Text-only chip components (no backgrounds)
function UrgencyText({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
      ‼️ {children}
    </span>
  );
}

function PositiveText({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
      ✅ {children}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: keyof typeof platformConfig }) {
  const config = platformConfig[platform];
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded ${config.bgColor} ${config.textColor} text-xs font-bold`}
    >
      {config.icon}
    </span>
  );
}

// Generate contextual recommendations based on inventory
function generateRecommendations(vehicles: Vehicle[]): VehicleRecommendation[] {
  const recommendations: VehicleRecommendation[] = [];

  // 1. Aged inventory (45+ days on lot)
  const agedVehicles = vehicles.filter(v => v.daysOnLot >= 45);
  if (agedVehicles.length > 0) {
    recommendations.push({
      type: "aged",
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      title: `${agedVehicles.length} vehicles have been on lot 45+ days`,
      description: "Moving older inventory frees up space and these are priced to sell",
      vehicleIds: agedVehicles.map(v => v.id),
      actionLabel: "Show These",
    });
  }

  // 2. SUVs/Crossovers perform well (mock performance data)
  const suvTypes = ["CR-V", "RAV4", "Equinox", "Cherokee", "Outback", "CX-5", "Tucson", "Escape"];
  const suvs = vehicles.filter(v => suvTypes.some(s => v.model.includes(s)));
  if (suvs.length >= 3) {
    recommendations.push({
      type: "performance",
      icon: <TrendingUp className="w-4 h-4 text-green-600" />,
      title: "Your SUV videos get 2x more engagement",
      description: "Featuring SUVs tends to perform well for your audience",
      vehicleIds: suvs.map(v => v.id),
      actionLabel: "Filter to SUVs",
    });
  }

  // 3. Budget-friendly options (under $18k)
  const budgetVehicles = vehicles.filter(v => v.price < 18000);
  if (budgetVehicles.length >= 3) {
    recommendations.push({
      type: "budget",
      icon: <DollarSign className="w-4 h-4 text-blue-600" />,
      title: `${budgetVehicles.length} vehicles under $18k`,
      description: "Budget-friendly content performs well with first-time buyers",
      vehicleIds: budgetVehicles.map(v => v.id),
      actionLabel: "Show Budget Picks",
    });
  }

  // 4. New arrivals (under 10 days on lot)
  const newArrivals = vehicles.filter(v => v.daysOnLot <= 10);
  if (newArrivals.length >= 2) {
    recommendations.push({
      type: "new_arrivals",
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      title: `${newArrivals.length} new arrivals this week`,
      description: "Fresh inventory gets attention — great for 'just in' content",
      vehicleIds: newArrivals.map(v => v.id),
      actionLabel: "Show New Arrivals",
    });
  }

  // Return top 2-3 most relevant recommendations
  return recommendations.slice(0, 3);
}

// Recommendation card component (purple = AI-powered suggestions)
function RecommendationCard({
  recommendation,
  onAction,
}: {
  recommendation: VehicleRecommendation;
  onAction: (vehicleIds: string[]) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
      <div className="mt-0.5">{recommendation.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{recommendation.title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{recommendation.description}</p>
      </div>
      <button
        onClick={() => onAction(recommendation.vehicleIds)}
        className="shrink-0 text-xs font-medium text-purple-700 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 px-2.5 py-1.5 rounded-md transition-colors"
      >
        {recommendation.actionLabel}
      </button>
    </div>
  );
}

// Vehicle Selection Modal
function VehicleModal({
  isOpen,
  onClose,
  adName,
  vehicles,
  excludedIds,
  onSelect,
  formatPrice,
}: {
  isOpen: boolean;
  onClose: () => void;
  adName: string;
  vehicles: Vehicle[];
  excludedIds: string[];
  onSelect: (vehicle: Vehicle) => void;
  formatPrice: (price: number) => string;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof window === "undefined") return null;

  const availableVehicles = vehicles
    .filter(v => !excludedIds.includes(v.id))
    .sort((a, b) => b.year - a.year); // Sort by year descending (newest first)

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            Select Vehicle for &ldquo;{adName}&rdquo;
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto p-2">
          {availableVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No vehicles available
            </div>
          ) : (
            <div className="space-y-2">
              {availableVehicles.map(vehicle => (
                <button
                  key={vehicle.id}
                  onClick={() => {
                    onSelect(vehicle);
                    onClose();
                  }}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors flex gap-3"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Row 1: Year Make Model */}
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    {/* Row 2: VIN */}
                    <div className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                      {vehicle.vin || "VIN unavailable"}
                    </div>
                    {/* Row 3: Price, mileage, days */}
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatPrice(vehicle.price)} • {Math.round(vehicle.mileage / 1000)}k mi • {vehicle.daysOnLot}d on lot
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function VehicleSelectorV2({ adSlots = demoAdSlots, onSelect, onContinue }: VehicleSelectorV2Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections per ad slot: { adSlotId: Vehicle[] }
  const [selections, setSelections] = useState<Record<string, Vehicle[]>>({});

  // Track which platform sections are expanded
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<string, boolean>>({
    tiktok: true,
    facebook: true,
    youtube: true,
    instagram: true,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<AdSlot | null>(null);

  // Highlighted vehicles from recommendations
  const [highlightedVehicleIds, setHighlightedVehicleIds] = useState<string[]>([]);

  const fetchInventory = async () => {
    setLoading(true);

    try {
      const response = await fetch("https://ad-pilot-n8n-production.up.railway.app/webhook/inventory", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch inventory");

      const data = await response.json();
      if (data.vehicles && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
      } else if (Array.isArray(data)) {
        setVehicles(data);
      } else {
        setVehicles(fallbackVehicles);
      }
    } catch (err) {
      console.log("Using fallback inventory:", err);
      setVehicles(fallbackVehicles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Get suggested priority vehicles (top 6 based on days on lot + AWD/4WD + high mileage)
  const getSuggestedPriorities = () => {
    return [...vehicles]
      .map(v => ({
        ...v,
        priority: (v.daysOnLot >= 60 ? 100 : 0) +
                  (["AWD", "4WD"].includes(v.driveType || "") ? 50 : 0) +
                  (v.mileage >= 90000 ? 30 : 0) +
                  v.daysOnLot
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6);
  };

  // Group ad slots by platform
  const adSlotsByPlatform = adSlots.reduce((acc, slot) => {
    if (!acc[slot.platform]) acc[slot.platform] = [];
    acc[slot.platform].push(slot);
    return acc;
  }, {} as Record<string, AdSlot[]>);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectVehicle = (adSlotId: string, vehicle: Vehicle, maxCount: number) => {
    const current = selections[adSlotId] || [];
    let newSelection: Vehicle[];

    if (current.find(v => v.id === vehicle.id)) {
      // Remove if already selected
      newSelection = current.filter(v => v.id !== vehicle.id);
    } else if (current.length < maxCount) {
      // Add if under limit
      newSelection = [...current, vehicle];
    } else {
      return;
    }

    const newSelections = { ...selections, [adSlotId]: newSelection };
    setSelections(newSelections);
    onSelect?.(newSelections);
  };

  const openModal = (slot: AdSlot) => {
    setActiveSlot(slot);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveSlot(null);
  };

  const togglePlatform = (platform: string) => {
    setExpandedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  // Calculate total selections needed vs selected
  const totalNeeded = adSlots.reduce((sum, slot) => sum + slot.vehicleCount, 0);
  const totalSelected = Object.values(selections).reduce((sum, arr) => sum + arr.length, 0);
  const allComplete = adSlots.every(slot =>
    slot.vehicleCount === 0 || (selections[slot.id]?.length || 0) >= slot.vehicleCount
  );

  const handleContinue = () => {
    if (allComplete) {
      onContinue?.(selections);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-3xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500">Loading inventory...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const suggestedVehicles = getSuggestedPriorities();

  // Generate recommendations
  const recommendations = generateRecommendations(vehicles);

  // Handle recommendation action - highlight those vehicles
  const handleRecommendationAction = (vehicleIds: string[]) => {
    setHighlightedVehicleIds(vehicleIds);
    // Auto-scroll to suggested priorities section
    setTimeout(() => {
      document.getElementById("suggested-priorities")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Clear highlights
  const clearHighlights = () => {
    setHighlightedVehicleIds([]);
  };

  // Get vehicles to display in suggested priorities (either highlighted or default top 6)
  const displayedVehicles = highlightedVehicleIds.length > 0
    ? vehicles.filter(v => highlightedVehicleIds.includes(v.id)).slice(0, 6)
    : suggestedVehicles;

  return (
    <>
      <Card className="w-full max-w-3xl border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-500" />
            Select Vehicles for Your Ads
          </CardTitle>
          <p className="text-xs text-gray-500">
            Choose vehicles for each ad in your plan
          </p>
          <WhatsThis className="mt-2">
            <p className="mb-2"><strong>How vehicle selection works:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>We suggest vehicles based on age and performance</li>
              <li>Older inventory gets priority to help move it</li>
              <li>Click to pick vehicles for each ad slot</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              You can change selections any time before publishing.
            </p>
          </WhatsThis>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* === SUGGESTIONS SECTION (AI-Powered = Purple) === */}
          {recommendations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-gray-700">Recommendations</span>
              </div>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <RecommendationCard
                    key={index}
                    recommendation={rec}
                    onAction={handleRecommendationAction}
                  />
                ))}
              </div>
            </div>
          )}

          {/* === SUGGESTED PRIORITIES SECTION === */}
          <div id="suggested-priorities" className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  {highlightedVehicleIds.length > 0 ? "Filtered Vehicles" : "Suggested Priorities"}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {highlightedVehicleIds.length > 0 ? `${displayedVehicles.length} matches` : "Top 6"}
                </Badge>
                {highlightedVehicleIds.length > 0 && (
                  <button
                    onClick={clearHighlights}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span><span className="text-red-600">‼️</span> = Days on lot / High miles</span>
                <span><span className="text-green-600">✅</span> = Winter ready</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {displayedVehicles.map((vehicle, index) => {
                const isOld = vehicle.daysOnLot >= 60;
                const isWinterReady = ["AWD", "4WD"].includes(vehicle.driveType || "");
                const isHighMileage = vehicle.mileage >= 90000;

                return (
                  <div
                    key={vehicle.id}
                    className="p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200 flex gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Row 1: Number + Year Make Model */}
                      <div className="text-sm font-medium text-gray-900">
                        {index + 1}. {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>

                      {/* Row 2: VIN - truncated on mobile */}
                      <div className="text-xs text-gray-400 font-mono mt-1 truncate">
                        {vehicle.vin || "VIN unavailable"}
                      </div>

                      {/* Row 3: Urgency text (red) */}
                      {(isOld || isHighMileage) && (
                        <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
                          {isOld && <UrgencyText>{vehicle.daysOnLot}d</UrgencyText>}
                          {isHighMileage && <UrgencyText>{Math.round(vehicle.mileage / 1000)}k mi</UrgencyText>}
                        </div>
                      )}

                      {/* Row 4: Positive text (green) */}
                      {isWinterReady && (
                        <div className="flex flex-wrap gap-2 md:gap-3 mt-1">
                          <PositiveText>{vehicle.driveType}</PositiveText>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Use These Vehicles button */}
            <button
              onClick={() => {
                // Auto-assign suggested vehicles to ad slots, rotating through them
                const newSelections: Record<string, Vehicle[]> = {};
                let vehicleIndex = 0;

                adSlots.forEach((slot) => {
                  if (slot.vehicleCount > 0) {
                    const slotVehicles: Vehicle[] = [];
                    for (let i = 0; i < slot.vehicleCount; i++) {
                      if (displayedVehicles.length > 0) {
                        slotVehicles.push(displayedVehicles[vehicleIndex % displayedVehicles.length]);
                        vehicleIndex++;
                      }
                    }
                    newSelections[slot.id] = slotVehicles;
                  }
                });

                setSelections(newSelections);
                onSelect?.(newSelections);
              }}
              className="mt-3 w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              ✨ Use these vehicles
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* === PER-AD VEHICLE SELECTION === */}
          <div className="space-y-4">
            <span className="text-sm font-semibold text-gray-700">Assign Vehicles to Ads</span>

            {Object.entries(adSlotsByPlatform).map(([platform, slots]) => {
              const config = platformConfig[platform as keyof typeof platformConfig];
              const isExpanded = expandedPlatforms[platform];
              const platformSlots = slots.filter(s => s.vehicleCount > 0);

              if (platformSlots.length === 0) return null;

              return (
                <div key={platform} className={`border rounded-lg overflow-hidden ${config.borderColor}`}>
                  {/* Platform Header */}
                  <button
                    onClick={() => togglePlatform(platform)}
                    className={`w-full flex items-center justify-between p-2 md:p-3 ${config.headerBg} hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={platform as keyof typeof platformConfig} />
                      <span className={`font-semibold text-sm md:text-base ${config.headerText}`}>{config.name}</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className={`text-xs md:text-sm ${config.headerText} opacity-90 whitespace-nowrap`}>
                        {platformSlots.length} ads
                      </span>
                      {isExpanded ? (
                        <ChevronUp className={`w-4 h-4 ${config.headerText}`} />
                      ) : (
                        <ChevronDown className={`w-4 h-4 ${config.headerText}`} />
                      )}
                    </div>
                  </button>

                  {/* Ad slots */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-100">
                      {platformSlots.map((slot) => {
                        const slotSelections = selections[slot.id] || [];
                        const isComplete = slotSelections.length >= slot.vehicleCount;

                        return (
                          <div key={slot.id} className="p-2 md:p-3 bg-white">
                            {/* Ad info row */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="min-w-0">
                                <span className="text-sm font-medium text-gray-900 truncate block">{slot.themeTopic}</span>
                                <span className="text-xs text-gray-500">{slot.template}</span>
                              </div>
                              <Badge variant={isComplete ? "default" : "secondary"} className="text-xs whitespace-nowrap shrink-0">
                                {slotSelections.length}/{slot.vehicleCount}
                              </Badge>
                            </div>

                            {/* Selected vehicles */}
                            {slotSelections.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {slotSelections.map(v => (
                                  <Badge
                                    key={v.id}
                                    variant="outline"
                                    className="text-xs bg-green-50 border-green-200 text-green-700 cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                                    onClick={() => handleSelectVehicle(slot.id, v, slot.vehicleCount)}
                                  >
                                    {v.year} {v.make} {v.model} ✕
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Add vehicle button */}
                            {!isComplete && (
                              <button
                                onClick={() => openModal(slot)}
                                className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                              >
                                + Add vehicle
                              </button>
                            )}

                            {isComplete && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <Check className="w-3 h-3" />
                                Complete
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* === FOOTER === */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Vehicle assignments: <span className="font-medium">{totalSelected}</span> of <span className="font-medium">{totalNeeded}</span>
              </span>
              {allComplete ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">All Complete</Badge>
              ) : (
                <Badge variant="secondary">In Progress</Badge>
              )}
            </div>

            {/* Continue button */}
            <Button
              className="w-full"
              onClick={handleContinue}
              disabled={!allComplete}
            >
              Continue to Script Review
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Inventory notes */}
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                Showing {vehicles.length} vehicles from live inventory feed.
                Vehicles can appear in multiple ads.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Selection Modal */}
      {activeSlot && (
        <VehicleModal
          isOpen={modalOpen}
          onClose={closeModal}
          adName={`${activeSlot.themeTopic} · ${activeSlot.template}`}
          vehicles={vehicles}
          excludedIds={(selections[activeSlot.id] || []).map(v => v.id)}
          onSelect={(vehicle) => handleSelectVehicle(activeSlot.id, vehicle, activeSlot.vehicleCount)}
          formatPrice={formatPrice}
        />
      )}
    </>
  );
}
