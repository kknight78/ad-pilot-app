"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  RefreshCw,
  Car,
  ChevronDown,
  ArrowUpDown,
  X,
} from "lucide-react";

export interface VehicleOption {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage: number;
  daysOnLot: number;
  type: "sedan" | "suv" | "truck" | "van" | "coupe";
}

export interface AdSlot {
  id: string;
  label: string;
  platform: "tiktok" | "facebook" | "youtube" | "instagram";
  vehicleIds: string[];
  maxVehicles: number;
}

export interface VehicleSelectorProps {
  vehicles: VehicleOption[];
  adSlots: AdSlot[];
  onConfirm?: (assignments: AdSlot[]) => void;
  onReset?: () => void;
  onSwap?: (slotId: string, oldVehicleId: string, newVehicleId: string) => void;
}

type SortOption = "daysOnLot" | "price" | "newest";
type TypeFilter = "all" | "sedan" | "suv" | "truck" | "van" | "coupe";
type PriceFilter = "all" | "under20k" | "20k-30k" | "over30k";

const platformColors = {
  tiktok: "bg-pink-100 text-pink-700",
  facebook: "bg-blue-100 text-blue-700",
  youtube: "bg-red-100 text-red-700",
  instagram: "bg-purple-100 text-purple-700",
};

const platformLabels = {
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  instagram: "Instagram",
};

export function VehicleSelector({
  vehicles,
  adSlots,
  onConfirm,
  onReset,
  onSwap,
}: VehicleSelectorProps) {
  const [assignments, setAssignments] = useState<AdSlot[]>(adSlots);
  const [sortBy, setSortBy] = useState<SortOption>("daysOnLot");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [swappingSlot, setSwappingSlot] = useState<{
    slotId: string;
    vehicleIndex: number;
  } | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  // Get all currently assigned vehicle IDs
  const assignedVehicleIds = new Set(
    assignments.flatMap((slot) => slot.vehicleIds)
  );

  // Filter and sort available vehicles for swap
  const getAvailableVehicles = (excludeIds: string[]) => {
    let filtered = vehicles.filter(
      (v) => !assignedVehicleIds.has(v.id) || excludeIds.includes(v.id)
    );

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((v) => v.type === typeFilter);
    }

    // Apply price filter
    if (priceFilter === "under20k") {
      filtered = filtered.filter((v) => v.price < 20000);
    } else if (priceFilter === "20k-30k") {
      filtered = filtered.filter((v) => v.price >= 20000 && v.price <= 30000);
    } else if (priceFilter === "over30k") {
      filtered = filtered.filter((v) => v.price > 30000);
    }

    // Sort
    if (sortBy === "daysOnLot") {
      filtered.sort((a, b) => b.daysOnLot - a.daysOnLot);
    } else if (sortBy === "price") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => b.year - a.year);
    }

    return filtered;
  };

  const handleSwapClick = (slotId: string, vehicleIndex: number) => {
    if (
      swappingSlot?.slotId === slotId &&
      swappingSlot?.vehicleIndex === vehicleIndex
    ) {
      setSwappingSlot(null);
    } else {
      setSwappingSlot({ slotId, vehicleIndex });
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    if (!swappingSlot) return;

    const { slotId, vehicleIndex } = swappingSlot;
    const slotIdx = assignments.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return;

    const oldVehicleId = assignments[slotIdx].vehicleIds[vehicleIndex];
    const newAssignments = [...assignments];
    newAssignments[slotIdx] = {
      ...newAssignments[slotIdx],
      vehicleIds: newAssignments[slotIdx].vehicleIds.map((id, idx) =>
        idx === vehicleIndex ? vehicleId : id
      ),
    };

    setAssignments(newAssignments);
    setSwappingSlot(null);

    if (onSwap) {
      onSwap(slotId, oldVehicleId, vehicleId);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(assignments);
    }
  };

  const handleReset = () => {
    setAssignments(adSlots);
    setSwappingSlot(null);
    if (onReset) {
      onReset();
    }
  };

  const getVehicleById = (id: string) => vehicles.find((v) => v.id === id);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  const formatMileage = (mileage: number) =>
    new Intl.NumberFormat("en-US").format(mileage);

  // Group ad slots by platform
  const slotsByPlatform = assignments.reduce(
    (acc, slot) => {
      if (!acc[slot.platform]) {
        acc[slot.platform] = [];
      }
      acc[slot.platform].push(slot);
      return acc;
    },
    {} as Record<string, AdSlot[]>
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <Car className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-base">
              🚗 Select Vehicles for Your Ads
            </CardTitle>
            <p className="text-xs text-gray-500">
              Review and swap vehicle assignments
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Filter/Sort Bar */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowTypeDropdown(false);
                setShowPriceDropdown(false);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <ArrowUpDown className="w-3 h-3" />
              Sort:{" "}
              {sortBy === "daysOnLot"
                ? "Days on Lot"
                : sortBy === "price"
                  ? "Price"
                  : "Newest"}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {(["daysOnLot", "price", "newest"] as SortOption[]).map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${sortBy === option ? "text-primary-600 font-medium" : ""}`}
                    >
                      {option === "daysOnLot"
                        ? "Days on Lot"
                        : option === "price"
                          ? "Price"
                          : "Newest"}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowSortDropdown(false);
                setShowPriceDropdown(false);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Type: {typeFilter === "all" ? "All" : typeFilter.toUpperCase()}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showTypeDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {(
                  ["all", "sedan", "suv", "truck", "van", "coupe"] as TypeFilter[]
                ).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setTypeFilter(option);
                      setShowTypeDropdown(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${typeFilter === option ? "text-primary-600 font-medium" : ""}`}
                  >
                    {option === "all" ? "All Types" : option.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPriceDropdown(!showPriceDropdown);
                setShowSortDropdown(false);
                setShowTypeDropdown(false);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Price:{" "}
              {priceFilter === "all"
                ? "All"
                : priceFilter === "under20k"
                  ? "<$20k"
                  : priceFilter === "20k-30k"
                    ? "$20k-$30k"
                    : ">$30k"}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPriceDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {(
                  ["all", "under20k", "20k-30k", "over30k"] as PriceFilter[]
                ).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setPriceFilter(option);
                      setShowPriceDropdown(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${priceFilter === option ? "text-primary-600 font-medium" : ""}`}
                  >
                    {option === "all"
                      ? "All Prices"
                      : option === "under20k"
                        ? "Under $20k"
                        : option === "20k-30k"
                          ? "$20k - $30k"
                          : "Over $30k"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ad Slots by Platform */}
        <div className="space-y-3">
          {Object.entries(slotsByPlatform).map(([platform, slots]) => (
            <div key={platform}>
              <div
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1.5 ${platformColors[platform as keyof typeof platformColors]}`}
              >
                {platformLabels[platform as keyof typeof platformLabels]}
              </div>

              <div className="space-y-2">
                {slots.map((slot) => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-2">
                    <div className="text-xs font-medium text-gray-700 mb-1.5">
                      {slot.label}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {slot.vehicleIds.map((vehicleId, idx) => {
                        const vehicle = getVehicleById(vehicleId);
                        const isSwapping =
                          swappingSlot?.slotId === slot.id &&
                          swappingSlot?.vehicleIndex === idx;

                        return (
                          <div
                            key={`${slot.id}-${idx}`}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border-2 transition-all ${
                              isSwapping
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            {vehicle ? (
                              <>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium text-gray-800 block truncate">
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    {formatPrice(vehicle.price)} •{" "}
                                    {formatMileage(vehicle.mileage)} mi •{" "}
                                    {vehicle.daysOnLot}d on lot
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleSwapClick(slot.id, idx)}
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    isSwapping
                                      ? "bg-primary-500 text-white"
                                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                  }`}
                                >
                                  {isSwapping ? (
                                    <X className="w-3 h-3" />
                                  ) : (
                                    <span className="flex items-center gap-0.5">
                                      Swap <RefreshCw className="w-3 h-3" />
                                    </span>
                                  )}
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No vehicle assigned
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Swap Selection Panel */}
        {swappingSlot && (
          <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Select a replacement vehicle:
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {getAvailableVehicles([
                assignments.find((s) => s.id === swappingSlot.slotId)
                  ?.vehicleIds[swappingSlot.vehicleIndex] || "",
              ]).map((vehicle) => {
                const currentVehicleId = assignments.find(
                  (s) => s.id === swappingSlot.slotId
                )?.vehicleIds[swappingSlot.vehicleIndex];
                const isCurrentSelection = vehicle.id === currentVehicleId;

                return (
                  <button
                    key={vehicle.id}
                    onClick={() => handleSelectVehicle(vehicle.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border-2 transition-all text-left ${
                      isCurrentSelection
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-800 block truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatPrice(vehicle.price)} • {vehicle.daysOnLot}d
                      </span>
                    </div>
                    {isCurrentSelection && (
                      <Check className="w-3 h-3 text-primary-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            className="flex-1"
            size="sm"
            onClick={handleConfirm}
          >
            <Check className="w-4 h-4 mr-1" />
            Confirm Selections
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
