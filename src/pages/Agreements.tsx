
import React, { useState, useEffect } from 'react';
import { Filter, Eye, Download, Printer, CheckCircle, RefreshCw, Copy, X, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { bookingService, type Booking } from '../services/bookingService';
import { agreementTemplateService, type MergedAgreement } from '../services/agreementTemplateService';
import { fieldValueService } from '../services/fieldValueService';
// NOTE: We avoid client-side PDF generation (html2pdf.js) for performance.

// Renders agreement HTML inside an iframe to fully isolate styles from the main page
const AgreementPreviewFrame: React.FC<{ html: string }> = ({ html }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>
      body { margin: 0; padding: 20px; font-family: 'Times New Roman', serif; }
      * { box-sizing: border-box; }
    </style></head><body>${html}</body></html>`);
    doc.close();
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full border border-gray-200 rounded-lg"
      style={{ height: '65vh', minHeight: '500px' }}
      title="Agreement Preview"
    />
  );
};

const Agreements: React.FC = () => {
  const [agreements, setAgreements] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAgreement, setViewAgreement] = useState<Booking | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [previewAgreement, setPreviewAgreement] = useState<{ booking: Booking; merged: MergedAgreement | null; loading: boolean } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const mergedCache = React.useRef<Record<string, MergedAgreement>>({});

  const buildValueMap = async (booking: Booking): Promise<Record<string, string>> => {
    // Fetch full booking detail and field values in one parallel call
    const [fullBookingRes, fieldValues] = await Promise.all([
      bookingService.getById(booking.id).catch(() => null),
      fieldValueService.getByBooking(booking.id).catch(() => null),
    ]);

    const fb = fullBookingRes || booking;
    const raw = fb as unknown as Record<string, unknown>;

    const now = new Date();
    const createdAt = new Date((raw.application_date as string) || fb.created_at);

    const valueMap: Record<string, string> = {
      agreement_day: createdAt.getDate().toString(),
      agreement_month: createdAt.toLocaleString('en-IN', { month: 'long' }),
      agreement_year: createdAt.getFullYear().toString(),
      agreement_date: createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      current_date: now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      current_day: now.getDate().toString(),
      current_month: now.toLocaleString('en-IN', { month: 'long' }),
      current_year: now.getFullYear().toString(),
      booking_id: fb.id,
      booking_status: fb.status,
      application_no: (raw.application_no as string) || '',
      allottee_name: (raw.allottee_name as string) || (fb.allottee ? `${fb.allottee.first_name} ${fb.allottee.last_name}` : ''),
      allottee_first_name: fb.allottee?.first_name || ((raw.allottee_name as string) || '').split(' ').slice(0, -1).join(' '),
      allottee_last_name: fb.allottee?.last_name || ((raw.allottee_name as string) || '').split(' ').slice(-1)[0] || '',
      allottee_email: fb.allottee_email || fb.allottee?.email || '',
      allottee_phone: (raw.allottee_phone as string) || fb.allottee_phone || fb.allottee?.phone || '',
      allottee_address: fb.allottee_address || '',
      aadhar_no: (raw.aadhar_no as string) || '',
      project_name: (raw.project_name as string) || fb.project?.name || '',
      unit_no: (raw.unit_no as string) || fb.unit?.unit_no || '',
      tower: (raw.tower as string) || fb.unit?.tower || '',
      floor_no: (raw.floor_no as number)?.toString() || '',
      unit_type: (raw.unit_type as string) || fb.unit?.unit_type || '',
      carpet_area_sqft: ((raw.carpet_area_sqft as number) || fb.unit?.carpet_area_sqft)?.toString() || '',
      super_built_up_sqft: (raw.super_built_up_sqft as number)?.toString() || '',
      basic_sale_value: (raw.basic_sale_value as number)?.toString() || '',
      gross_apartment_value: (raw.gross_apartment_value as number)?.toString() || '',
      manager_name: (raw.manager_name as string) || '',
      agent_name: fb.agent_name || (raw.manager_name as string) || '',
      agent_rera_no: fb.agent_rera_no || '',
      agent_contact_no: fb.agent_contact_no || '',
      agent_email: fb.agent_email || '',
      fund_source: fb.fund_source || '',
      home_loan_pct: fb.home_loan_pct?.toString() || '',
      booking_amount: (raw.booking_amount as number)?.toString() || '',
      total_collected: (raw.total_collected as number)?.toString() || '',
      total_due: (raw.total_due as number)?.toString() || '',
    };

    if (fieldValues) {
      for (const [fieldKey, fv] of Object.entries(fieldValues)) {
        const val = fv.value_text
          ?? fv.value_number?.toString()
          ?? (fv.value_date ? new Date(fv.value_date).toLocaleDateString('en-IN') : null)
          ?? (fv.value_boolean !== undefined && fv.value_boolean !== null ? (fv.value_boolean ? 'Yes' : 'No') : null)
          ?? '';
        valueMap[fieldKey] = val;
      }
    }

    for (const [key, value] of Object.entries(raw)) {
      if (value !== null && value !== undefined && !valueMap[key]) {
        valueMap[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
      }
    }

    return valueMap;
  };

  const applyPlaceholders = (html: string, valueMap: Record<string, string>): string => {
    let resolved = html;
    resolved = resolved.replace(/\{\{(\w+)\}\}/g, (_match, key) => valueMap[key] ?? '');
    resolved = resolved.replace(/\{(\w+)\}/g, (_match, key) => valueMap[key] ?? '');
    return resolved;
  };

  const pollAgreementUrl = async (bookingId: string, timeoutMs = 25_000) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const res = await bookingService.getAgreementDownloadUrl(bookingId);
      if (res.cached && res.url) return res.url;
      await new Promise(r => setTimeout(r, 1200));
    }
    return null;
  };

  const handleDownloadAgreement = async (booking: Booking) => {
    try {
      setPrintingId(booking.id);
      // Fast path: if a cached PDF exists in Supabase Storage, download is instant.
      try {
        const first = await bookingService.getAgreementDownloadUrl(booking.id, { async: true });
        if (first.cached && first.url) {
          window.location.assign(first.url);
          setToast({ message: 'Downloading agreement PDF...', type: 'success' });
          return;
        }

        // Not cached: backend is generating in background. Poll briefly, otherwise tell user to retry.
        const url = await pollAgreementUrl(booking.id);
        if (url) {
          window.location.assign(url);
          setToast({ message: 'Downloading agreement PDF...', type: 'success' });
          return;
        }

        setToast({
          message: 'Agreement PDF is being generated. Please try again in a few seconds.',
          type: 'success',
        });
        return;
      } catch (e: any) {
        // If the production backend hasn't deployed agreement-download-url yet, fall back to direct API PDF download.
        const msg = e?.message ? String(e.message) : '';
        if (msg.includes('Cannot GET') && msg.includes('agreement-download-url')) {
          const res = await bookingService.downloadAgreementPdf(booking.id);
          if (!res.contentType.toLowerCase().includes('application/pdf')) {
            throw new Error('Server did not return a PDF');
          }
          const url = URL.createObjectURL(res.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `agreement-${booking.id}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
          setToast({ message: 'Downloading agreement PDF...', type: 'success' });
          return;
        }
        throw e;
      }
    } catch (error) {
      console.error('Failed to download agreement:', error);
      setToast({ message: 'Failed to download agreement', type: 'error' });
    } finally {
      setPrintingId(null);
    }
  };

  const fetchMergedOrFallback = async (booking: Booking): Promise<MergedAgreement> => {
    // Fetch merged-agreement and full booking detail in parallel
    const [mergedResult, bookingDetail] = await Promise.allSettled([
      agreementTemplateService.getMergedAgreement(booking.id),
      bookingService.getById(booking.id),
    ]);

    // If merged-agreement returned HTML, use it directly
    if (mergedResult.status === 'fulfilled' && mergedResult.value.merged_html) {
      return mergedResult.value;
    }

    // Use full booking to get agreement_template_id
    const fullBooking = (bookingDetail.status === 'fulfilled' ? bookingDetail.value : booking) as unknown as Record<string, unknown>;
    const agreementTemplateId = fullBooking.agreement_template_id as string;

    if (agreementTemplateId) {
      const template = await agreementTemplateService.getById(agreementTemplateId);
      if (template.body_html) {
        return {
          merged_html: template.body_html,
          header_html: template.header_html,
          footer_html: template.footer_html,
          page_size: template.page_size || 'A4',
          margins: { top: template.margin_top, bottom: template.margin_bottom, left: template.margin_left, right: template.margin_right },
        };
      }
    }

    // Fallback: fetch active templates for this project
    const projectId = (fullBooking.project_id as string) || booking.project_id;
    const templatesRes = await agreementTemplateService.getAll({ project_id: projectId, is_active: true });
    const templateList = Array.isArray(templatesRes) ? templatesRes : (templatesRes as unknown as { data: typeof templatesRes }).data || [];
    if (templateList.length > 0) {
      const template = await agreementTemplateService.getById(templateList[0].id);
      if (template.body_html) {
        return {
          merged_html: template.body_html,
          header_html: template.header_html,
          footer_html: template.footer_html,
          page_size: template.page_size || 'A4',
          margins: { top: template.margin_top, bottom: template.margin_bottom, left: template.margin_left, right: template.margin_right },
        };
      }
    }

    throw new Error('No agreement template found for this booking');
  };

  const handlePreviewAgreement = async (booking: Booking) => {
    // Check cache first — if cached, open instantly
    const cached = mergedCache.current[booking.id];
    if (cached) {
      setPreviewAgreement({ booking, merged: cached, loading: false });
      return;
    }

    // Open modal immediately with loading state
    setPreviewLoadingId(booking.id);
    setPreviewAgreement({ booking, merged: null, loading: true });

    try {
      // Fast preview path: get already-merged full HTML from backend.
      // (Avoids fetching field values + doing placeholder merges in the browser.)
      const html = await bookingService.getAgreementHtml(booking.id);
      const merged: MergedAgreement = {
        merged_html: html,
        header_html: '',
        footer_html: '',
        page_size: 'A4',
        margins: { top: 20, right: 15, bottom: 20, left: 15 },
      };
      mergedCache.current[booking.id] = merged;
      setPreviewAgreement({ booking, merged, loading: false });
    } catch (error) {
      console.error('Failed to load agreement preview:', error);
      setPreviewAgreement(null);
      setToast({ message: 'Failed to load agreement preview', type: 'error' });
    } finally {
      setPreviewLoadingId(null);
    }
  };

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getAll({ status: 'approved' });
        // Handle both array and paginated { data: [], meta: {} } response shapes
        const list: Booking[] = Array.isArray(response) ? response : (response as unknown as { data: Booking[] }).data || [];

        // Map flat API fields to the nested Booking shape used by the UI
        const mapped = list.map((b) => {
          const raw = b as unknown as Record<string, unknown>;
          return {
            ...b,
            allottee: b.allottee || (raw.allottee_name ? {
              first_name: (raw.allottee_name as string).split(' ').slice(0, -1).join(' ') || (raw.allottee_name as string),
              last_name: (raw.allottee_name as string).split(' ').slice(-1)[0] || '',
              email: (raw.allottee_email as string) || b.allottee_email || '',
              phone: (raw.allottee_phone as string) || b.allottee_phone,
            } : undefined),
            project: b.project || (raw.project_name ? { name: raw.project_name as string } : undefined),
            unit: b.unit || (raw.unit_no ? {
              unit_no: raw.unit_no as string,
              tower: (raw.tower as string) || '',
              unit_type: (raw.unit_type as string) || '',
              carpet_area_sqft: (raw.carpet_area_sqft as number) || 0,
            } : undefined),
            agent_name: b.agent_name || (raw.manager_name as string) || undefined,
          } as Booking;
        });

        setAgreements(mapped);
      } catch (error) {
        console.error('Failed to fetch agreements:', error);
        setToast({ message: 'Failed to load agreements', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchAgreements();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      // This would call an API to update agreement status
      setAgreements(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
      setToast({ message: `Agreement updated successfully.`, type: 'success' });
      setViewAgreement(null);
    } catch (error) {
      console.error('Failed to update agreement:', error);
      setToast({ message: 'Failed to update agreement', type: 'error' });
    }
  };

  const underReview = agreements.filter(a => a.status === 'under_review').length;
  const approved = agreements.filter(a => a.status === 'approved' || a.status === 'agreement_generated').length;
  const rework = agreements.filter(a => a.status === 'needs_revision').length;

  const filtered = filterStatus === 'All'
    ? agreements
    : agreements.filter(a => a.status.toLowerCase() === filterStatus.toLowerCase());

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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Agreements</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all customer agreements</p>
        </div>
        <button
          onClick={() => setShowFilter(v => !v)}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 border rounded-lg text-sm font-medium transition-colors shrink-0 ${
            showFilter
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
          }`}
        >
          <Filter size={15} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Status:</span>
          {['All', 'under_review', 'approved', 'agreement_generated', 'needs_revision'].map(s => (
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Under Review', value: underReview, color: 'text-orange-500', bg: 'bg-orange-50', icon: 'text-orange-400' },
          { label: 'Approved', value: approved, color: 'text-green-600', bg: 'bg-green-50', icon: 'text-green-400' },
          { label: 'Rework', value: rework, color: 'text-red-500', bg: 'bg-red-50', icon: 'text-red-400' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Copy size={20} className={icon} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Agreement ID', 'Customer Name', 'Project', 'Unit', 'Status', 'Created By', 'Created Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-blue-600">{a.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {a.allottee ? `${a.allottee.first_name} ${a.allottee.last_name}` : 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{a.project?.name || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {a.unit ? `${a.unit.tower}-${a.unit.unit_no}` : 'N/A'}
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={a.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{a.agent_name || 'System'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewAgreement(a)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Agreement"
                        disabled={previewLoadingId === a.id}
                      >
                        {previewLoadingId === a.id ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDownloadAgreement(a)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download Agreement PDF"
                        disabled={printingId === a.id}
                      >
                        {printingId === a.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      </button>
                      {a.status === 'under_review' && (
                        <>
                          <button
                            onClick={() => updateStatus(a.id, 'Approved')}
                            className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => updateStatus(a.id, 'Rework')}
                            className="p-1.5 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Send for Rework"
                          >
                            <RefreshCw size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    No agreements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Agreement Details Modal */}
      {viewAgreement && (
        <Modal title="Agreement Details" onClose={() => setViewAgreement(null)} size="sm">
          <div className="space-y-0">
            {[
              ['Agreement ID', viewAgreement.id.slice(0, 8)],
              ['Customer', viewAgreement.allottee ? `${viewAgreement.allottee.first_name} ${viewAgreement.allottee.last_name}` : 'N/A'],
              ['Project', viewAgreement.project?.name || 'N/A'],
              ['Unit', viewAgreement.unit ? `${viewAgreement.unit.tower}-${viewAgreement.unit.unit_no}` : 'N/A'],
              ['Created By', viewAgreement.agent_name || 'System'],
              ['Created Date', new Date(viewAgreement.created_at).toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm font-medium text-gray-900">{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-gray-500">Status</span>
              <Badge status={viewAgreement.status} />
            </div>
          </div>

          {/* Action buttons in modal */}
          {viewAgreement.status === 'under_review' && (
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => updateStatus(viewAgreement.id, 'Approved')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={15} />
                Approve
              </button>
              <button
                onClick={() => updateStatus(viewAgreement.id, 'Rework')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                <RefreshCw size={15} />
                Send for Rework
              </button>
            </div>
          )}

          <button
            onClick={() => setViewAgreement(null)}
            className="mt-3 w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </Modal>
      )}

      {/* Agreement Preview Modal */}
      {previewAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-semibold text-gray-900">Agreement - {previewAgreement.booking.id.slice(0, 8)}</h3>
              <button
                onClick={() => setPreviewAgreement(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-hidden p-5">
              {previewAgreement.loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : previewAgreement.merged?.merged_html ? (
                <AgreementPreviewFrame
                  html={[
                    previewAgreement.merged.header_html || '',
                    previewAgreement.merged.merged_html,
                    previewAgreement.merged.footer_html || '',
                  ].join('')}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                  No agreement content available for this booking.
                </div>
              )}
            </div>
            {/* Footer Buttons */}
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
              <button
                disabled={!previewAgreement.merged}
                onClick={() => {
                  const { merged, booking } = previewAgreement;
                  if (!merged) return;
                  const displayHtml = `${merged.header_html || ''}${merged.merged_html}${merged.footer_html || ''}`;
                  const customerName = booking.allottee
                    ? `${booking.allottee.first_name} ${booking.allottee.last_name}`
                    : booking.id.slice(0, 8);
                  const htmlContent = `<!DOCTYPE html><html><head>
                    <title>Agreement - ${customerName}</title>
                    <style>
                      @page { size: ${merged.page_size || 'A4'}; margin: ${merged.margins?.top ?? 20}mm ${merged.margins?.right ?? 15}mm ${merged.margins?.bottom ?? 20}mm ${merged.margins?.left ?? 15}mm; }
                      body { margin: 0; padding: 0; font-family: 'Times New Roman', serif; }
                      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                    </style>
                  </head><body>${displayHtml}</body></html>`;

                  const printWindow = window.open('', '_blank');
                  if (!printWindow) {
                    setToast({ message: 'Please allow pop-ups to print', type: 'error' });
                    return;
                  }
                  printWindow.document.write(htmlContent);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => printWindow.print(), 500);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Printer size={15} />
                Print
              </button>
              <button
                disabled={!previewAgreement.merged}
                onClick={() => handleDownloadAgreement(previewAgreement.booking)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download size={15} />
                Download PDF
              </button>
              <button
                onClick={() => setPreviewAgreement(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Agreements;
