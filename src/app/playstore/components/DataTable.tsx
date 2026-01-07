"use client";

import { useState } from "react";

export default function DataTable({
  data,
  dark,
  textPrimary,
  textSecondary,
  cardBg,
  inputBg,
  borderColor,
  subtleBg,
}: {
  data: Record<string, unknown>[];
  dark: boolean;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  inputBg: string;
  borderColor: string;
  subtleBg: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return columns.some((col) => {
      const value = String(row[col] ?? "").toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedData = filteredData.slice(startIdx, endIdx);

  return (
    <div className={`rounded-lg mt-4 ${cardBg} border`}>
      <div className="p-4 border-b ${borderColor}">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h4 className={`text-sm font-semibold ${textPrimary}`}>📊 Preview Data ({filteredData.length} records)</h4>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`h-8 px-3 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${inputBg}`}
            />
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`h-8 px-2 text-xs rounded-lg border focus:outline-none ${inputBg}`}
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full text-xs">
          <thead className={`${subtleBg} sticky top-0`}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`px-4 py-2 text-left font-semibold ${textPrimary}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className={`${dark ? "hover:bg-slate-700" : "hover:bg-gray-50"} ${idx % 2 === 0 ? "" : dark ? "bg-slate-800/50" : "bg-gray-50/50"}`}
              >
                {columns.map((col) => (
                  <td key={col} className={`px-4 py-2 ${textSecondary}`}>
                    <div className="max-w-xs truncate" title={String(row[col] ?? "")}>
                      {String(row[col] ?? "")}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`p-4 border-t ${borderColor} flex items-center justify-between text-xs`}>
        <div className={textSecondary}>
          Showing {startIdx + 1}-{Math.min(endIdx, filteredData.length)} of {filteredData.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"} ${inputBg}`}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded border ${currentPage === page ? dark ? "bg-green-600 text-white" : "bg-green-500 text-white" : inputBg}`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"} ${inputBg}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
