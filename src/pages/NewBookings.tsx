import React, { useState, useEffect } from 'react';
import { Filter, X, Loader2, FileText, RefreshCw } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { bookingService, type Booking } from '../services/bookingService';
import { documentService, type Document } from '../services/documentService';

// Map flat API response fields to the nested Booking shape used by UI
/** API sometimes returns validation/i18n keys in phone fields instead of digits */
const displayPhone = (raw: string | undefined | null): string => {
  if (raw == null || !String(raw).trim()) return 'N/A';
  const s = String(raw).trim();
  if (/not-?a-?valid|invalid|format|!!!/i.test(s)) return '—';
  return s;
};

const mapBooking = (b: Booking): Booking => {
  const raw = b as unknown as Record<string, unknown>;
  return {
    ...b,
    allottee: b.allottee || (raw.allottee_name ? {
      first_name: (raw.allottee_name as string).split(' ').slice(0, -1).join(' ') || (raw.allottee_name as string),
      last_name: (raw.allottee_name as string).split(' ').slice(-1)[0] || '',
      email: (raw.allottee_email as string) || b.allottee_email || '',
      phone: (raw.allottee_phone as string) || b.allottee_phone,
    } : undefined),
    allottee_phone: b.allottee_phone || (raw.allottee_phone as string) || undefined,
    project: b.project || (raw.project_name ? { name: raw.project_name as string } : undefined),
    unit: b.unit || (raw.unit_no ? {
      unit_no: raw.unit_no as string,
      tower: (raw.tower as string) || '',
      unit_type: (raw.unit_type as string) || '',
      carpet_area_sqft: (raw.carpet_area_sqft as number) || 0,
    } : undefined),
    agent_name: b.agent_name || (raw.manager_name as string) || undefined,
  } as Booking;
};

const normStatus = (s: string) => String(s ?? '').toLowerCase().trim().replace(/\s+/g, '_');

const NewBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [bookingDocuments, setBookingDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [docPreviewUrls, setDocPreviewUrls] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const toArray = (res: unknown): Booking[] => {
        if (Array.isArray(res)) return res;
        if (res && typeof res === 'object') {
          const o = res as Record<string, unknown>;
          if (Array.isArray(o.data)) return o.data as Booking[];
          if (Array.isArray(o.items)) return o.items as Booking[];
          if (Array.isArray(o.bookings)) return o.bookings as Booking[];
        }
        return [];
      };

      const pageSize = 100;
      const fetchAllPages = async (
        loader: (page: number) => Promise<unknown>,
      ): Promise<Booking[]> => {
        const out: Booking[] = [];
        for (let page = 1; page <= 50; page++) {
          const res = await loader(page);
          const batch = toArray(res);
          out.push(...batch);
          if (batch.length < pageSize) break;
        }
        return out;
      };

      // Some backends return different rows for ?status= vs no filter, or omit user bookings from
      // filtered lists. Agents see their rows via /bookings/workspace — merge everything for admin.
      const [listUnfiltered, listWorkspace, pendingReviewRes] = await Promise.all([
        fetchAllPages((page) => bookingService.getAll({ limit: pageSize, page })).catch(() => []),
        fetchAllPages((page) => bookingService.getWorkspace({ limit: pageSize, page })).catch(() => []),
        bookingService.getPendingReview().catch(() => []),
      ]);

      const pendingList = toArray(pendingReviewRes);
      const merged = [...listUnfiltered, ...listWorkspace, ...pendingList].map(mapBooking);

      const seen = new Set<string>();
      const unique = merged.filter((b) => {
        if (!b?.id || seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      });

      // Show all submissions (including draft) so admins can see everything.
      // Filtering remains available in the UI.
      unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(unique);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setToast({ message: 'Failed to load bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const takeOwnership = async (id: string) => {
    try {
      setActionLoading(id);
      await bookingService.startReview(id);
      setToast({ message: 'Review started. Booking is now under review.', type: 'success' });
      // Re-fetch to get updated data with correct status
      await fetchBookings();
    } catch (error: any) {
      console.error('Failed to start review:', error);
      setToast({ message: error?.message || 'Failed to start review', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const loadBookingDocuments = async (bookingId: string) => {
    setLoadingDocuments(true);
    setDocPreviewUrls({});
    try {
      const docsRes = await documentService.getAll({ booking_id: bookingId });
      const docs = Array.isArray(docsRes) ? docsRes : ((docsRes as unknown as { data?: Document[] })?.data ?? []);

      // De-duplicate (API can return duplicates due to joins/pagination).
      // Prefer `storage_path` because it uniquely identifies the blob.
      // Some backends may emit duplicates with different ids/types; collapse them by the actual file identity.
      const docKey = (d: Document) => {
        const storage = String(d.storage_path || '').trim();
        if (storage) return `storage:${storage}`;
        const name = String(d.file_name || '').trim().toLowerCase();
        const size = Number.isFinite(d.file_size) ? String(d.file_size) : '';
        if (name && size) return `file:${name}|${size}`;
        if (name) return `file:${name}`;
        return `fallback:${d.booking_id}|${d.allottee_index}|${d.type}`;
      };
      const byKey = new Map<string, Document>();
      for (const d of docs) {
        const key = docKey(d);
        const existing = byKey.get(key);
        if (!existing) {
          byKey.set(key, d);
          continue;
        }
        // keep the newest record if duplicates exist
        const existingTs = Date.parse(existing.created_at || '') || 0;
        const nextTs = Date.parse(d.created_at || '') || 0;
        if (nextTs >= existingTs) byKey.set(key, d);
      }
      const unique = Array.from(byKey.values());
      unique.sort((a, b) => (Date.parse(b.created_at || '') || 0) - (Date.parse(a.created_at || '') || 0));
      setBookingDocuments(unique);

      // Resolve preview URLs for PDFs (signed-url endpoint returns JSON; we need the actual URL)
      const pdfDocs = unique.filter((d) => d.file_name?.toLowerCase().endsWith('.pdf'));
      await Promise.all(
        pdfDocs.map(async (d) => {
          if (d.preview_url) {
            setDocPreviewUrls((prev) => ({ ...prev, [d.id]: d.preview_url! }));
            return;
          }
          try {
            const res = await documentService.getSignedUrl(d.id);
            if (res?.url) {
              setDocPreviewUrls((prev) => ({ ...prev, [d.id]: res.url }));
            }
          } catch (e) {
            // Leave it blank; UI will show a fallback message
            console.error('Failed to resolve document signed url:', e);
          }
        }),
      );
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setBookingDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const filtered = filterStatus === 'All'
    ? bookings
    : bookings.filter(b => normStatus(b.status) === normStatus(filterStatus));

  const renderedDocuments = React.useMemo(() => {
    // Final safety net: dedupe at render time so the same uploaded PDF never appears twice
    // even if the API returns duplicates with missing fields.
    const seen = new Set<string>();
    const keyForRender = (d: Document) => {
      const isPdf = String(d.file_name || '').toLowerCase().endsWith('.pdf');
      const storage = String(d.storage_path || '').trim();
      const name = String(d.file_name || '').trim().toLowerCase();
      if (isPdf) {
        // PDFs are user uploads; show each filename only once (latest wins).
        // Users often re-upload the same PDF which produces a new storage_path; we still want one entry.
        return `pdf:${name}`;
      }
      return storage ? `doc:${storage}` : `doc:${d.booking_id}|${d.type}|${d.allottee_index}|${name}`;
    };
    return bookingDocuments.filter((d) => {
      const k = keyForRender(d);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [bookingDocuments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">New Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and process customer bookings</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchBookings()}
            className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            title="Reload from server"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFilter(v => !v)}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilter
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
            }`}
          >
            <Filter size={15} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Status:</span>
          {['All', 'draft', 'submitted', 'under_review', 'needs_revision'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'All' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
          <button
            onClick={() => { setFilterStatus('All'); setShowFilter(false); }}
            className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Booking ID', 'Customer Name', 'Project', 'Unit Type', 'Sqft', 'Tower', 'Booking Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-blue-600">{b.id.slice(0, 8)}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {b.allottee ? `${b.allottee.first_name} ${b.allottee.last_name}` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{displayPhone(b.allottee_phone)}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{b.project?.name || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{b.unit?.unit_type || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{b.unit?.carpet_area_sqft || 0}</td>
                  <td className="px-5 py-4">
                    <Badge status={b.unit?.tower || 'N/A'} type="tower" />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={b.status} />
                  </td>
                  <td className="px-5 py-4">
                    {normStatus(b.status) === 'submitted' ? (
                      <button
                        onClick={() => takeOwnership(b.id)}
                        disabled={actionLoading === b.id}
                        className="px-3 md:px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {actionLoading === b.id && <Loader2 size={12} className="animate-spin" />}
                        Take Ownership
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          setViewBooking(b);
                          await loadBookingDocuments(b.id);
                        }}
                        className="px-3 md:px-4 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                    No bookings match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {viewBooking && (
        <Modal
          title="Booking Details"
          onClose={() => {
            setViewBooking(null);
            setBookingDocuments([]);
            setDocPreviewUrls({});
          }}
          size="lg"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Details */}
            <div className="space-y-0">
            {[
              ['Booking ID', viewBooking.id.slice(0, 8)],
              ['Customer', viewBooking.allottee ? `${viewBooking.allottee.first_name} ${viewBooking.allottee.last_name}` : 'N/A'],
              ['Phone', displayPhone(viewBooking.allottee_phone)],
              ['Project', viewBooking.project?.name || 'N/A'],
              ['Unit Type', viewBooking.unit?.unit_type || 'N/A'],
              ['Area', `${viewBooking.unit?.carpet_area_sqft || 0} sq.ft`],
              ['Tower', viewBooking.unit?.tower || 'N/A'],
              ['Booking Date', new Date(viewBooking.created_at).toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm font-medium text-gray-900">{v}</span>
              </div>
            ))}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-gray-500">Status</span>
                <Badge status={viewBooking.status} />
              </div>
            </div>
            
            {/* Uploaded Documents */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText size={16} />
                Uploaded Documents
              </h3>
              {loadingDocuments ? (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : bookingDocuments.length > 0 ? (
                <div className="space-y-3">
                  {renderedDocuments.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{doc.file_name}</span>
                        <Badge status={doc.type} type="tower" />
                      </div>
                      {doc.file_name.toLowerCase().endsWith('.pdf') && (
                        docPreviewUrls[doc.id] ? (
                          <iframe
                            src={docPreviewUrls[doc.id]}
                            className="w-full h-96 border border-gray-200 rounded"
                            title={doc.file_name}
                          />
                        ) : (
                          <div className="w-full h-40 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                            Unable to preview PDF. Use download/share link from backend.
                          </div>
                        )
                      )}
                      {doc.notes && (
                        <p className="text-xs text-gray-500 mt-2">{doc.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <FileText size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                </div>
              )}
            </div>
          </div>
          
          {(() => {
            const s = normStatus(viewBooking.status);
            // Agents submit into draft/submitted depending on backend RPC behavior.
            // Allow admin to approve/reject by auto-starting review when needed.
            const canApproveReject = s === 'under_review' || s === 'submitted' || s === 'draft';
            const canTakeOwnership = s === 'submitted' || s === 'draft';
            return (
              <div className="mt-6 space-y-3">
                {/* Always show action area so admin knows what to do */}
                {canTakeOwnership && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await takeOwnership(viewBooking.id);
                        // keep modal open but refresh data
                        const updated = { ...viewBooking, status: 'under_review' as any };
                        setViewBooking(updated);
                      } catch {
                        // toast handled in takeOwnership
                      }
                    }}
                    disabled={actionLoading === viewBooking.id}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === viewBooking.id ? 'Starting review...' : 'Take Ownership'}
                  </button>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (normStatus(viewBooking.status) !== 'under_review') {
                          await bookingService.startReview(viewBooking.id);
                        }
                        await bookingService.completeReview(viewBooking.id, 'approve');
                        setToast({ message: 'Booking approved successfully!', type: 'success' });
                        setViewBooking(null);
                        fetchBookings();
                        window.location.assign('/agreements');
                      } catch (error: any) {
                        setToast({ message: error?.message || 'Failed to approve booking', type: 'error' });
                      }
                    }}
                    disabled={!canApproveReject}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    title={!canApproveReject ? 'Approve is not available' : undefined}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (normStatus(viewBooking.status) !== 'under_review') {
                          await bookingService.startReview(viewBooking.id);
                        }
                        await bookingService.completeReview(viewBooking.id, 'reject', 'Rejected by manager');
                        setToast({ message: 'Booking rejected', type: 'success' });
                        setViewBooking(null);
                        fetchBookings();
                      } catch (error: any) {
                        setToast({ message: error?.message || 'Failed to reject booking', type: 'error' });
                      }
                    }}
                    disabled={!canApproveReject}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    title={!canApproveReject ? 'Reject is not available' : undefined}
                  >
                    Reject
                  </button>
                </div>

                {s === 'draft' && (
                  <div className="text-xs text-gray-500">
                    This booking is still in <span className="font-semibold">draft</span>. It must be submitted by the agent to appear as new work.
                  </div>
                )}
              </div>
            );
          })()}
          
          <button
            onClick={() => setViewBooking(null)}
            className="mt-4 w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </Modal>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default NewBookings;
