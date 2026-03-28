export const bookings = [
  {
    id: 'BK001',
    customerName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    project: 'Skyline Residency',
    unitType: '2 BHK',
    sqft: 1200,
    tower: 'Tower A',
    bookingDate: '2026-03-15',
    status: 'New',
  },
  {
    id: 'BK002',
    customerName: 'Priya Sharma',
    phone: '+91 98234 56789',
    project: 'Green Valley',
    unitType: '3 BHK',
    sqft: 1800,
    tower: 'Tower B',
    bookingDate: '2026-03-20',
    status: 'In Process',
  },
  {
    id: 'BK003',
    customerName: 'Amit Patel',
    phone: '+91 99887 76543',
    project: 'Ocean View',
    unitType: '2 BHK',
    sqft: 1150,
    tower: 'Tower C',
    bookingDate: '2026-03-18',
    status: 'New',
  },
  {
    id: 'BK004',
    customerName: 'Sneha Reddy',
    phone: '+91 97654 32109',
    project: 'Skyline Residency',
    unitType: '3 BHK',
    sqft: 1650,
    tower: 'Tower A',
    bookingDate: '2026-03-22',
    status: 'Done',
  },
  {
    id: 'BK005',
    customerName: 'Vikram Singh',
    phone: '+91 98123 45678',
    project: 'Green Valley',
    unitType: '4 BHK',
    sqft: 2200,
    tower: 'Tower B',
    bookingDate: '2026-03-10',
    status: 'In Process',
  },
];

export const agreements = [
  {
    id: 'AGR001',
    customerName: 'Priya Sharma',
    project: 'Green Valley',
    unit: '3 BHK, 1800 sqft',
    status: 'Under Review',
    createdBy: 'Admin User',
    createdDate: '2026-03-25',
  },
  {
    id: 'AGR002',
    customerName: 'Sneha Reddy',
    project: 'Skyline Residency',
    unit: '3 BHK, 1650 sqft',
    status: 'Approved',
    createdBy: 'Admin User',
    createdDate: '2026-03-24',
  },
  {
    id: 'AGR003',
    customerName: 'Vikram Singh',
    project: 'Green Valley',
    unit: '4 BHK, 2200 sqft',
    status: 'Rework',
    createdBy: 'Admin User',
    createdDate: '2026-03-23',
  },
];

export const customers = [
  {
    id: 'BK001',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    project: 'Skyline Residency',
    tower: 'Tower A',
    unit: '2 BHK • 1200 sqft',
    bookingStatus: 'New',
  },
  {
    id: 'BK002',
    name: 'Priya Sharma',
    phone: '+91 98234 56789',
    email: 'priya.sharma@email.com',
    project: 'Green Valley',
    tower: 'Tower B',
    unit: '3 BHK • 1800 sqft',
    bookingStatus: 'In Process',
  },
  {
    id: 'BK003',
    name: 'Amit Patel',
    phone: '+91 99887 76543',
    email: 'amit.patel@email.com',
    project: 'Ocean View',
    tower: 'Tower C',
    unit: '2 BHK • 1150 sqft',
    bookingStatus: 'New',
  },
  {
    id: 'BK004',
    name: 'Sneha Reddy',
    phone: '+91 97654 32109',
    email: 'sneha.reddy@email.com',
    project: 'Skyline Residency',
    tower: 'Tower A',
    unit: '3 BHK • 1650 sqft',
    bookingStatus: 'Done',
  },
  {
    id: 'BK005',
    name: 'Vikram Singh',
    phone: '+91 98123 45678',
    email: 'vikram.singh@email.com',
    project: 'Green Valley',
    tower: 'Tower B',
    unit: '4 BHK • 2200 sqft',
    bookingStatus: 'In Process',
  },
];

export const constructionUpdates = [
  {
    id: 'CU001',
    project: 'Skyline Residency',
    tower: 'Tower A',
    stage: 'Floor 5 Completed',
    uploadDate: '2026-03-20',
  },
  {
    id: 'CU002',
    project: 'Green Valley',
    tower: 'Tower B',
    stage: 'Foundation Work Complete',
    uploadDate: '2026-03-18',
  },
  {
    id: 'CU003',
    project: 'Ocean View',
    tower: 'Tower C',
    stage: 'Floor 3 in Progress',
    uploadDate: '2026-03-22',
  },
];

export const payments = [
  {
    id: 'PAY001',
    customerName: 'Priya Sharma',
    project: 'Green Valley',
    tower: 'Tower B',
    amount: '₹25.00L',
    amountValue: 2500000,
    status: 'Pending',
    requestDate: '2026-03-24',
    paymentDate: '-',
  },
  {
    id: 'PAY002',
    customerName: 'Sneha Reddy',
    project: 'Skyline Residency',
    tower: 'Tower A',
    amount: '₹22.00L',
    amountValue: 2200000,
    status: 'Paid',
    requestDate: '2026-03-20',
    paymentDate: '2026-03-23',
  },
  {
    id: 'PAY003',
    customerName: 'Vikram Singh',
    project: 'Green Valley',
    tower: 'Tower B',
    amount: '₹33.00L',
    amountValue: 3300000,
    status: 'Payment Requested',
    requestDate: '2026-03-25',
    paymentDate: '-',
  },
];

export const agreementTemplates = [
  { id: 1, name: 'Standard Sale Agreement', type: 'PDF', uploadDate: '2026-01-15' },
  { id: 2, name: 'Premium Unit Agreement', type: 'PDF', uploadDate: '2026-02-10' },
];

export const emailTemplates = [
  { id: 1, name: 'Payment Request - Stage 1', variables: ['{{name}}', '{{tower}}', '{{amount}}', '{{project}}'] },
  { id: 2, name: 'Payment Request - Stage 2', variables: ['{{name}}', '{{tower}}', '{{amount}}', '{{project}}'] },
  { id: 3, name: 'Payment Reminder', variables: ['{{name}}', '{{amount}}', '{{dueDate}}'] },
];

export const projects = ['Skyline Residency', 'Green Valley', 'Ocean View'];
export const towers = ['Tower A', 'Tower B', 'Tower C'];
