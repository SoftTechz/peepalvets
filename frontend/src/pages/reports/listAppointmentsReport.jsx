import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import DashboardLayout from "@/app/layout/DashboardLayout";
import ModuleHeader from "@/components/ui/ModuleHeader";
import {
  exportAppointmentsReportExcel,
  exportAppointmentsReportPdf,
  getAppointmentsReport,
} from "@/services/report_service";

const PAGE_SIZE = 10;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusClasses = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ListAppointmentsReport() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  const [cursor, setCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);

  const requestIdRef = useRef(0);

  const hasPrev = cursorHistory.length > 0;
  const startIndex = cursorHistory.length * PAGE_SIZE;

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const requestId = ++requestIdRef.current;

      const response = await getAppointmentsReport({
        from_date: appliedFromDate || undefined,
        to_date: appliedToDate || undefined,
        limit: PAGE_SIZE,
        cursor: cursor || undefined,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setAppointments(response.appointments || []);
      setNextCursor(response.next_cursor || null);
      setHasNext(Boolean(response.has_next));
      setTotal(response.total ?? 0);
    } catch (fetchError) {
      setError("Failed to load appointments report.");
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  }, [appliedFromDate, appliedToDate, cursor]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleFilter = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setError("From Date cannot be greater than To Date.");
      return;
    }

    setError(null);
    setCursor(null);
    setCursorHistory([]);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  const handlePrevPage = () => {
    if (!hasPrev) return;
    const previousCursor = cursorHistory[cursorHistory.length - 1];
    setCursorHistory((prev) => prev.slice(0, -1));
    setCursor(previousCursor || null);
  };

  const handleNextPage = () => {
    if (!hasNext || !nextCursor) return;
    setCursorHistory((prev) => [...prev, cursor]);
    setCursor(nextCursor);
  };

  const downloadBlob = (blobData, filename) => {
    const url = window.URL.createObjectURL(blobData);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportParams = useMemo(
    () => ({
      from_date: appliedFromDate || undefined,
      to_date: appliedToDate || undefined,
    }),
    [appliedFromDate, appliedToDate],
  );

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      const blob = await exportAppointmentsReportExcel(exportParams);
      downloadBlob(blob, "appointments_report.xlsx");
    } catch (exportError) {
      setError("Failed to export Excel report.");
      console.error(exportError);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportLoading(true);
      const blob = await exportAppointmentsReportPdf(exportParams);
      downloadBlob(blob, "appointments_report.pdf");
    } catch (exportError) {
      setError("Failed to export PDF report.");
      console.error(exportError);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <ModuleHeader
          icon={<CalendarDays size={22} />}
          title="Appointments Report"
          tagline="Filter and export appointment records"
          action={
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportExcel}
                disabled={exportLoading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet size={16} />
                Export to Excel
              </button>
              <button
                onClick={handleExportPdf}
                disabled={exportLoading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export to PDF
              </button>
            </div>
          }
        />

        <div className="mb-4">
          <p className="inline-flex items-center gap-2 text-sm text-purple-800 font-bold uppercase tracking-wide">
            <FileText size={16} />
            Total Appointments - {total}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={handleFilter}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-5 rounded-lg transition"
            >
              <CalendarDays size={16} />
              Filter
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading report...</div>
        ) : appointments.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No appointments found for selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    S.No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Owner Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Phone Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Pet Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Pet Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Appointment Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Doctor Fee
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => {
                  const normalizedStatus = String(
                    appointment.status || "active",
                  ).toLowerCase();
                  return (
                    <tr key={appointment.id} className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {appointment.customerName || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {appointment.phone || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {appointment.petName || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {appointment.petType || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(appointment.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Rs. {Number(appointment.doctorFee || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            statusClasses[normalizedStatus] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {normalizedStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs md:text-sm text-gray-600">
            Showing {appointments.length > 0 ? startIndex + 1 : 0} to{" "}
            {startIndex + appointments.length} of {total} appointments
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={!hasPrev}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasNext}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
