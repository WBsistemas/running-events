import React from "react";

export function AuthLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="text-center max-w-md px-6">
        <div className="relative h-20 w-20 mx-auto mb-6">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
            <svg
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
              <path d="M19.5 7.5A7.5 7.5 0 0 0 4.5 7.5" />
              <path d="M19.5 7.5A7.5 7.5 0 0 1 12 15a7.49 7.49 0 0 1-6.75-4.22" />
              <path d="M4.5 7.5a7.5 7.5 0 0 0 15 0" />
              <path d="M19.5 7.5A7.5 7.5 0 0 1 12 15a7.49 7.49 0 0 1-6.75-4.22" />
              <path d="M12 7.5v15" />
              <path d="M12 15v7.5" />
              <path d="M12 7.5V0" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Autenticando</h2>
        <p className="text-gray-600">
          Estamos verificando sua identidade. Isso pode levar alguns instantes...
        </p>
      </div>
    </div>
  );
} 