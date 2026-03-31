import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Save, Printer, Upload, CheckSquare, ChevronLeft, ChevronRight, Eye, Plus, X, Edit2, Check } from 'lucide-react';
import Toast from '../components/ui/Toast';
import { bookingService } from '../services/bookingService';
import { projectService, type Project } from '../services/projectService';
import { unitService, type Unit } from '../services/unitService';
import { formTemplateService, type FormTemplate } from '../services/formTemplateService';
import { agreementTemplateService, type AgreementTemplate } from '../services/agreementTemplateService';
import { fieldValueService, type BulkFieldValueItem } from '../services/fieldValueService';
import { documentService } from '../services/documentService';
import { useNavigate } from 'react-router-dom';

interface CustomField {
  id: string;
  label: string;
  value: string;
}

// Move components outside to prevent re-creation on every render
const SectionHeader = ({ title, color = 'blue', sectionId, onAddField }: { 
  title: string; 
  color?: string; 
  sectionId: number;
  onAddField: (sectionId: number) => void;
}) => (
  <div className={`${color === 'blue' ? 'bg-slate-700' : 'bg-slate-800'} text-white px-5 py-3 font-bold text-sm uppercase tracking-wide flex items-center justify-between`}>
    <span>{title}</span>
    <button
      type="button"
      onClick={() => onAddField(sectionId)}
      className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-xs"
      title="Add custom field"
    >
      <Plus size={14} />
      Add Field
    </button>
  </div>
);

const InputField = ({ 
  label, 
  name, 
  type = 'text', 
  required = false, 
  placeholder = '', 
  className = '',
  value,
  onChange
}: any) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-slate-700 uppercase"
    />
  </div>
);

const TextAreaField = ({ 
  label, 
  name, 
  rows = 2, 
  required = false,
  value,
  onChange
}: any) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-slate-700 uppercase"
    />
  </div>
);

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [projectTitle, setProjectTitle] = useState('ORCHID LIFE');
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [customFields, setCustomFields] = useState<Record<number, CustomField[]>>({});
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [agreementTemplates, setAgreementTemplates] = useState<AgreementTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    projectId: '', unitId: '', formTemplateId: '', agreementTemplateId: '',
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const myProjects = await projectService.getMyProjects();
        console.log('My Projects from /projects/my:', myProjects);
        setProjects(myProjects);
        if (!myProjects || myProjects.length === 0) {
          setToast({ message: 'No projects assigned to you. Please contact admin.', type: 'error' });
        }
      } catch (error: any) {
        console.error('Failed to fetch projects:', error);
        setToast({ message: error?.message || 'Failed to load projects', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!formData.projectId) {
        setUnits([]);
        setFormTemplates([]);
        setAgreementTemplates([]);
        return;
      }
      try {
        const [projectUnits, projectFormTemplates, projectAgreementTemplates] = await Promise.all([
          unitService.getAll({ project_id: formData.projectId }),
          formTemplateService.getAll({ project_id: formData.projectId, is_active: true }),
          agreementTemplateService.getAll({ project_id: formData.projectId })
        ]);
        setUnits(projectUnits);
        setFormTemplates(projectFormTemplates);
        setAgreementTemplates(projectAgreementTemplates);
        const selectedProject = projects.find(p => p.id === formData.projectId);
        if (selectedProject) {
          setFormData(prev => ({
            ...prev,
            reraNumber: selectedProject.rera_number || '',
            reraWebsite: selectedProject.rera_website || '',
            planSanctionNo: selectedProject.plan_sanction_no || '',
            landArea: selectedProject.land_area_guntas?.toString() || '',
            promoterAddress: selectedProject.address || '',
          }));
          setProjectTitle(selectedProject.name || 'ORCHID LIFE');
        }
      } catch (error: any) {
        console.error('Failed to fetch project data:', error);
      }
    };
    fetchProjectData();
  }, [formData.projectId, projects]);

  // Auto-fill form fields when unit is selected
  useEffect(() => {
    if (!formData.unitId || units.length === 0) return;

    const selectedUnit = units.find(u => u.id === formData.unitId);
    if (!selectedUnit) return;

    console.log('Auto-filling unit details:', selectedUnit);

    setFormData(prev => ({
      ...prev,
      unitNo: selectedUnit.unit_no || '',
      building: selectedUnit.tower || '',
      floorNo: selectedUnit.floor_no?.toString() || '',
      apartmentType: selectedUnit.unit_type || '',
      carpetAreaSqft: selectedUnit.carpet_area_sqft?.toString() || '',
      carpetAreaSqmt: selectedUnit.carpet_area_sqft ? (selectedUnit.carpet_area_sqft * 0.092903).toFixed(2) : '',
      balconyAreaSqft: selectedUnit.balcony_area_sqft?.toString() || '',
      balconyAreaSqmt: selectedUnit.balcony_area_sqft ? (selectedUnit.balcony_area_sqft * 0.092903).toFixed(2) : '',
      saleableArea: selectedUnit.super_built_up_sqft?.toString() || '',
      carParks: selectedUnit.no_of_parking?.toString() || '',
      basicSaleValue: selectedUnit.basic_sale_value?.toString() || '',
      gst: selectedUnit.gst_amount?.toString() || '',
      basicSaleValueWithGst: ((selectedUnit.basic_sale_value || 0) + (selectedUnit.gst_amount || 0)).toString(),
      grossApartmentValue: selectedUnit.gross_apartment_value?.toString() || '',
      otherCostCharges: ((selectedUnit.maintenance_24mo || 0) + (selectedUnit.corpus_fund || 0) + (selectedUnit.other_charges || 0)).toString(),
    }));
  }, [formData.unitId, units]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
  }, []);

  const handlePrint = async () => {
    // Check if we have a booking ID (only available after submission)
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    
    if (!bookingId) {
      // If no booking ID, just print the current form
      window.print();
      return;
    }
    
    try {
      setToast({ message: 'Generating agreement for print...', type: 'success' });
      
      // Fetch merged agreement HTML
      const agreementData = await bookingService.getMergedAgreement(bookingId);
      
      // Open new window with the merged agreement
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Write the complete HTML document
        printWindow.document.open();
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Booking Agreement - Print</title>
              <meta charset="UTF-8">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px;
                  line-height: 1.6;
                }
                @media print { 
                  body { margin: 0; }
                  @page { margin: 1cm; }
                }
              </style>
            </head>
            <body>
              ${agreementData.header_html || ''}
              ${agreementData.merged_html}
              ${agreementData.footer_html || ''}
            </body>
          </html>
        `);
        printWindow.document.close();
        
        // Wait for content to render before printing
        printWindow.onload = () => {
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
        
        // Fallback if onload doesn't fire
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.focus();
            printWindow.print();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to fetch merged agreement:', error);
      setToast({ message: 'Failed to generate agreement. Printing current form instead.', type: 'error' });
      window.print();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      setToast({ message: 'Please accept terms and conditions', type: 'error' });
      return;
    }
    
    // Validate all required backend fields
    if (!formData.projectId || !formData.unitId || !formData.formTemplateId || !formData.agreementTemplateId) {
      setToast({ 
        message: 'Please enter all required IDs (Project, Unit, Form Template, Agreement Template).', 
        type: 'error' 
      });
      return;
    }
    
    try {
      console.log('Submitting booking to backend...');
      
      // Create booking with backend API - all fields match backend requirements
      const bookingData: any = {
        project_id: formData.projectId,
        unit_id: formData.unitId,
        form_template_id: formData.formTemplateId,
        agreement_template_id: formData.agreementTemplateId,
        allottee_address: formData.communicationAddress || undefined,
        allottee_phone: formData.mobile1 || undefined,
        allottee_email: formData.email1 || undefined,
        agent_name: formData.agentName || undefined,
        agent_rera_no: formData.agentReraNo || undefined,
        agent_represented_by: formData.representedBy || undefined,
        agent_contact_no: formData.agentContact || undefined,
        agent_email: formData.agentEmail || undefined,
        fund_source: formData.fundingSource || undefined,
        home_loan_pct: formData.homeLoanPercent ? parseFloat(formData.homeLoanPercent) : undefined,
        notes: formData.enquiryDetails || undefined,
      };

      // Add joint allottees if second applicant data exists
      const jointAllottees = [];
      if (formData.firstName2 && formData.surname2) {
        jointAllottees.push({
          first_name: formData.firstName2,
          last_name: formData.surname2,
          phone: formData.mobile2 || undefined,
          email: formData.email2 || undefined,
        });
      }
      if (jointAllottees.length > 0) {
        bookingData.joint_allottees = jointAllottees;
      }
      
      console.log('Booking data:', bookingData);
      
      // Create draft booking (does not block unit yet)
      const booking = await bookingService.create(bookingData);
      console.log('Booking created (draft):', booking);
      
      // Populate field values (required for field_snapshot)
      console.log('Fetching form template fields...');
      const fields = await formTemplateService.getFields(formData.formTemplateId);
      console.log('Form fields:', fields);
      
      // Map formData to field values
      const fieldValues: BulkFieldValueItem[] = [];
      
      // Create a mapping of field keys to form data values
      const formDataMap: Record<string, any> = {
        'application_date': formData.applicationDate,
        'application_no': formData.applicationNo,
        'apartment_no': formData.apartmentNo,
        'land_area': formData.landArea,
        'project_phase': formData.projectPhase,
        'sanction_by': formData.sanctionBy,
        'plan_sanction_no': formData.planSanctionNo,
        'rera_website': formData.reraWebsite,
        'rera_number': formData.reraNumber,
        'promoter_name': formData.promoterName,
        'promoter_address': formData.promoterAddress,
        'apartment_type': formData.apartmentType,
        'building': formData.building,
        'unit_no': formData.unitNo,
        'wing': formData.wing,
        'floor_no': formData.floorNo,
        'saleable_area': formData.saleableArea,
        'carpet_area_sqft': formData.carpetAreaSqft,
        'carpet_area_sqmt': formData.carpetAreaSqmt,
        'balcony_area_sqft': formData.balconyAreaSqft,
        'balcony_area_sqmt': formData.balconyAreaSqmt,
        'car_parks': formData.carParks,
        'basic_sale_value': formData.basicSaleValue,
        'gst': formData.gst,
        'gross_apartment_value': formData.grossApartmentValue,
        'gross_apartment_value_words': formData.grossApartmentValueWords,
        'first_name_1': formData.firstName1,
        'surname_1': formData.surname1,
        'father_husband_name_1': formData.fatherHusbandName1,
        'dob_1': formData.dob1,
        'pan_1': formData.pan1,
        'aadhar_1': formData.aadhar1,
        'first_name_2': formData.firstName2,
        'surname_2': formData.surname2,
        'father_husband_name_2': formData.fatherHusbandName2,
        'dob_2': formData.dob2,
        'pan_2': formData.pan2,
        'aadhar_2': formData.aadhar2,
        'mobile_1': formData.mobile1,
        'email_1': formData.email1,
        'mobile_2': formData.mobile2,
        'email_2': formData.email2,
        'communication_address': formData.communicationAddress,
        'wire_transfer_no': formData.wireTransferNo,
        'upi_transaction_no': formData.upiTransactionNo,
        'payment_dated': formData.paymentDated,
        'payment_amount': formData.paymentAmount,
        'payment_amount_words': formData.paymentAmountWords,
        'declaration_date': formData.declarationDate,
        'declaration_place': formData.declarationPlace,
      };
      
      // Map fields to values
      for (const field of fields) {
        const value = formDataMap[field.field_key];
        if (value !== undefined && value !== null && value !== '') {
          const fieldValue: BulkFieldValueItem = {
            field_id: field.id,
          };
          
          // Set appropriate value type based on field data type
          switch (field.data_type) {
            case 'number':
              fieldValue.value_number = parseFloat(value);
              break;
            case 'date':
              fieldValue.value_date = value;
              break;
            case 'boolean':
              fieldValue.value_boolean = Boolean(value);
              break;
            default:
              fieldValue.value_text = String(value);
          }
          
          fieldValues.push(fieldValue);
        }
      }
      
      console.log('Upserting field values:', fieldValues);
      console.log('Field values count:', fieldValues.length);
      
      // Only upsert if we have field values
      if (fieldValues.length > 0) {
        await fieldValueService.bulkUpsert(booking.id, fieldValues);
        console.log('Field values populated successfully');
      } else {
        console.warn('No form template fields configured. Skipping field value population.');
      }
      
      // Upload PDF document if provided
      if (uploadedPdf) {
        try {
          console.log('Uploading PDF document...');
          await documentService.upload({
            booking_id: booking.id,
            type: 'other',
            file: uploadedPdf,
            allottee_index: 0,
            notes: 'Booking form PDF uploaded by user',
          });
          console.log('PDF uploaded successfully');
        } catch (uploadError: any) {
          console.error('Failed to upload PDF:', uploadError);
          setToast({ message: 'Failed to upload PDF document. Please try again.', type: 'error' });
          return;
        }
      }
      
      // Submit for review (this will block the unit and create field_snapshot)
      // Only submit if booking is in draft or needs_revision status
      console.log('Booking status:', booking.status);
      
      if (booking.status === 'draft' || booking.status === 'needs_revision') {
        try {
          await bookingService.submit(booking.id);
          console.log('Booking submitted for review - unit blocked');
          
          setToast({ message: 'Booking submitted successfully!', type: 'success' });
          
          // Redirect to My Bookings after 2 seconds
          setTimeout(() => {
            navigate('/my-bookings');
          }, 2000);
        } catch (submitError: any) {
          console.error('Failed to submit booking for review:', submitError);
          
          // If unit is already blocked, inform user but don't treat as complete failure
          if (submitError?.message?.includes('blocked') || submitError?.message?.includes('conflict')) {
            setToast({ 
              message: 'Booking created but unit may already be blocked. Please check My Bookings.', 
              type: 'error' 
            });
            setTimeout(() => {
              navigate('/my-bookings');
            }, 3000);
          } else {
            throw submitError; // Re-throw other errors
          }
        }
      } else {
        // Booking already submitted or in another status
        console.log('Booking already submitted with status:', booking.status);
        setToast({ 
          message: `Booking already exists with status: ${booking.status}. Redirecting to My Bookings.`, 
          type: 'success' 
        });
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create booking';
      setToast({ message: errorMessage, type: 'error' });
    }
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

  const updateCustomField = useCallback((sectionId: number, fieldId: string, key: 'label' | 'value', newValue: string) => {
    setCustomFields(prev => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).map(f => 
        f.id === fieldId ? { ...f, [key]: newValue } : f
      )
    }));
  }, []);

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
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">📋 Booking Information</p>
                <p className="text-xs text-blue-700 mb-2">Select from your assigned projects and templates.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                  disabled={loading || projects.length === 0}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{loading ? 'Loading projects...' : projects.length === 0 ? 'No projects available' : 'Select Project'}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleChange}
                  required
                  disabled={!formData.projectId || units.length === 0}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{!formData.projectId ? 'Select Project First' : units.length === 0 ? 'No units available' : 'Select Unit'}</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unit_no} - {unit.tower} - Floor {unit.floor_no} - {unit.unit_type.toUpperCase()} ({unit.carpet_area_sqft} sqft)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                  Form Template <span className="text-red-500">*</span>
                </label>
                <select
                  name="formTemplateId"
                  value={formData.formTemplateId}
                  onChange={handleChange}
                  required
                  disabled={!formData.projectId || formTemplates.length === 0}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{!formData.projectId ? 'Select Project First' : formTemplates.length === 0 ? 'No templates available' : 'Select Form Template'}</option>
                  {formTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                  Agreement Template <span className="text-red-500">*</span>
                </label>
                <select
                  name="agreementTemplateId"
                  value={formData.agreementTemplateId}
                  onChange={handleChange}
                  required
                  disabled={!formData.projectId || agreementTemplates.length === 0}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{!formData.projectId ? 'Select Project First' : agreementTemplates.length === 0 ? 'No templates available' : 'Select Agreement Template'}</option>
                  {agreementTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Date" name="applicationDate" type="date" required value={formData.applicationDate} onChange={handleChange} />
            <InputField label="Application No" name="applicationNo" required value={formData.applicationNo} onChange={handleChange} />
            <InputField label="Apartment No" name="apartmentNo" required value={formData.apartmentNo} onChange={handleChange} />
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
            <InputField label="Land Area" name="landArea" value={formData.landArea} onChange={handleChange} placeholder="e.g., 7 acres 09 guntas" />
            <InputField label="Project Phase" name="projectPhase" value={formData.projectPhase} onChange={handleChange} placeholder="e.g., Single Phase" />
            <InputField label="Sanction of Plan by" name="sanctionBy" value={formData.sanctionBy} onChange={handleChange} placeholder="e.g., BBMP" />
            <div className="md:col-span-2">
              <InputField label="Plan Sanction / LP No." name="planSanctionNo" value={formData.planSanctionNo} onChange={handleChange} placeholder="e.g., BBMP/Addl.Dir/JDNORTH/0033/23-24" />
            </div>
            <InputField label="Website (RERA)" name="reraWebsite" value={formData.reraWebsite} onChange={handleChange} placeholder="e.g., WWW.RERA.KARNATAKA.GOV.IN" />
            <InputField label="RERA #" name="reraNumber" value={formData.reraNumber} onChange={handleChange} placeholder="e.g., PRM/KA/RERA/1251/446/PR/151223/006487" />
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
          <InputField label="Name of Promoter (Cum Land Owner)" name="promoterName" value={formData.promoterName} onChange={handleChange} placeholder="e.g., GOYAL HARIYANA ASSOCIATES" />
          <TextAreaField label="Address" name="promoterAddress" value={formData.promoterAddress} onChange={handleChange} rows={2} />
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
            <InputField label="Type of Apartment" name="apartmentType" value={formData.apartmentType} onChange={handleChange} />
            <InputField label="Building" name="building" value={formData.building} onChange={handleChange} />
            <InputField label="Unit No" name="unitNo" value={formData.unitNo} onChange={handleChange} />
            <InputField label="Wing" name="wing" value={formData.wing} onChange={handleChange} />
            <InputField label="Floor No" name="floorNo" value={formData.floorNo} onChange={handleChange} />
            <InputField label="Saleable Area (sqft)" name="saleableArea" value={formData.saleableArea} onChange={handleChange} type="number" />
            <InputField label="Carpet Area sqft" name="carpetAreaSqft" value={formData.carpetAreaSqft} onChange={handleChange} type="number" />
            <InputField label="Carpet Area sqmt" name="carpetAreaSqmt" value={formData.carpetAreaSqmt} onChange={handleChange} type="number" />
            <InputField label="Balcony Area sqft" name="balconyAreaSqft" value={formData.balconyAreaSqft} onChange={handleChange} type="number" />
            <InputField label="Balcony Area sqmt" name="balconyAreaSqmt" value={formData.balconyAreaSqmt} onChange={handleChange} type="number" />
            <InputField label="No. of Car Parks" name="carParks" value={formData.carParks} onChange={handleChange} type="number" />
          </div>
          <div className="border-t-2 border-gray-200 pt-4">
            <h3 className="font-semibold text-sm mb-3 text-[#1B2A4A]">PRICING</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Basic Sale Value (Rs)" name="basicSaleValue" value={formData.basicSaleValue} onChange={handleChange} type="number" />
              <InputField label="GST (Rs)" name="gst" value={formData.gst} onChange={handleChange} type="number" />
              <InputField label="Gross Apartment Value (Rs)" name="grossApartmentValue" value={formData.grossApartmentValue} onChange={handleChange} type="number" />
              <TextAreaField label="In Words" name="grossApartmentValueWords" value={formData.grossApartmentValueWords} onChange={handleChange} rows={2} />
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
            <InputField label="First Name" name="firstName1" value={formData.firstName1} onChange={handleChange} required />
            <InputField label="Surname" name="surname1" value={formData.surname1} onChange={handleChange} required />
            <InputField label="Father/Husband Name" name="fatherHusbandName1" value={formData.fatherHusbandName1} onChange={handleChange} />
            <InputField label="Date of Birth" name="dob1" value={formData.dob1} onChange={handleChange} type="date" />
            <InputField label="PAN No" name="pan1" value={formData.pan1} onChange={handleChange} />
            <InputField label="AADHAR No" name="aadhar1" value={formData.aadhar1} onChange={handleChange} />
          </div>
          <div className="border-t-2 border-gray-200 pt-4">
            <h3 className="font-semibold text-sm text-[#1B2A4A]">JOINT APPLICANT</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="First Name" name="firstName2" value={formData.firstName2} onChange={handleChange} />
              <InputField label="Surname" name="surname2" value={formData.surname2} onChange={handleChange} />
              <InputField label="Father/Husband Name" name="fatherHusbandName2" value={formData.fatherHusbandName2} onChange={handleChange} />
              <InputField label="Date of Birth" name="dob2" value={formData.dob2} onChange={handleChange} type="date" />
              <InputField label="PAN No" name="pan2" value={formData.pan2} onChange={handleChange} />
              <InputField label="AADHAR No" name="aadhar2" value={formData.aadhar2} onChange={handleChange} />
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
            <InputField label="Mobile No (First)" name="mobile1" value={formData.mobile1} onChange={handleChange} />
            <InputField label="Email (First)" name="email1" value={formData.email1} onChange={handleChange} type="email" />
            <InputField label="Mobile No (Joint)" name="mobile2" value={formData.mobile2} onChange={handleChange} />
            <InputField label="Email (Joint)" name="email2" value={formData.email2} onChange={handleChange} type="email" />
            <div className="md:col-span-2">
              <TextAreaField label="Communication Address" name="communicationAddress" value={formData.communicationAddress} onChange={handleChange} rows={3} />
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
            <InputField label="Wire Transfer/Cheque No" name="wireTransferNo" value={formData.wireTransferNo} onChange={handleChange} />
            <InputField label="UPI Transaction No" name="upiTransactionNo" value={formData.upiTransactionNo} onChange={handleChange} />
            <InputField label="Dated" name="paymentDated" value={formData.paymentDated} onChange={handleChange} type="date" />
            <InputField label="Amount (Rs)" name="paymentAmount" value={formData.paymentAmount} onChange={handleChange} type="number" />
            <div className="md:col-span-2">
              <TextAreaField label="Amount in Words" name="paymentAmountWords" value={formData.paymentAmountWords} onChange={handleChange} rows={2} />
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
            <InputField label="Declaration Date" name="declarationDate" value={formData.declarationDate} onChange={handleChange} type="date" required />
            <InputField label="Place" name="declarationPlace" value={formData.declarationPlace} onChange={handleChange} required />
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
              Upload Booking Form PDF <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      setToast({ message: 'Please upload a PDF file only', type: 'error' });
                      e.target.value = '';
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      setToast({ message: 'File size must be less than 10MB', type: 'error' });
                      e.target.value = '';
                      return;
                    }
                    setUploadedPdf(file);
                  }
                }}
                required
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                {uploadedPdf ? (
                  <div className="text-sm">
                    <p className="font-semibold text-green-600">✓ {uploadedPdf.name}</p>
                    <p className="text-gray-500 text-xs mt-1">{(uploadedPdf.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold">Click to upload PDF</p>
                    <p className="text-xs mt-1">Maximum file size: 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          <CustomFieldsRenderer sectionId={9} />
        </div>
      )
    }
  ], [customFields, formData, projects, loading, units, formTemplates, agreementTemplates]);

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
                <SectionHeader title={section.title} color={section.color} sectionId={section.id} onAddField={addCustomField} />
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
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <Save size={18} /> Save Draft
            </button>
            
            {isPreviewPage ? (
              <button 
                type="submit" 
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 font-semibold"
              >
                <Save size={18} />
                Submit Booking
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
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
