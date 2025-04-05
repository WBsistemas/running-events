import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto animate-pulse">
      <CardHeader>
        <CardTitle className="h-7 bg-gray-200 rounded w-1/3"></CardTitle>
        <CardDescription className="h-4 bg-gray-200 rounded w-2/3 mt-2"></CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Nome */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        
        {/* Email */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-48 mt-1"></div>
        </div>
        
        {/* Telefone */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        
        {/* Botão */}
        <div className="h-10 bg-blue-200 rounded w-full mt-4"></div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-center">
        <div className="h-9 bg-gray-200 rounded w-44"></div>
      </CardFooter>
    </Card>
  );
} 