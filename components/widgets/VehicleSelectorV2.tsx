"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  RefreshCw,
  ArrowRight,
  Loader2,
  Car,
  Calendar,
  DollarSign,
  AlertCircle,
  Filter,
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
}

interface VehicleSelectorV2Props {
  maxSelections?: number;
  onSelect?: (vehicles: Vehicle[]) => void;
  onContinue?: (vehicles: Vehicle[]) => void;
}

// Fallback vehicles if API is unavailable
const fallbackVehicles: Vehicle[] = [
  { id: "1", year: 2019, make: "Honda", model: "CR-V", price: 22995, mileage: 45000, daysOnLot: 12 },
  { id: "2", year: 2020, make: "Toyota", model: "Camry", price: 19995, mileage: 38000, daysOnLot: 8 },
  { id: "3", year: 2018, make: "Ford", model: "F-150", price: 28995, mileage: 52000, daysOnLot: 45 },
  { id: "4", year: 2021, make: "Chevrolet", model: "Equinox", price: 24995, mileage: 28000, daysOnLot: 5 },
  { id: "5", year: 2017, make: "Nissan", model: "Altima", price: 14995, mileage: 68000, daysOnLot: 62 },
  { id: "6", year: 2019, make: "Jeep", model: "Cherokee", price: 21995, mileage: 41000, daysOnLot: 23 },
];

type SortOption = "daysOnLot" | "price" | "newest";

export function VehicleSelectorV2({ maxSelections = 3, onSelect, onContinue }: VehicleSelectorV2Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("daysOnLot");
  const [showFilters, setShowFilters] = useState(false);

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

  const sortedVehicles = [...vehicles].sort((a, b) => {
    switch (sortBy) {
      case "daysOnLot":
        return b.daysOnLot - a.daysOnLot; // Oldest first (most days)
      case "price":
        return a.price - b.price; // Cheapest first
      case "newest":
        return b.year - a.year; // Newest year first
      default:
        return 0;
    }
  });

  const handleSelect = (vehicle: Vehicle) => {
    let newSelected: Vehicle[];

    if (selectedVehicles.find((v) => v.id === vehicle.id)) {
      newSelected = selectedVehicles.filter((v) => v.id !== vehicle.id);
    } else if (selectedVehicles.length < maxSelections) {
      newSelected = [...selectedVehicles, vehicle];
    } else {
      return;
    }

    setSelectedVehicles(newSelected);
    onSelect?.(newSelected);
  };

  const handleContinue = () => {
    if (selectedVehicles.length > 0) {
      onContinue?.(selectedVehicles);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("en-US").format(mileage);
  };

  const isSelected = (id: string) => selectedVehicles.some((v) => v.id === id);
  const isDisabled = (id: string) => !isSelected(id) && selectedVehicles.length >= maxSelections;

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500">Loading inventory...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Car className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Select Vehicles for Ads</CardTitle>
              <p className="text-sm text-gray-500">
                Choose up to {maxSelections} vehicles to feature
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-600"
          >
            <Filter className="w-4 h-4 mr-1" />
            Sort
          </Button>
        </div>

        {/* Sort options */}
        {showFilters && (
          <div className="flex gap-2 mt-3">
            <Button
              variant={sortBy === "daysOnLot" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("daysOnLot")}
            >
              Longest on Lot
            </Button>
            <Button
              variant={sortBy === "price" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("price")}
            >
              Lowest Price
            </Button>
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
            >
              Newest Year
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Selection counter */}
        <div className="flex items-center justify-between">
          <Badge variant={selectedVehicles.length > 0 ? "default" : "secondary"}>
            {selectedVehicles.length} of {maxSelections} selected
          </Badge>
          {selectedVehicles.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedVehicles([])}>
              Clear all
            </Button>
          )}
        </div>

        {/* Vehicle list */}
        <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-1">
          {sortedVehicles.map((vehicle) => {
            const selected = isSelected(vehicle.id);
            const disabled = isDisabled(vehicle.id);
            const isOld = vehicle.daysOnLot > 45;

            return (
              <button
                key={vehicle.id}
                onClick={() => handleSelect(vehicle)}
                disabled={disabled}
                className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all text-left ${
                  selected
                    ? "border-primary-500 bg-primary-50"
                    : disabled
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {/* Vehicle image placeholder */}
                <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center shrink-0">
                  {vehicle.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vehicle.imageUrl}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Car className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Vehicle info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </span>
                    {isOld && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {vehicle.daysOnLot}d on lot
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatPrice(vehicle.price)}
                    </span>
                    <span>{formatMileage(vehicle.mileage)} mi</span>
                    {!isOld && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {vehicle.daysOnLot}d
                      </span>
                    )}
                  </div>
                </div>

                {/* Selection indicator */}
                {selected && (
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        {selectedVehicles.length > 0 && (
          <Button className="w-full" onClick={handleContinue}>
            Continue with {selectedVehicles.length} vehicle{selectedVehicles.length !== 1 ? "s" : ""}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        <p className="text-xs text-gray-400 text-center">
          Inventory pulled from your live feed • {vehicles.length} vehicles available
        </p>
      </CardContent>
    </Card>
  );
}
