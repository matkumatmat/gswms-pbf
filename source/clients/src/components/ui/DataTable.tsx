// import React from 'react';
// import { Button } from './Button';
// import { Search } from 'lucide-react';

// interface Column<T> {
//   header: string;
//   accessor: keyof T | ((row: T) => React.ReactNode);
// }

// interface DataTableProps<T> {
//   columns: Column<T>[];
//   data: T[];
//   page: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   onSearch?: (field: string, value: string) => void;
//   searchOptions?: { label: string; value: string }[];
//   searchField?: string;
//   searchValue?: string;
//   onSearchFieldChange?: (field: string) => void;
//   onSearchValueChange?: (value: string) => void;
// }

// export function DataTable<T>({
//   columns, 
//   data, 
//   page, 
//   totalPages, 
//   onPageChange,
//   onSearch,
//   searchOptions,
//   searchField,
//   searchValue,
//   onSearchFieldChange,
//   onSearchValueChange
// }: DataTableProps<T>) {

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if(onSearch && searchField && searchValue !== undefined) {
//       onSearch(searchField, searchValue);
//     }
//   };

//   return (
//     <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-full">
//       {onSearch && (
//         <form onSubmit={handleSearch} className="p-4 border-b flex flex-wrap gap-2">
//           {searchOptions && searchOptions.length > 0 && (
//             <select 
//               className="border rounded-md px-3 py-2 text-sm"
//               value={searchField}
//               onChange={(e) => onSearchFieldChange?.(e.target.value)}
//             >
//               {searchOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//             </select>
//           )}
//           <div className="relative flex-1 min-w-[200px]">
//             <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
//             <input 
//               type="text" 
//               className="border rounded-md pl-9 pr-3 py-2 w-full text-sm"
//               placeholder="Search..."
//               value={searchValue}
//               onChange={(e) => onSearchValueChange?.(e.target.value)}
//             />
//           </div>
//           <Button type="submit">Cari</Button>
//         </form>
//       )}
//       <div className="overflow-x-auto flex-1">
//         <table className="w-full text-sm text-left text-slate-600">
//           <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
//             <tr>
//               {columns.map((col, idx) => (
//                 <th key={idx} className="px-4 py-3 font-medium">{col.header}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data.length === 0 ? (
//               <tr>
//                 <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">Tidak ada data.</td>
//               </tr>
//             ) : (
//               data.map((row, rIdx) => (
//                 <tr key={rIdx} className="border-b hover:bg-slate-50">
//                   {columns.map((col, cIdx) => (
//                     <td key={cIdx} className="px-4 py-3 whitespace-nowrap">
//                       {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as any)}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//       <div className="p-4 border-t flex items-center justify-between bg-slate-50">
//         <span className="text-sm text-slate-500">
//           Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages || 1}</span>
//         </span>
//         <div className="flex gap-2">
//           <Button 
//             variant="secondary" 
//             size="sm" 
//             disabled={page <= 1} 
//             onClick={() => onPageChange(page - 1)}
//           >
//             Prev
//           </Button>
//           <Button 
//             variant="secondary" 
//             size="sm" 
//             disabled={page >= totalPages} 
//             onClick={() => onPageChange(page + 1)}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from './Button';
import {
  Search,
  FileSpreadsheet,
  FileText,
  FileJson,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch?: (field: string, value: string) => void;
  searchOptions?: { label: string; value: string }[];
  searchField?: string;
  searchValue?: string;
  onSearchFieldChange?: (field: string) => void;
  onSearchValueChange?: (value: string) => void;
  exportFormats?: ('xlsx' | 'pdf' | 'json')[];
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Convert anything to a plain string for export. */
function reactNodeToString(node: any): string {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(reactNodeToString).join('');
  if (React.isValidElement(node)) {
    const children = (node as any).props?.children;
    return children ? reactNodeToString(children) : '';
  }
  return '';
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function DataTable<T>({
  columns,
  data,
  page,
  totalPages,
  onPageChange,
  onSearch,
  searchOptions,
  searchField,
  searchValue,
  onSearchFieldChange,
  onSearchValueChange,
  exportFormats = ['xlsx', 'pdf', 'json'],
}: DataTableProps<T>) {
  /* ---- Sorting state ---- */
  const [sortColumnIdx, setSortColumnIdx] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSortClick = (colIdx: number) => {
    const col = columns[colIdx];
    const isSortable = col.sortable ?? (typeof col.accessor === 'string' || !!col.sortFn);
    if (!isSortable) return;

    if (sortColumnIdx !== colIdx) {
      setSortColumnIdx(colIdx);
      setSortDirection('asc');
    } else {
      // Cycle: asc → desc → null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumnIdx(null);
      } else {
        setSortDirection('asc');
      }
    }
  };

  /* ---- Client‑side sorting ---- */
  const sortedData = useMemo(() => {
    if (sortColumnIdx === null || sortDirection === null) return data;
    const col = columns[sortColumnIdx];
    if (!col.sortable && !col.sortFn) return data;

    const dir = sortDirection === 'asc' ? 1 : -1;
    const dataCopy = [...data];
    dataCopy.sort((a, b) => {
      if (col.sortFn) return col.sortFn(a, b) * dir;
      if (typeof col.accessor === 'string') {
        const aVal = a[col.accessor];
        const bVal = b[col.accessor];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * dir;
        }
        const strA = String(aVal ?? '');
        const strB = String(bVal ?? '');
        return strA.localeCompare(strB) * dir;
      }
      return 0;
    });
    return dataCopy;
  }, [data, sortColumnIdx, sortDirection, columns]);

  /* ---- Export helpers ---- */
  const getExportRows = useCallback(() => {
    return sortedData.map((row) =>
      columns.map((col) => {
        const value =
          typeof col.accessor === 'function'
            ? col.accessor(row)
            : row[col.accessor];
        return reactNodeToString(value);
      })
    );
  }, [sortedData, columns]);

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(sortedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(sortedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'data.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const headers = columns.map((col) => col.header);
    const body = getExportRows();
    (doc as any).autoTable({ head: [headers], body }); // cast for type safety
    doc.save('data.pdf');
  };

  /* ---- Go‑to page ---- */
  const [goToPageInput, setGoToPageInput] = useState<string>('');
  const handleGoToPage = () => {
    const p = parseInt(goToPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
    }
    setGoToPageInput('');
  };

  /* ---- Render ---- */
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Top bar: search + export buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b border-slate-200">
        {onSearch && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch?.(searchField!, searchValue!);
            }}
            className="flex flex-wrap items-center gap-2 flex-1 min-w-0"
          >
            {searchOptions && searchOptions.length > 0 && (
              <select
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={searchField}
                onChange={(e) => onSearchFieldChange?.(e.target.value)}
              >
                {searchOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Cari..."
                value={searchValue}
                onChange={(e) => onSearchValueChange?.(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm">
              Cari
            </Button>
          </form>
        )}
        {/* Export buttons */}
        <div className="flex items-center gap-1">
          {exportFormats.includes('xlsx') && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportXLSX}
              title="Export Excel"
              className="h-9 w-9 p-0 inline-flex items-center justify-center"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
          )}
          {exportFormats.includes('pdf') && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportPDF}
              title="Export PDF"
              className="h-9 w-9 p-0 inline-flex items-center justify-center"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
          {exportFormats.includes('json') && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportJSON}
              title="Export JSON"
              className="h-9 w-9 p-0 inline-flex items-center justify-center"
            >
              <FileJson className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, idx) => {
                const isSortable =
                  col.sortable ??
                  (typeof col.accessor === 'string' || !!col.sortFn);
                const isActive = sortColumnIdx === idx && sortDirection !== null;
                const Icon = isActive
                  ? sortDirection === 'asc'
                    ? ArrowUp
                    : ArrowDown
                  : ArrowUpDown;

                return (
                  <th
                    key={idx}
                    className={`px-4 py-3 font-semibold text-slate-700 ${
                      isSortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''
                    }`}
                    onClick={() => isSortable && handleSortClick(idx)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {isSortable && (
                        <Icon
                          className={`h-3.5 w-3.5 ${
                            isActive ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              sortedData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 whitespace-nowrap">
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as any)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>

          <span className="hidden sm:inline">Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={goToPageInput}
            onChange={(e) => setGoToPageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
            placeholder={`${page}`}
            className="h-8 w-16 rounded-md border border-slate-300 bg-white px-2 text-center text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-slate-500">
            of <span className="font-medium text-slate-700">{totalPages || 1}</span>
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleGoToPage}
            disabled={!goToPageInput}
          >
            Go
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
        <div className="text-xs text-slate-400">
          {sortedData.length} item{sortedData.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}