import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export function ResetPasswordSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto animate-pulse">
        <CardHeader>
          <div className="flex justify-center mb-5">
            <div className="h-12 w-12 bg-blue-200 rounded-full"></div>
          </div>
          <CardTitle className="h-7 bg-gray-200 rounded w-3/4 mx-auto"></CardTitle>
          <CardDescription className="h-4 bg-gray-200 rounded w-4/5 mx-auto mt-2"></CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {/* Email field skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          
          {/* Button skeleton */}
          <div className="h-11 bg-blue-200 rounded w-full mt-6"></div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-center flex-col items-center space-y-3">
          <div className="h-4 bg-gray-200 rounded w-56"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        </CardFooter>
      </Card>
    </div>
  );
} 