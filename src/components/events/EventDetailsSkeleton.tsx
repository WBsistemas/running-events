import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EventDetailsSkeletonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsSkeleton({ 
  open, 
  onOpenChange 
}: EventDetailsSkeletonProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </DialogTitle>
        </DialogHeader>

        {/* Image skeleton */}
        <div className="rounded-lg h-64 bg-gray-200 animate-pulse"></div>

        {/* Details skeleton */}
        <div className="space-y-4 animate-pulse">
          {/* Info section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>

          {/* Actions skeleton */}
          <div className="flex justify-between mt-4">
            <div className="h-9 bg-gray-200 rounded w-1/4"></div>
            <div className="h-9 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 