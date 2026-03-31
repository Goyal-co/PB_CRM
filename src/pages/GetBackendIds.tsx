import React, { useState } from 'react';
import { Loader2, Copy, Check } from 'lucide-react';

interface IDResult {
  projectId?: string;
  projectName?: string;
  unitId?: string;
  unitName?: string;
  formTemplateId?: string;
  formTemplateName?: string;
  agreementTemplateId?: string;
  agreementTemplateName?: string;
}

const GetBackendIds: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<IDResult>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [step, setStep] = useState<string>('');

  const API_BASE = 'https://pbcrmbackend-production.up.railway.app/api/v1';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const fetchAllIds = async () => {
    setLoading(true);
    setError(null);
    setResults({});
    setStep('');

    try {
      // Step 1: Login
      setStep('Logging in as super admin...');
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'e2e-super-admin@orchidlife.in',
          password: 'E2E_SuperAdmin_2026!'
        })
      });

      if (!loginRes.ok) throw new Error('Login failed');

      const loginData = await loginRes.json();
      const token = loginData.data.access_token;

      // Step 2: Get Projects
      setStep('Fetching projects...');
      const projectsRes = await fetch(`${API_BASE}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!projectsRes.ok) throw new Error('Failed to fetch projects');

      const projectsData = await projectsRes.json();
      const project = projectsData.data?.[0];

      if (!project) {
        throw new Error('No projects found. Please create a project first.');
      }

      const projectId = project.id;
      const projectName = project.name;

      // Step 3: Get Units
      setStep('Fetching units...');
      const unitsRes = await fetch(`${API_BASE}/units?project_id=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!unitsRes.ok) throw new Error('Failed to fetch units');

      const unitsData = await unitsRes.json();
      const unit = unitsData.data?.find((u: any) => u.status === 'available');

      if (!unit) {
        throw new Error('No available units found. Please create a unit first.');
      }

      const unitId = unit.id;
      const unitName = `${unit.tower}-${unit.unit_no} (${unit.unit_type})`;

      // Step 4: Get Form Templates
      setStep('Fetching form templates...');
      const formRes = await fetch(`${API_BASE}/form-templates?project_id=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!formRes.ok) throw new Error('Failed to fetch form templates');

      const formData = await formRes.json();
      const formTemplate = formData.data?.[0];

      if (!formTemplate) {
        throw new Error('No form templates found. Please create one first.');
      }

      const formTemplateId = formTemplate.id;
      const formTemplateName = formTemplate.name;

      // Step 5: Get Agreement Templates
      setStep('Fetching agreement templates...');
      const agreementRes = await fetch(`${API_BASE}/agreement-templates?project_id=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!agreementRes.ok) throw new Error('Failed to fetch agreement templates');

      const agreementData = await agreementRes.json();
      const agreementTemplate = agreementData.data?.[0];

      if (!agreementTemplate) {
        throw new Error('No agreement templates found. Please create one first.');
      }

      const agreementTemplateId = agreementTemplate.id;
      const agreementTemplateName = agreementTemplate.name;

      // Set all results
      setResults({
        projectId,
        projectName,
        unitId,
        unitName,
        formTemplateId,
        formTemplateName,
        agreementTemplateId,
        agreementTemplateName
      });

      setStep('✓ All IDs fetched successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStep('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🔑 Get Backend IDs</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fetch all required IDs from your backend automatically
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ What this does:</strong><br />
          This tool will login to your backend as <strong>e2e-super-admin@orchidlife.in</strong> and fetch all 4 required IDs for the booking form.
        </p>
      </div>

      <button
        onClick={fetchAllIds}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : results.projectId
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {step}
          </span>
        ) : results.projectId ? (
          '✓ All IDs Fetched Successfully!'
        ) : (
          'Fetch All IDs'
        )}
      </button>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">✗ Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {results.projectId && (
        <div className="mt-6 space-y-4">
          {/* Project ID */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">1. Project ID</h3>
              <button
                onClick={() => copyToClipboard(results.projectId!, 'project')}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                {copiedId === 'project' ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Project: {results.projectName}</p>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 font-mono text-sm break-all">
              {results.projectId}
            </div>
          </div>

          {/* Unit ID */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">2. Unit ID</h3>
              <button
                onClick={() => copyToClipboard(results.unitId!, 'unit')}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                {copiedId === 'unit' ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Unit: {results.unitName}</p>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 font-mono text-sm break-all">
              {results.unitId}
            </div>
          </div>

          {/* Form Template ID */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">3. Form Template ID</h3>
              <button
                onClick={() => copyToClipboard(results.formTemplateId!, 'form')}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                {copiedId === 'form' ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Template: {results.formTemplateName}</p>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 font-mono text-sm break-all">
              {results.formTemplateId}
            </div>
          </div>

          {/* Agreement Template ID */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">4. Agreement Template ID</h3>
              <button
                onClick={() => copyToClipboard(results.agreementTemplateId!, 'agreement')}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                {copiedId === 'agreement' ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Template: {results.agreementTemplateName}</p>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 font-mono text-sm break-all">
              {results.agreementTemplateId}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">✅ All IDs Retrieved!</p>
            <p className="text-green-700 text-sm mt-1">
              Copy these IDs and paste them into the booking form.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetBackendIds;
