"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Eye, Car, DollarSign, Gauge, Calendar } from "lucide-react";

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage?: number;
  imageUrl?: string;
  features?: string[];
  vin?: string;
  daysOnLot?: number;
}

export interface InventoryCardProps {
  vehicle: Vehicle;
  onCreateVideo?: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
}

export function InventoryCard({
  vehicle,
  onCreateVideo,
  onViewDetails,
}: InventoryCardProps) {
  const {
    year,
    make,
    model,
    trim,
    price,
    mileage,
    imageUrl,
    features = [],
    daysOnLot,
  } = vehicle;

  const title = `${year} ${make} ${model}${trim ? ` ${trim}` : ""}`;
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

  const formattedMileage = mileage
    ? new Intl.NumberFormat("en-US").format(mileage)
    : null;

  return (
    <Card className="w-full max-w-sm overflow-hidden group">
      {/* Vehicle Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Car className="w-16 h-16 opacity-50" />
          </div>
        )}
        {/* Price badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/95 text-gray-900 shadow-sm text-base px-3 py-1">
            <DollarSign className="w-4 h-4 mr-1" />
            {formattedPrice}
          </Badge>
        </div>
        {/* Days on lot indicator */}
        {daysOnLot !== undefined && (
          <div className="absolute top-3 right-3">
            <Badge
              variant={daysOnLot > 30 ? "warning" : daysOnLot > 14 ? "info" : "success"}
              className="flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              {daysOnLot}d
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="pt-4">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight mb-2">{title}</h3>

        {/* Quick specs */}
        {formattedMileage && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Gauge className="w-4 h-4 mr-1" />
            {formattedMileage} miles
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{features.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button size="sm" className="flex-1" onClick={() => onCreateVideo?.(vehicle)}>
          <Video className="w-4 h-4 mr-1" />
          Create Video
        </Button>
        <Button size="sm" variant="outline" onClick={() => onViewDetails?.(vehicle)}>
          <Eye className="w-4 h-4 mr-1" />
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}

// Grid wrapper for multiple cards
export interface InventoryGridProps {
  vehicles: Vehicle[];
  onCreateVideo?: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
}

export function InventoryGrid({
  vehicles,
  onCreateVideo,
  onViewDetails,
}: InventoryGridProps) {
  if (vehicles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Car className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500">No vehicles found in inventory.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {vehicles.map((vehicle) => (
        <InventoryCard
          key={vehicle.id}
          vehicle={vehicle}
          onCreateVideo={onCreateVideo}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
