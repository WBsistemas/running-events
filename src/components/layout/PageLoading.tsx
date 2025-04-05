import React from "react";

export function PageLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative h-24 w-24 mx-auto mb-6">
          <div className="absolute inset-0 animate-spin rounded-full border-8 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-3 animate-pulse rounded-full bg-white flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-blue-600"
            >
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 4 4 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
          </div>
        </div>
        <p className="text-lg font-medium text-blue-800">Carregando...</p>
        <p className="text-gray-500 mt-2">Aguarde um momento enquanto preparamos tudo para você</p>
      </div>
    </div>
  );
} 