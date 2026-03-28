import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Save, Printer, Upload, CheckSquare, FileText, ChevronLeft, ChevronRight, Eye, Plus, X, Edit2, Check } from 'lucide-react';
import Toast from '../components/ui/Toast';

interface CustomField {
  id: string;
  label: string;
  value: string;
}

const BookingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [projectTitle, setProjectTitle] = useState('ORCHID LIFE');
  const [customFields, setCustomFields] = useState<Record<number, CustomField[]>>({});
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [formData, setFormData] = useState({
    applicationDate: '', applicationNo: '', apartmentNo: '',
    photo1: null as File | null, photo2: null as File | null, photo3: null as File | null,
    landArea: '', projectPhase: '', sanctionBy: '', planSanctionNo: '',
    reraWebsite: '', reraNumber: '',
    promoterName: '', promoterAddress: '',
    apartmentType: '', building: '', unitNo: '', wing: '', floorNo: '', saleableArea: '',
    carpetAreaSqft: '', carpetAreaSqmt: '', balconyAreaSqft: '', balconyAreaSqmt: '',
    carParks: '', unitPricePerSqft: '', unitPricePerSqftCarpet: '', basicSaleValue: '',
    gst: '', basicSaleValueWithGst: '', otherCostCharges: '', grossApartmentValue: '',
    grossApartmentValueWords: '', offersApplicable: '',
    firstName1: '', surname1: '', fatherHusbandName1: '', dob1: '', maritalStatus1: '',
    pan1: '', aadhar1: '', nationality1: '',
    firstName2: '', surname2: '', fatherHusbandName2: '', dob2: '', maritalStatus2: '',
    pan2: '', aadhar2: '', nationality2: '',
    communicationAddress: '', permanentAddress: '',
    occupation1: [] as string[], employerName1: '', designation1: '', placeOfEmployment1: '',
    occupation2: [] as string[], employerName2: '', designation2: '', placeOfEmployment2: '',
    mobile1: '', email1: '', mobile2: '', email2: '', preferredContact: '',
    fundingSource: '', homeLoanPercent: '',
    poaHolder: '', poaRelationship: '', poaContact: '', poaPan: '', poaAadhar: '', poaEmail: '', poaAddress: '',
    enquirySources: [] as string[], enquiryDetails: '',
    agentName: '', representedBy: '', agentContact: '', agentEmail: '', agentReraNo: '',
    wireTransferNo: '', upiTransactionNo: '', paymentDated: '', drawnOn: '', paymentPlace: '', paymentAmount: '', paymentAmountWords: '',
    vendorAddress: '', vendorAttention: '', vendorTelephone: '', vendorEmail: '',
    allotteeAddress: '', allotteeAttention: '', allotteeTelephone: '', allotteeEmail: '',
    kycDocs: [] as string[],
    termsAccepted: false, declarationDate: '', declarationPlace: '',
    salesAdvisorName: '', approvedBy: '', authorizedSignatory: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'termsAccepted') {
        setFormData(prev => ({ ...prev, termsAccepted: checked }));
      } else if (name.startsWith('kyc-')) {
        const doc = name.replace('kyc-', '');
        setFormData(prev => ({
          ...prev,
          kycDocs: checked ? [...prev.kycDocs, doc] : prev.kycDocs.filter(d => d !== doc)
        }));
      } else if (name.startsWith('enquiry-')) {
        const source = name.replace('enquiry-', '');
        setFormData(prev => ({
          ...prev,
          enquirySources: checked ? [...prev.enquirySources, source] : prev.enquirySources.filter(s => s !== source)
        }));
      } else if (name.startsWith('occ1-')) {
        const occ = name.replace('occ1-', '');
        setFormData(prev => ({
          ...prev,
          occupation1: checked ? [...prev.occupation1, occ] : prev.occupation1.filter(o => o !== occ)
        }));
      } else if (name.startsWith('occ2-')) {
        const occ = name.replace('occ2-', '');
        setFormData(prev => ({
          ...prev,
          occupation2: checked ? [...prev.occupation2, occ] : prev.occupation2.filter(o => o !== occ)
        }));
      }
    } else if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      setToast({ message: 'Please accept terms and conditions', type: 'error' });
      return;
    }
    setToast({ message: 'Application submitted successfully!', type: 'success' });
  };

  const addCustomField = (sectionId: number) => {
    const newField: CustomField = {
      id: `custom-${sectionId}-${Date.now()}`,
      label: '',
      value: ''
    };
    setCustomFields(prev => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), newField]
    }));
  };

  const removeCustomField = (sectionId: number, fieldId: string) => {
    setCustomFields(prev => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).filter(f => f.id !== fieldId)
    }));
  };

  const updateCustomField = (sectionId: number, fieldId: string, key: 'label' | 'value', newValue: string) => {
    setCustomFields(prev => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).map(f => 
        f.id === fieldId ? { ...f, [key]: newValue } : f
      )
    }));
  };

  const SectionHeader = ({ title, color = 'blue', sectionId }: { title: string; color?: string; sectionId: number }) => (
    <div className={`${color === 'blue' ? 'bg-slate-700' : 'bg-slate-800'} text-white px-5 py-3 font-bold text-sm uppercase tracking-wide flex items-center justify-between`}>
      <span>{title}</span>
      <button
        type="button"
        onClick={() => addCustomField(sectionId)}
        className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-xs"
        title="Add custom field"
      >
        <Plus size={14} />
        Add Field
      </button>
    </div>
  );

  const InputField = ({ label, name, type = 'text', required = false, placeholder = '', className = '' }: any) => (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name as keyof typeof formData] as string}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-slate-700 uppercase"
      />
    </div>
  );

  const TextAreaField = ({ label, name, rows = 2, required = false }: any) => (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={formData[name as keyof typeof formData] as string}
        onChange={handleChange}
        required={required}
        rows={rows}
        className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-slate-700 uppercase"
      />
    </div>
  );

  const CustomFieldsRenderer = React.memo(({ sectionId }: { sectionId: number }) => (
    <>
      {customFields[sectionId]?.map(field => (
        <div key={field.id} className="flex gap-2 items-end border-t pt-4">
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateCustomField(sectionId, field.id, 'label', e.target.value)}
            placeholder="Field Label"
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-slate-700"
          />
          <input
            type="text"
            value={field.value}
            onChange={(e) => updateCustomField(sectionId, field.id, 'value', e.target.value)}
            placeholder="Field Value"
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-slate-700"
          />
          <button
            type="button"
            onClick={() => removeCustomField(sectionId, field.id)}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Remove field"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </>
  ));

  CustomFieldsRenderer.displayName = 'CustomFieldsRenderer';

  // Memoize sections to prevent re-creation on every render
  const sections = useMemo(() => [
    {
      id: 1,
      title: '1. Application Header',
      color: 'blue',
      content: (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Date" name="applicationDate" type="date" required />
            <InputField label="Application No" name="applicationNo" required />
            <InputField label="Apartment No" name="apartmentNo" required />
            <div className="md:col-span-3 grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="border-2 border-dashed border-gray-300 p-4 text-center">
                  <label className="cursor-pointer block">
                    <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                    <span className="text-xs text-gray-600">Applicant {i} - Affix Photo</span>
                    <input type="file" name={`photo${i}`} onChange={handleChange} accept="image/*" className="hidden" />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <CustomFieldsRenderer sectionId={1} />
        </div>
      )
    },
    {
      id: 2,
      title: '2. Details of the Project',
      color: 'gray',
      content: (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Land Area" name="landArea" placeholder="e.g., 7 acres 09 guntas" />
            <InputField label="Project Phase" name="projectPhase" placeholder="e.g., Single Phase" />
            <InputField label="Sanction of Plan by" name="sanctionBy" placeholder="e.g., BBMP" />
            <div className="md:col-span-2">
              <InputField label="Plan Sanction / LP No." name="planSanctionNo" placeholder="e.g., BBMP/Addl.Dir/JDNORTH/0033/23-24" />
            </div>
            <InputField label="Website (RERA)" name="reraWebsite" placeholder="e.g., WWW.RERA.KARNATAKA.GOV.IN" />
            <InputField label="RERA #" name="reraNumber" placeholder="e.g., PRM/KA/RERA/1251/446/PR/151223/006487" />
          </div>
          <CustomFieldsRenderer sectionId={2} />
        </div>
      )
    },
    {
      id: 3,
      title: '3. Details of the Promoter',
      color: 'gray',
      content: (
        <div className="p-5 space-y-4">
          <InputField label="Name of Promoter (Cum Land Owner)" name="promoterName" placeholder="e.g., GOYAL HARIYANA ASSOCIATES" />
          <TextAreaField label="Address" name="promoterAddress" rows={2} />
          <CustomFieldsRenderer sectionId={3} />
        </div>
      )
    },
    {
      id: 4,
      title: '4. Apartment Details & Pricing',
      color: 'blue',
      content: (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Type of Apartment" name="apartmentType" />
            <InputField label="Building" name="building" />
            <InputField label="Unit No" name="unitNo" />
            <InputField label="Wing" name="wing" />
            <InputField label="Floor No" name="floorNo" />
            <InputField label="Saleable Area (sqft)" name="saleableArea" type="number" />
            <InputField label="Carpet Area sqft" name="carpetAreaSqft" type="number" />
            <InputField label="Carpet Area sqmt" name="carpetAreaSqmt" type="number" />
            <InputField label="Balcony Area sqft" name="balconyAreaSqft" type="number" />
            <InputField label="Balcony Area sqmt" name="balconyAreaSqmt" type="number" />
            <InputField label="No. of Car Parks" name="carParks" type="number" />
          </div>
          <div className="border-t-2 border-gray-200 pt-4">
            <h3 className="font-semibold text-sm mb-3 text-[#1B2A4A]">PRICING</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Basic Sale Value (Rs)" name="basicSaleValue" type="number" />
              <InputField label="GST (Rs)" name="gst" type="number" />
              <InputField label="Gross Apartment Value (Rs)" name="grossApartmentValue" type="number" />
              <TextAreaField label="In Words" name="grossApartmentValueWords" rows={2} />
            </div>
          </div>
          <CustomFieldsRenderer sectionId={4} />
        </div>
      )
    },
    {
      id: 5,
      title: '5. Applicant Details',
      color: 'blue',
      content: (
        <div className="p-5 space-y-4">
          <h3 className="font-semibold text-sm text-[#1B2A4A]">FIRST APPLICANT</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="First Name" name="firstName1" required />
            <InputField label="Surname" name="surname1" required />
            <InputField label="Father/Husband Name" name="fatherHusbandName1" />
            <InputField label="Date of Birth" name="dob1" type="date" />
            <InputField label="PAN No" name="pan1" />
            <InputField label="AADHAR No" name="aadhar1" />
          </div>
          <div className="border-t-2 border-gray-200 pt-4">
            <h3 className="font-semibold text-sm text-[#1B2A4A]">JOINT APPLICANT</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="First Name" name="firstName2" />
              <InputField label="Surname" name="surname2" />
              <InputField label="Father/Husband Name" name="fatherHusbandName2" />
              <InputField label="Date of Birth" name="dob2" type="date" />
              <InputField label="PAN No" name="pan2" />
              <InputField label="AADHAR No" name="aadhar2" />
            </div>
          </div>
          <CustomFieldsRenderer sectionId={5} />
        </div>
      )
    },
    {
      id: 6,
      title: '6. Contact Information',
      color: 'blue',
      content: (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Mobile No (First)" name="mobile1" />
            <InputField label="Email (First)" name="email1" type="email" />
            <InputField label="Mobile No (Joint)" name="mobile2" />
            <InputField label="Email (Joint)" name="email2" type="email" />
            <div className="md:col-span-2">
              <TextAreaField label="Communication Address" name="communicationAddress" rows={3} />
            </div>
          </div>
          <CustomFieldsRenderer sectionId={6} />
        </div>
      )
    },
    {
      id: 7,
      title: '7. Payment Details',
      color: 'blue',
      content: (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Wire Transfer/Cheque No" name="wireTransferNo" />
            <InputField label="UPI Transaction No" name="upiTransactionNo" />
            <InputField label="Dated" name="paymentDated" type="date" />
            <InputField label="Amount (Rs)" name="paymentAmount" type="number" />
            <div className="md:col-span-2">
              <TextAreaField label="Amount in Words" name="paymentAmountWords" rows={2} />
            </div>
          </div>
          <CustomFieldsRenderer sectionId={7} />
        </div>
      )
    },
    {
      id: 8,
      title: '8. KYC Documents',
      color: 'blue',
      content: (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['Business Card', 'Passport Size Photograph', 'Copy of PAN Card', 'Copy of AADHAR Card'].map(doc => (
              <label key={doc} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                <input type="checkbox" name={`kyc-${doc}`} checked={formData.kycDocs.includes(doc)} onChange={handleChange} className="w-5 h-5" />
                <CheckSquare size={18} className={formData.kycDocs.includes(doc) ? 'text-slate-700' : 'text-gray-300'} />
                <span className="text-sm">{doc}</span>
              </label>
            ))}
          </div>
          <CustomFieldsRenderer sectionId={8} />
        </div>
      )
    },
    {
      id: 9,
      title: '9. Terms & Declaration',
      color: 'gray',
      content: (
        <div className="p-5 space-y-4">
          <label className="flex items-start gap-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded">
            <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} required className="w-5 h-5 mt-0.5" />
            <span className="text-sm font-semibold">I/We have read and agree to the Terms & Conditions</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Declaration Date" name="declarationDate" type="date" required />
            <InputField label="Place" name="declarationPlace" required />
          </div>
          <CustomFieldsRenderer sectionId={9} />
        </div>
      )
    }
  ], [customFields, formData]);

  const sectionsPerPage = isMobile ? 1 : 2;
  const totalPages = Math.ceil(sections.length / sectionsPerPage) + 1;
  
  const getCurrentPageSections = () => {
    if (currentStep === totalPages - 1) return [];
    const startIdx = currentStep * sectionsPerPage;
    return sections.slice(startIdx, startIdx + sectionsPerPage);
  };

  const handleNext = () => {
    if (currentStep < totalPages - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const isPreviewPage = currentStep === totalPages - 1;

  return (
    <div className="max-w-7xl mx-auto pb-6">
      <div className="mb-5 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{projectTitle} - Booking Application</h1>
          <p className="text-gray-500 text-sm mt-1">Application for Allotment of Residential Unit</p>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors">
          <Printer size={16} /> Print / Export PDF
        </button>
      </div>

      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {isPreviewPage ? 'Preview & Submit' : `Step ${currentStep + 1} of ${totalPages - 1}`}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / totalPages) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-slate-700 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / totalPages) * 100}%` }}
          />
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 0 && (
          <div className="bg-white border-4 border-slate-700 p-6 text-center space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Project Name (Editable)</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="text-2xl font-bold text-gray-800 text-center w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-slate-700 uppercase"
                placeholder="Enter Project Name"
              />
            </div>
            <h2 className="text-lg font-semibold text-slate-700">APPLICATION FOR ALLOTMENT OF A RESIDENTIAL UNIT</h2>
            <p className="text-xs text-gray-600 italic">The Application form is to be duly filled in CAPITALS and signed by all the applicants</p>
          </div>
        )}

        {!isPreviewPage ? (
          <div className="space-y-6">
            {getCurrentPageSections().map((section) => (
              <div key={section.id} className={`bg-white border-l-4 ${section.color === 'blue' ? 'border-slate-700' : 'border-slate-800'} shadow-sm`}>
                <SectionHeader title={section.title} color={section.color} sectionId={section.id} />
                {section.content}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-slate-700 shadow-lg rounded-lg">
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <Eye size={24} className="text-slate-700" />
              <h2 className="text-xl font-bold text-[#1B2A4A]">Application Preview</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto p-6 space-y-6">
              {/* Project Title */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border-l-4 border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 uppercase">Project Information</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(0)}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Project Name</p>
                    <p className="font-semibold text-gray-900">{projectTitle}</p>
                  </div>
                </div>
              </div>

              {/* All Sections Preview */}
              {sections.map((section, index) => {
                const isEditing = editingSection === section.id;
                const sectionPageIndex = Math.floor(index / sectionsPerPage);
                
                return (
                  <div key={section.id} className={`border-l-4 ${section.color === 'blue' ? 'border-slate-700' : 'border-slate-800'} bg-gray-50 rounded-lg overflow-hidden`}>
                    <div className={`${section.color === 'blue' ? 'bg-slate-700' : 'bg-slate-800'} text-white px-4 py-3 flex items-center justify-between`}>
                      <h3 className="font-bold text-sm uppercase">{section.title}</h3>
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditingSection(null)}
                          className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-xs"
                        >
                          <Check size={14} /> Done
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSection(section.id);
                            setCurrentStep(sectionPageIndex);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-xs"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="bg-white">
                        {section.content}
                      </div>
                    ) : (
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {/* Section 1: Application Header */}
                          {section.id === 1 && (
                            <>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Application Date</p>
                                <p className="font-semibold text-gray-900">{formData.applicationDate || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Application No</p>
                                <p className="font-semibold text-gray-900">{formData.applicationNo || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Apartment No</p>
                                <p className="font-semibold text-gray-900">{formData.apartmentNo || 'Not provided'}</p>
                              </div>
                            </>
                          )}
                          {/* Section 2: Project Details */}
                          {section.id === 2 && (
                            <>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Land Area</p>
                                <p className="font-semibold text-gray-900">{formData.landArea || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Project Phase</p>
                                <p className="font-semibold text-gray-900">{formData.projectPhase || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Sanction By</p>
                                <p className="font-semibold text-gray-900">{formData.sanctionBy || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Plan Sanction No</p>
                                <p className="font-semibold text-gray-900">{formData.planSanctionNo || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">RERA Website</p>
                                <p className="font-semibold text-gray-900">{formData.reraWebsite || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">RERA Number</p>
                                <p className="font-semibold text-gray-900">{formData.reraNumber || 'Not provided'}</p>
                              </div>
                            </>
                          )}
                          {/* Section 3: Promoter Details */}
                          {section.id === 3 && (
                            <>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-600 mb-1">Promoter Name</p>
                                <p className="font-semibold text-gray-900">{formData.promoterName || 'Not provided'}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-600 mb-1">Promoter Address</p>
                                <p className="font-semibold text-gray-900">{formData.promoterAddress || 'Not provided'}</p>
                              </div>
                            </>
                          )}
                          {/* Section 4: Apartment Details */}
                          {section.id === 4 && (
                            <>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Apartment Type</p>
                                <p className="font-semibold text-gray-900">{formData.apartmentType || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Building</p>
                                <p className="font-semibold text-gray-900">{formData.building || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Unit No</p>
                                <p className="font-semibold text-gray-900">{formData.unitNo || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Carpet Area (sqft)</p>
                                <p className="font-semibold text-gray-900">{formData.carpetAreaSqft || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Basic Sale Value</p>
                                <p className="font-semibold text-gray-900">{formData.basicSaleValue ? `₹${formData.basicSaleValue}` : 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Gross Apartment Value</p>
                                <p className="font-semibold text-gray-900">{formData.grossApartmentValue ? `₹${formData.grossApartmentValue}` : 'Not provided'}</p>
                              </div>
                            </>
                          )}
                          {/* Section 5: Applicant Details */}
                          {section.id === 5 && (
                            <>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-600 mb-1 font-semibold">First Applicant</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Name</p>
                                <p className="font-semibold text-gray-900">{formData.firstName1 && formData.surname1 ? `${formData.firstName1} ${formData.surname1}` : 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Date of Birth</p>
                                <p className="font-semibold text-gray-900">{formData.dob1 || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">PAN No</p>
                                <p className="font-semibold text-gray-900">{formData.pan1 || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">AADHAR No</p>
                                <p className="font-semibold text-gray-900">{formData.aadhar1 || 'Not provided'}</p>
                              </div>
                              {(formData.firstName2 || formData.surname2) && (
                                <>
                                  <div className="md:col-span-2 mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-600 mb-1 font-semibold">Joint Applicant</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Name</p>
                                    <p className="font-semibold text-gray-900">{`${formData.firstName2} ${formData.surname2}`}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">PAN No</p>
                                    <p className="font-semibold text-gray-900">{formData.pan2 || 'Not provided'}</p>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          {/* Section 6: Contact Information */}
                          {section.id === 6 && (
                            <>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Mobile No (First)</p>
                                <p className="font-semibold text-gray-900">{formData.mobile1 || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Email (First)</p>
                                <p className="font-semibold text-gray-900">{formData.email1 || 'Not provided'}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-600 mb-1">Communication Address</p>
                                <p className="font-semibold text-gray-900">{formData.communicationAddress || 'Not provided'}</p>
                              </div>
                            </>
                          )}
                          {/* Section 7: Payment Details */}
                          {section.id === 7 && (
                            <>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Wire Transfer/Cheque No</p>
                                <p className="font-semibold text-gray-900">{formData.wireTransferNo || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">UPI Transaction No</p>
                                <p className="font-semibold text-gray-900">{formData.upiTransactionNo || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Payment Date</p>
                                <p className="font-semibold text-gray-900">{formData.paymentDated || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Amount</p>
                                <p className="font-semibold text-gray-900">{formData.paymentAmount ? `₹${formData.paymentAmount}` : 'Not provided'}</p>
                              </div>
                            </>
                          )}
                          {/* Section 8: KYC Documents */}
                          {section.id === 8 && (
                            <>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-600 mb-1">KYC Documents Submitted</p>
                                <p className="font-semibold text-gray-900">{formData.kycDocs.length > 0 ? formData.kycDocs.join(', ') : 'None selected'}</p>
                              </div>
                            </>
                          )}
                          {/* Section 9: Terms & Declaration */}
                          {section.id === 9 && (
                            <>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Terms Accepted</p>
                                <p className="font-semibold text-gray-900">{formData.termsAccepted ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Declaration Date</p>
                                <p className="font-semibold text-gray-900">{formData.declarationDate || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Place</p>
                                <p className="font-semibold text-gray-900">{formData.declarationPlace || 'Not provided'}</p>
                              </div>
                            </>
                          )}
                          {/* Custom Fields */}
                          {customFields[section.id] && customFields[section.id].length > 0 && (
                            <div className="md:col-span-2 mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2 font-semibold">Custom Fields</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {customFields[section.id].map(field => (
                                  <div key={field.id}>
                                    <p className="text-xs text-gray-600 mb-1">{field.label || 'Unlabeled'}</p>
                                    <p className="font-semibold text-gray-900">{field.value || 'Not provided'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">Please review all information carefully before submitting.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 print:hidden pt-4">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => setToast({ message: 'Draft saved!', type: 'success' })} 
              className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"
            >
              <Save size={18} /> Save Draft
            </button>

            {isPreviewPage ? (
              <button 
                type="submit" 
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 font-semibold"
              >
                <FileText size={18} /> Submit Application
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BookingForm;
