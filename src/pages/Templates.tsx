import React, { useState, useRef } from 'react';
import { Plus, FileText, Pencil, Trash2, Upload, Mail } from 'lucide-react';
import { agreementTemplates as initialAgreementTemplates, emailTemplates as initialEmailTemplates } from '../data/mockData';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

type AgreementTemplate = { id: number; name: string; type: string; uploadDate: string };
type EmailTemplate = { id: number; name: string; variables: string[] };

const Templates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agreement' | 'email'>('agreement');
  const [agreementTemplates, setAgreementTemplates] = useState<AgreementTemplate[]>(initialAgreementTemplates);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(initialEmailTemplates);
  const [editTarget, setEditTarget] = useState<{ id: number; name: string; type: 'agreement' | 'email' } | null>(null);
  const [editName, setEditName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newTemplate: AgreementTemplate = {
      id: Date.now(),
      name: file.name.replace(/\.[^.]+$/, ''),
      type: 'PDF',
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setAgreementTemplates(prev => [...prev, newTemplate]);
    setToast({ message: `Template "${newTemplate.name}" uploaded successfully!`, type: 'success' });
    e.target.value = '';
  };

  const openEdit = (id: number, name: string, type: 'agreement' | 'email') => {
    setEditTarget({ id, name, type });
    setEditName(name);
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      setToast({ message: 'Template name cannot be empty.', type: 'error' });
      return;
    }
    if (editTarget!.type === 'agreement') {
      setAgreementTemplates(prev =>
        prev.map(t => t.id === editTarget!.id ? { ...t, name: editName.trim() } : t)
      );
    } else {
      setEmailTemplates(prev =>
        prev.map(t => t.id === editTarget!.id ? { ...t, name: editName.trim() } : t)
      );
    }
    setToast({ message: 'Template name updated successfully!', type: 'success' });
    setEditTarget(null);
  };

  const deleteAgreement = (id: number) => {
    setAgreementTemplates(prev => prev.filter(t => t.id !== id));
    setToast({ message: 'Agreement template deleted.', type: 'success' });
  };

  const deleteEmail = (id: number) => {
    setEmailTemplates(prev => prev.filter(t => t.id !== id));
    setToast({ message: 'Email template deleted.', type: 'success' });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage agreement and email templates</p>
        </div>
        <button
          onClick={() => {
            setActiveTab('agreement');
            setTimeout(() => fileInputRef.current?.click(), 50);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Template</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 pt-4">
          <button
            onClick={() => setActiveTab('agreement')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'agreement'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} />
            Agreement Templates
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ml-2 ${
              activeTab === 'email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail size={16} />
            Payment Email Templates
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'agreement' && (
            <div className="space-y-3">
              {agreementTemplates.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.type} • Uploaded on {t.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button
                      onClick={() => openEdit(t.id, t.name, 'agreement')}
                      className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit name"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteAgreement(t.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Drop Zone */}
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload size={28} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 font-medium">Upload New Agreement Template</p>
                <p className="text-xs text-gray-400 mt-1">PDF or DOC files up to 10MB</p>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-3">
              {emailTemplates.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                      <Mail size={20} className="text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{t.name}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {t.variables.map(v => (
                          <span key={v} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded font-mono">{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button
                      onClick={() => openEdit(t.id, t.name, 'email')}
                      className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit name"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteEmail(t.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <Modal title="Edit Template Name" onClose={() => setEditTarget(null)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Template Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Templates;
