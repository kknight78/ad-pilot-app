"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

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

// Theme emoji mapping
const getThemeEmoji = (theme: string): string => {
  const lowerTheme = theme.toLowerCase();
  if (lowerTheme.includes("holiday") || lowerTheme.includes("christmas")) return "🎄";
  if (lowerTheme.includes("winter") || lowerTheme.includes("cold") || lowerTheme.includes("snow")) return "❄️";
  if (lowerTheme.includes("family")) return "👨‍👩‍👧‍👦";
  if (lowerTheme.includes("budget") || lowerTheme.includes("save")) return "💰";
  if (lowerTheme.includes("safety") || lowerTheme.includes("tire")) return "🛡️";
  if (lowerTheme.includes("summer") || lowerTheme.includes("road trip")) return "☀️";
  return "📌";
};

// Chip components for urgency (red) and positive (green) attributes
function UrgencyChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
      ‼️ {children}
    </span>
  );
}

function PositiveChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
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

// Portal dropdown component
function DropdownPortal({
  isOpen,
  triggerRef,
  onClose,
  children,
}: {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      {children}
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

  // Track which ad slots have dropdown open
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Refs for dropdown triggers
  const dropdownRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const fetchInventory = async () => {
    setLoading(true);

    try {
      const response = await fetch("https://kelly-ads.app.n8n.cloud/webhook/inventory", {
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

  const toggleDropdown = (adSlotId: string) => {
    setOpenDropdowns(prev => {
      // Close all other dropdowns when opening a new one
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[adSlotId] = !prev[adSlotId];
      return newState;
    });
  };

  const closeDropdown = (adSlotId: string) => {
    setOpenDropdowns(prev => ({ ...prev, [adSlotId]: false }));
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

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Car className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg">🚗 Select Vehicles for Your Ads</CardTitle>
            <p className="text-sm text-gray-500">
              Choose vehicles for each ad in your plan
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* === SUGGESTED PRIORITIES SECTION === */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Suggested Priorities</span>
            <Badge variant="secondary" className="text-xs">Top 6</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {suggestedVehicles.map((vehicle, index) => {
              const isOld = vehicle.daysOnLot >= 60;
              const isWinterReady = ["AWD", "4WD"].includes(vehicle.driveType || "");
              const isHighMileage = vehicle.mileage >= 90000;

              return (
                <div
                  key={vehicle.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Row 1: Number + Year Make Model */}
                  <div className="text-sm font-medium text-gray-900">
                    {index + 1}. {vehicle.year} {vehicle.make} {vehicle.model}
                  </div>

                  {/* Row 2: VIN */}
                  <div className="text-xs text-gray-400 font-mono mt-1">
                    {vehicle.vin || "VIN unavailable"}
                  </div>

                  {/* Row 3: Urgency chips (red) */}
                  {(isOld || isHighMileage) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {isOld && <UrgencyChip>{vehicle.daysOnLot} days</UrgencyChip>}
                      {isHighMileage && <UrgencyChip>{Math.round(vehicle.mileage / 1000)}k mi</UrgencyChip>}
                    </div>
                  )}

                  {/* Row 4: Positive chips (green) */}
                  {isWinterReady && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <PositiveChip>{vehicle.driveType} · Winter ready</PositiveChip>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
                  className={`w-full flex items-center justify-between p-3 ${config.headerBg} hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={platform as keyof typeof platformConfig} />
                    <span className={`font-semibold ${config.headerText}`}>{config.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${config.headerText} opacity-90`}>
                      {platformSlots.length} {platformSlots.length === 1 ? "ad" : "ads"} need vehicles
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
                      const isDropdownOpen = openDropdowns[slot.id];

                      return (
                        <div key={slot.id} className="p-3 bg-white">
                          {/* Ad info row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getThemeEmoji(slot.themeTopic)}</span>
                              <div>
                                <span className="text-sm font-medium text-gray-900">{slot.themeTopic}</span>
                                <span className="text-xs text-gray-500 ml-2">• {slot.template}</span>
                              </div>
                            </div>
                            <Badge variant={isComplete ? "default" : "secondary"} className="text-xs">
                              {slotSelections.length} / {slot.vehicleCount}
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

                          {/* Add vehicle dropdown */}
                          {!isComplete && (
                            <div className="relative">
                              <button
                                ref={(el) => { dropdownRefs.current[slot.id] = el; }}
                                onClick={() => toggleDropdown(slot.id)}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                              >
                                <span>+ Add vehicle</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              <DropdownPortal
                                isOpen={isDropdownOpen}
                                triggerRef={{ current: dropdownRefs.current[slot.id] }}
                                onClose={() => closeDropdown(slot.id)}
                              >
                                {vehicles
                                  .filter(v => !slotSelections.find(s => s.id === v.id))
                                  .map(vehicle => (
                                    <button
                                      key={vehicle.id}
                                      onClick={() => {
                                        handleSelectVehicle(slot.id, vehicle, slot.vehicleCount);
                                        if (slotSelections.length + 1 >= slot.vehicleCount) {
                                          closeDropdown(slot.id);
                                        }
                                      }}
                                      className="w-full px-3 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                    >
                                      {/* Row 1: Year Make Model */}
                                      <div className="text-sm font-medium text-gray-900">
                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                      </div>
                                      {/* Row 2: VIN */}
                                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                                        {vehicle.vin || "VIN unavailable"}
                                      </div>
                                      {/* Row 3: Price, mileage, days */}
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {formatPrice(vehicle.price)} • {Math.round(vehicle.mileage / 1000)}k mi • {vehicle.daysOnLot}d on lot
                                      </div>
                                    </button>
                                  ))}
                              </DropdownPortal>
                            </div>
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
  );
}
