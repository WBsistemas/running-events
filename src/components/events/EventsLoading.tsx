import React from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function EventsLoading() {
  // Criar um array de 6 elementos para mostrar 6 skeletons
  const skeletons = Array(6).fill(null);

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-center">
        <LoadingSpinner size="lg" text="Carregando eventos..." />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
          >
            {/* Image skeleton */}
            <div className="h-40 bg-gray-200" />
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              
              {/* Date & Location */}
              <div className="flex space-x-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
              
              {/* Button */}
              <div className="h-8 bg-gray-200 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 