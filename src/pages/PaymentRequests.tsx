import React, { useState, useRef } from 'react';
import { FileText, Send, CheckCircle } from 'lucide-react';
import { customers, projects, towers, emailTemplates } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import Toast from '../components/ui/Toast';

const PaymentRequests: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTower, setSelectedTower] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0].name);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = customers.filter(c => {
    const matchProject = !selectedProject || c.project === selectedProject;
    const matchTower = !selectedTower || c.tower === selectedTower;
    return matchProject && matchTower && selectedProject && selectedTower;
  });

  const toggleCustomer = (id: string) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleSend = () => {
    if (selectedCustomers.length === 0) return;
    if (!pdfFile) {
      setToast({ message: 'Please attach a construction PDF before sending.', type: 'error' });
      return;
    }
    const count = selectedCustomers.length;
    setSent(true);
    setSelectedCustomers([]);
    setPdfFile(null);
    setToast({
      message: `Payment request sent to ${count} customer(s) successfully!`,
      type: 'success',
    });
    setTimeout(() => setSent(false), 2000);
  };

  const currentTemplate = emailTemplates.find(t => t.name === selectedTemplate);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Payment Request System</h1>
        <p className="text-gray-500 text-sm mt-1">Create and send payment requests to customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Select Project & Tower */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Select Project & Tower</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Select Project</label>
                <select
                  value={selectedProject}
                  onChange={e => { setSelectedProject(e.target.value); setSelectedCustomers([]); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">Choose Project</option>
                  {projects.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Select Tower</label>
                <select
                  value={selectedTower}
                  onChange={e => { setSelectedTower(e.target.value); setSelectedCustomers([]); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">Choose Tower</option>
                  {towers.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Customer List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredCustomers.length === 0 ? (
              <div className="p-12 md:p-16 text-center">
                <FileText size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm font-medium">Select a project and tower</p>
                <p className="text-gray-400 text-xs mt-1">Customer list will appear here automatically</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3.5 w-10">
                        <input
                          type="checkbox"
                          checked={filteredCustomers.length > 0 && selectedCustomers.length === filteredCustomers.length}
                          onChange={toggleAll}
                          className="rounded border-gray-300 text-blue-600 w-4 h-4"
                        />
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(c.id)}
                            onChange={() => toggleCustomer(c.id)}
                            className="rounded border-gray-300 text-blue-600 w-4 h-4"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.id}</div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">{c.unit}</td>
                        <td className="px-5 py-3.5">
                          <Badge status={c.bookingStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Request Configuration */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Request Configuration</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Attach Construction PDF</label>
              <div
                className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-colors ${
                  pdfFile ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => setPdfFile(e.target.files?.[0] || null)}
                />
                <FileText size={22} className={`mx-auto mb-1.5 ${pdfFile ? 'text-blue-500' : 'text-gray-400'}`} />
                {pdfFile ? (
                  <div>
                    <p className="text-xs text-blue-600 font-medium">{pdfFile.name}</p>
                    <p className="text-xs text-blue-400 mt-0.5">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Click to upload PDF</p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1.5">Select Email Template</label>
              <select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400"
              >
                {emailTemplates.map(t => <option key={t.id}>{t.name}</option>)}
              </select>
            </div>
            {currentTemplate && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Template Variables:</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentTemplate.variables.map(v => (
                    <span key={v} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-mono">{v}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={selectedCustomers.length === 0}
            className={`w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
              selectedCustomers.length > 0
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm cursor-pointer'
                : 'bg-green-100 text-green-600 cursor-not-allowed'
            }`}
          >
            {sent ? <CheckCircle size={16} /> : <Send size={16} />}
            {sent ? 'Sent!' : `Send Payment Request (${selectedCustomers.length})`}
          </button>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Project:</span>
                <span className="text-gray-700 font-medium text-right ml-2 truncate">{selectedProject || 'Not selected'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tower:</span>
                <span className="text-gray-700 font-medium">{selectedTower || 'Not selected'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customers:</span>
                <span className="text-gray-700 font-medium">{selectedCustomers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">PDF Attached:</span>
                <span className={`font-medium text-xs ${pdfFile ? 'text-green-600' : 'text-gray-400'}`}>
                  {pdfFile ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default PaymentRequests;
