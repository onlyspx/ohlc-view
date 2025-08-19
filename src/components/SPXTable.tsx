'use client';

import { SPXData } from '@/types/spx';
import { format } from 'date-fns';

interface SPXTableProps {
  data: SPXData[];
  loading: boolean;
}

export default function SPXTable({ data, loading }: SPXTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Date
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Open
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                High
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Low
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Close
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Change
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Change %
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Volume
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={row.date}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {format(new Date(row.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  ${row.open.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  ${row.high.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  ${row.low.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                  ${row.close.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${
                  row.change && row.change > 0 ? 'text-green-600' : 
                  row.change && row.change < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {row.change && row.change > 0 ? '+' : ''}{row.change?.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${
                  row.changePercent && row.changePercent > 0 ? 'text-green-600' : 
                  row.changePercent && row.changePercent < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {row.changePercent && row.changePercent > 0 ? '+' : ''}{row.changePercent?.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {row.volume?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
