import React, { useState, useRef } from 'react';
import { Upload, Eye, HardHat } from 'lucide-react';
import { constructionUpdates as initialUpdates, projects, towers } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import Toast from '../components/ui/Toast';

type Update = typeof initialUpdates[0];

const ConstructionUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTower, setSelectedTower] = useState('');
  const [stage, setStage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') setSelectedFile(file);
    else setToast({ message: 'Only PDF files are accepted.', type: 'error' });
  };

  const handleUpload = () => {
    if (!selectedProject || !selectedTower || !stage.trim()) {
      setToast({ message: 'Please fill in project, tower, and stage fields.', type: 'error' });
      return;
    }
    if (!selectedFile) {
      setToast({ message: 'Please select a PDF file to upload.', type: 'error' });
      return;
    }
    const newUpdate: Update = {
      id: `CU${String(updates.length + 1).padStart(3, '0')}`,
      project: selectedProject,
      tower: selectedTower,
      stage: stage.trim(),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setUpdates(prev => [newUpdate, ...prev]);
    setSelectedProject('');
    setSelectedTower('');
    setStage('');
    setSelectedFile(null);
    setToast({ message: 'Construction update uploaded successfully!', type: 'success' });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Construction Updates</h1>
          <p className="text-gray-500 text-sm mt-1">Upload and track construction progress</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
        >
          <Upload size={15} />
          <span className="hidden sm:inline">Upload Update</span>
        </button>
      </div>

      {/* Quick Upload */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <HardHat size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-900">Quick Upload</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400"
          >
            <option value="">Select Project</option>
            {projects.map(p => <option key={p}>{p}</option>)}
          </select>
          <select
            value={selectedTower}
            onChange={e => setSelectedTower(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400"
          >
            <option value="">Select Tower</option>
            {towers.map(t => <option key={t}>{t}</option>)}
          </select>
          <input
            type="text"
            placeholder="Enter Stage (e.g., Floor 2 Completed)"
            value={stage}
            onChange={e => setStage(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 md:p-10 text-center cursor-pointer transition-colors mb-4 ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
          />
          <Upload size={28} className="mx-auto mb-2 text-gray-400" />
          {selectedFile ? (
            <div>
              <p className="text-sm font-medium text-blue-600">{selectedFile.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB — ready to upload</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">Click to upload PDF or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PDF files up to 10MB</p>
            </>
          )}
        </div>

        <button
          onClick={handleUpload}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          Upload Construction Update
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Construction Updates History</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
            {updates.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Update ID', 'Project', 'Tower', 'Stage', 'Upload Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {updates.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-blue-600">{u.id}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{u.project}</td>
                  <td className="px-5 py-4">
                    <Badge status={u.tower} type="tower" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      <span className="text-sm text-gray-700">{u.stage}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{u.uploadDate}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setToast({ message: `Viewing PDF for ${u.id} — ${u.stage}`, type: 'success' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Eye size={13} />
                      View PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default ConstructionUpdates;
