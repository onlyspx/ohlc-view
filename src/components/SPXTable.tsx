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
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-900">
                Date
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-900">
                Day
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                Open
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                High
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                Low
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                Close
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                Change
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                Change %
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                Gap Pts
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-900">
                Gap Fill?
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                RTH Range
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                Pt -ve Open
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
                Pt +ve Open
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-900">
                Above PDH
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-900">
                Below PDL
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900">
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
                <td className="px-2 py-2 text-xs text-gray-900">
                  {format(new Date(row.date), 'MMM dd')}
                </td>
                <td className="px-2 py-2 text-xs text-gray-900">
                  {row.dayOfWeek?.substring(0, 3) || '-'}
                </td>
                <td className="px-2 py-2 text-xs text-gray-900 text-right">
                  ${row.open.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-xs text-gray-900 text-right">
                  ${row.high.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-xs text-gray-900 text-right">
                  ${row.low.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-xs font-medium text-gray-900 text-right">
                  ${row.close.toFixed(2)}
                </td>
                <td className={`px-2 py-2 text-xs font-medium text-right ${
                  row.change && row.change > 0 ? 'text-green-600' : 
                  row.change && row.change < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {row.change && row.change > 0 ? '+' : ''}{row.change?.toFixed(2)}
                </td>
                <td className={`px-2 py-2 text-xs font-medium text-right ${
                  row.changePercent && row.changePercent > 0 ? 'text-green-600' : 
                  row.changePercent && row.changePercent < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {row.changePercent && row.changePercent > 0 ? '+' : ''}{row.changePercent?.toFixed(2)}%
                </td>
                <td className={`px-2 py-2 text-xs font-medium text-right ${
                  row.gapPoints && row.gapPoints > 0 ? 'text-green-600' : 
                  row.gapPoints && row.gapPoints < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {row.gapPoints && row.gapPoints > 0 ? '+' : ''}{row.gapPoints?.toFixed(2) || '0.00'}
                </td>
                <td className="px-2 py-2 text-xs text-center text-gray-900">
                  <span className={row.gapFill === 'Yes' ? 'text-green-600' : 'text-red-600'}>
                    {row.gapFill || '-'}
                  </span>
                </td>
                <td className="px-2 py-2 text-xs text-gray-900 text-right">
                  {row.rthRange?.toFixed(2) || '-'}
                </td>
                <td className="px-2 py-2 text-xs text-red-600 text-right">
                  {row.pointNegativeOpen?.toFixed(2) || '0.00'}
                </td>
                <td className="px-2 py-2 text-xs text-green-600 text-right">
                  {row.pointPositiveOpen?.toFixed(2) || '0.00'}
                </td>
                <td className="px-2 py-2 text-xs text-center">
                  <span className={row.abovePDH?.startsWith('Yes') ? 'text-green-600' : 'text-gray-500'}>
                    {row.abovePDH || 'No'}
                  </span>
                </td>
                <td className="px-2 py-2 text-xs text-center">
                  <span className={row.belowPDL?.startsWith('Yes') ? 'text-red-600' : 'text-gray-500'}>
                    {row.belowPDL || 'No'}
                  </span>
                </td>
                <td className="px-2 py-2 text-xs text-gray-900 text-right">
                  {row.volume ? (row.volume / 1000000).toFixed(1) + 'M' : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
