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
        <table className="w-full bg-gray-900 rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                Date
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                Open
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                High
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                Low
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                Close
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                Change
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                Change %
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                Volume
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((row, index) => (
              <tr
                key={row.date}
                className={`hover:bg-gray-800 transition-colors ${
                  index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-300">
                  {format(new Date(row.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300 text-right">
                  ${row.open.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300 text-right">
                  ${row.high.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300 text-right">
                  ${row.low.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-300 text-right">
                  ${row.close.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${
                  row.change && row.change > 0 ? 'text-green-400' : 
                  row.change && row.change < 0 ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {row.change && row.change > 0 ? '+' : ''}{row.change?.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${
                  row.changePercent && row.changePercent > 0 ? 'text-green-400' : 
                  row.changePercent && row.changePercent < 0 ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {row.changePercent && row.changePercent > 0 ? '+' : ''}{row.changePercent?.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-300 text-right">
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
