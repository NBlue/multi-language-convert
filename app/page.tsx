'use client';

import { useState } from 'react';
import ConvertToExcel from '@/components/ConvertToExcel';
import ConvertFromExcel from '@/components/ConvertFromExcel';

type Tab = 'toExcel' | 'fromExcel';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('toExcel');

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Multi-Language Tool Converter
          </h1>
          <p className="text-gray-600">
            Convert between translation files and Excel format
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('toExcel')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'toExcel'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                JSON/TS/JS → Excel
              </button>
              <button
                onClick={() => setActiveTab('fromExcel')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'fromExcel'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Excel → JSON
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'toExcel' ? (
              <ConvertToExcel />
            ) : (
              <ConvertFromExcel />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Support formats: .json, .ts, .js, .xlsx</p>
        </div>
      </div>
    </main>
  );
}
