import type { Agent, Partner, CustomerContext, SimulationEvent, ExecutedAction } from '../types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-nova',
    name: 'Nova',
    title: 'Customer Experience & Care OS',
    role: 'Support & Satisfaction Lead',
    avatar: '✨',
    tone: 'Empathetic',
    behavior: 'Proactive',
    objective: 'Resolve customer inquiries autonomously, prevent churn, and deliver instant personalized resolutions.',
    capabilities: ['Instant CRM Lookup', 'Appointment Booking', 'Ticket Resolution', 'Refund Authorization', 'VIP Sentiment Monitoring'],
    systemRules: [
      'Always greet customer by name when context is available',
      'Verify SLA requirements before suggesting delivery modifications',
      'Escalate immediately if sentiment falls below 40%',
      'Offer proactive scheduling options'
    ],
    status: 'listening',
    activeTasks: 14,
    performanceScore: 98.4,
    accentColor: 'from-cyan-500 to-blue-600',
    glowColor: '#00f2fe'
  },
  {
    id: 'agent-echo',
    name: 'Echo',
    title: 'Autonomous Sales & Lead Qualifier',
    role: 'Inbound Growth Engine',
    avatar: '⚡',
    tone: 'Professional',
    behavior: 'Sales-oriented',
    objective: 'Qualify inbound prospects in real-time, compute deal sizing, and schedule high-priority executive demos.',
    capabilities: ['BANT Qualification', 'Calendar Auto-Booking', 'Competitive Intelligence', 'Pricing Calculator', 'CRM Lead Enrichment'],
    systemRules: [
      'Identify company headcount and budget within first 2 minutes',
      'Route enterprise prospects (>500 seats) to VP of Sales',
      'Send immediate SMS calendar invite post-booking'
    ],
    status: 'idle',
    activeTasks: 9,
    performanceScore: 96.2,
    accentColor: 'from-purple-500 to-indigo-600',
    glowColor: '#7000ff'
  },
  {
    id: 'agent-atlas',
    name: 'Atlas',
    title: 'Operations & Logistics Dispatcher',
    role: 'Supply Chain Resolution Specialist',
    avatar: '🌐',
    tone: 'Concise',
    behavior: 'Helpful',
    objective: 'Monitor live order fulfillments, re-route delayed shipments, and issue instant carrier notifications.',
    capabilities: ['Carrier API Sync', 'Real-time Tracking', 'Address Modification', 'Driver Dispatch', 'Automated Claims'],
    systemRules: [
      'Prioritize refrigerated medical and VIP freight',
      'Trigger instant re-shipment if delay exceeds 24 hours',
      'Provide concise, precise status timestamps'
    ],
    status: 'idle',
    activeTasks: 22,
    performanceScore: 99.1,
    accentColor: 'from-emerald-500 to-teal-600',
    glowColor: '#10b981'
  },
  {
    id: 'agent-maya',
    name: 'Maya',
    title: 'Healthcare & Patient Navigator',
    role: 'HIPAA-Compliant Care Coordinator',
    avatar: '🩺',
    tone: 'Empathetic',
    behavior: 'Helpful',
    objective: 'Assist patients with clinic appointments, prescription refills, and physician triage routing.',
    capabilities: ['EHR Calendar Sync', 'Insurance Verification', 'Symptom Triage Navigator', 'Rx Refill Request', 'Urgent Escalation'],
    systemRules: [
      'Maintain strict HIPAA privacy compliance',
      'Detect urgent symptoms and route to emergency dispatch',
      'Confirm preferred clinic location'
    ],
    status: 'idle',
    activeTasks: 18,
    performanceScore: 97.9,
    accentColor: 'from-pink-500 to-rose-600',
    glowColor: '#f43f5e'
  },
  {
    id: 'agent-orion',
    name: 'Orion',
    title: 'Financial Services Advisor',
    role: 'Wealth & Banking Concierge',
    avatar: '💎',
    tone: 'Premium',
    behavior: 'Proactive',
    objective: 'Provide premium guidance on account verification, loan inquiries, and high-net-worth portfolio assistance.',
    capabilities: ['2FA Authentication Engine', 'Loan Qualification', 'Portfolio Snapshot', 'Fraud Alert Escalation', 'Wire Transfer Rules'],
    systemRules: [
      'Require step-up verification before exposing account balances',
      'Escalate fraud alerts immediately to Risk Desk',
      'Maintain elevated executive tone'
    ],
    status: 'idle',
    activeTasks: 7,
    performanceScore: 99.5,
    accentColor: 'from-amber-500 to-yellow-600',
    glowColor: '#f59e0b'
  },
  {
    id: 'agent-cipher',
    name: 'Cipher',
    title: 'Security & Escalation Intelligence',
    role: 'Incident Response & Human Handoff',
    avatar: '🛡️',
    tone: 'Professional',
    behavior: 'Proactive',
    objective: 'Monitor all live conversations for security threats, policy violations, or extreme frustration, executing flawless human handoffs.',
    capabilities: ['Sentiment Anomaly Radar', 'Supervisor Dossier Generator', 'Context Transfer Engine', 'Threat Classification', 'Live Telemetry Audit'],
    systemRules: [
      'Generate complete conversation dossier prior to human transfer',
      'Maintain continuous background monitoring during active calls',
      'Lock sensitive user fields upon handoff'
    ],
    status: 'idle',
    activeTasks: 5,
    performanceScore: 100.0,
    accentColor: 'from-red-500 to-orange-600',
    glowColor: '#ef4444'
  }
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'partner-apex',
    name: 'Apex Healthcare System',
    industry: 'Healthcare & Clinical Services',
    tagline: '24/7 Patient Access & Triage Automation',
    logo: '🏥',
    description: 'Leading multi-specialty regional hospital network operating 42 clinics and serving 1.2M patients annually.',
    activeAgentsCount: 8,
    monthlyCalls: '142,500',
    automationRate: '84.2%',
    journeyNodes: [
      {
        id: 'apex-1',
        stage: 'Discovery',
        title: 'Patient Inquiry & Specialty Matching',
        description: 'Patient lands on portal or calls toll-free helpline seeking specialist.',
        aiIntervention: 'AI Navigator matches symptoms to available specialist clinics near ZIP code.',
        status: 'optimized',
        potentialValue: '$420,000/yr saved'
      },
      {
        id: 'apex-2',
        stage: 'Inquiry',
        title: 'Insurance & Eligibility Verification',
        description: 'Patient provides insurance policy numbers for prior authorization.',
        aiIntervention: 'VocalLabs AI queries payer portal in 800ms and confirms copay.',
        status: 'active',
        potentialValue: 'Zero wait time'
      },
      {
        id: 'apex-3',
        stage: 'Conversation',
        title: 'Voice Appointment Booking',
        description: 'Interactive natural voice call to schedule consult.',
        aiIntervention: 'AI Agent checks EHR slot availability and books appointment in real-time.',
        status: 'active',
        potentialValue: '94% completion rate'
      },
      {
        id: 'apex-4',
        stage: 'Purchase',
        title: 'Pre-Visit Preparation & SMS Reminder',
        description: 'Pre-appointment prep instructions and calendar sync.',
        aiIntervention: 'AI sends calendar invite, lab prep instructions, and SMS check-in link.',
        status: 'optimized',
        potentialValue: '-68% no-shows'
      },
      {
        id: 'apex-5',
        stage: 'Support',
        title: 'Post-Consultation & Rx Refill',
        description: 'Patient calls asking for prescription updates or doctor notes.',
        aiIntervention: 'AI verifies patient DOB + PIN and queues refill request directly with pharmacy.',
        status: 'active',
        potentialValue: '< 1 min resolution'
      },
      {
        id: 'apex-6',
        stage: 'Retention',
        title: 'Annual Check-up Recall',
        description: 'Outbound proactive health check reminders.',
        aiIntervention: 'Voice AI places polite outreach calls to schedule preventive screenings.',
        status: 'opportunity',
        potentialValue: '+22% appointment volume'
      }
    ]
  },
  {
    id: 'partner-luxe',
    name: 'Luxe Retail & E-Commerce',
    industry: 'Premium Retail & Fashion',
    tagline: 'VIP Concierge & Direct Commerce',
    logo: '💎',
    description: 'Global luxury lifestyle brand with $450M online revenue and 18 flagship boutiques.',
    activeAgentsCount: 12,
    monthlyCalls: '280,000',
    automationRate: '79.5%',
    journeyNodes: [
      {
        id: 'luxe-1',
        stage: 'Discovery',
        title: 'Bespoke Style Consultation',
        description: 'Shopper inquires about custom tailoring and seasonal lookbooks.',
        aiIntervention: 'AI Stylist provides voice recommendation based on purchase history.',
        status: 'active',
        potentialValue: '+34% Average Order Value'
      },
      {
        id: 'luxe-2',
        stage: 'Inquiry',
        title: 'In-Store Trunk Show RSVP',
        description: 'High-net-worth VIP clients inquiring about private collection events.',
        aiIntervention: 'AI verifies VIP tier and reserves private lounge booking.',
        status: 'optimized',
        potentialValue: '$1.2M attribution'
      },
      {
        id: 'luxe-3',
        stage: 'Conversation',
        title: 'Instant Order Customization & Order Status',
        description: 'Customer checking shipping progress or modifying monogramming.',
        aiIntervention: 'VocalLabs AI modifies order line item before warehouse dispatch.',
        status: 'active',
        potentialValue: 'Real-time order updates'
      },
      {
        id: 'luxe-4',
        stage: 'Purchase',
        title: 'Voice Checkout & Express Payment',
        description: 'Enabling voice-authenticated express purchase for recurring VIP buyers.',
        aiIntervention: 'AI authenticates shopper voiceprint and processes tokenized payment.',
        status: 'active',
        potentialValue: '99% frictionless checkout'
      },
      {
        id: 'luxe-5',
        stage: 'Support',
        title: 'Seamless Return & Exchange Concierge',
        description: 'Shopper requests return shipping label and pickup.',
        aiIntervention: 'AI issues instant QR code return label via SMS and books courier pickup.',
        status: 'optimized',
        potentialValue: '100% automated'
      },
      {
        id: 'luxe-6',
        stage: 'Retention',
        title: 'Exclusive Birthday & Anniversary Gifting',
        description: 'Personalized anniversary gift curation outreach.',
        aiIntervention: 'AI Concierge places outbound personalized voice greeting with curated gift options.',
        status: 'opportunity',
        potentialValue: '+45% repeat retention'
      }
    ]
  },
  {
    id: 'partner-solaris',
    name: 'Solaris Automotive Group',
    industry: 'Automotive Dealership Network',
    tagline: 'Test Drive & Service Scheduling Intelligence',
    logo: '🚗',
    description: 'Premier automotive group operating 18 dealerships representing BMW, Audi, and Porsche.',
    activeAgentsCount: 6,
    monthlyCalls: '95,000',
    automationRate: '88.1%',
    journeyNodes: [
      {
        id: 'solaris-1',
        stage: 'Discovery',
        title: 'New Vehicle Inventory Query',
        description: 'Prospect asking if a specific trim and color is available in inventory.',
        aiIntervention: 'AI inventory engine scans dealer management system (DMS) in real-time.',
        status: 'active',
        potentialValue: 'Instant lead qualification'
      },
      {
        id: 'solaris-2',
        stage: 'Inquiry',
        title: 'VIP Test Drive Booking',
        description: 'Prospective buyer requesting home delivery test drive.',
        aiIntervention: 'VocalLabs AI captures driver license data & schedules concierge delivery.',
        status: 'optimized',
        potentialValue: '+40% test drive conversion'
      },
      {
        id: 'solaris-3',
        stage: 'Conversation',
        title: 'Trade-in Valuation Estimate',
        description: 'Caller requesting instant trade-in appraisal for current vehicle.',
        aiIntervention: 'AI evaluates VIN, mileage, and condition score to provide instant trade estimate.',
        status: 'active',
        potentialValue: '$280K monthly incremental trade-ins'
      },
      {
        id: 'solaris-4',
        stage: 'Purchase',
        title: 'Finance & Lease Pre-Qualification',
        description: 'Inbound financing inquiry.',
        aiIntervention: 'AI gathers credit preference and routes pre-qualified dossier to F&I manager.',
        status: 'active',
        potentialValue: '-15 min dealer wait'
      },
      {
        id: 'solaris-5',
        stage: 'Support',
        title: 'Service Bay Maintenance Scheduling',
        description: 'Existing vehicle owner calling for oil change, brake, or recall service.',
        aiIntervention: 'AI checks service bay technician schedule, assigns loaner vehicle, and confirms appointment.',
        status: 'optimized',
        potentialValue: '95% automated service booking'
      },
      {
        id: 'solaris-6',
        stage: 'Retention',
        title: 'Lease Maturity & Upgrade Concierge',
        description: 'Contacting owners 6 months prior to lease expiration.',
        aiIntervention: 'AI Agent initiates personalized voice call offering early lease return incentive.',
        status: 'opportunity',
        potentialValue: '+31% lease renewals'
      }
    ]
  }
];

export const DEMO_CUSTOMERS: CustomerContext[] = [
  {
    id: 'cust-101',
    name: 'John Doe',
    avatar: '👨‍💼',
    company: 'Nexus Tech Solutions',
    tier: 'Enterprise VIP',
    previousInteractions: 4,
    lastInteraction: '2 days ago',
    knownPreferences: ['Prefers afternoon appointments', 'Prefers email confirmation + SMS alert', 'High-priority SLA'],
    sentimentHistory: ['Positive', 'Positive', 'Neutral', 'Positive'],
    openIssue: null,
    aiRecommendation: 'Customer is 92% likely to accept an afternoon appointment. Offer Thursday 2:30 PM slot.',
    priority: 'Medium'
  },
  {
    id: 'cust-102',
    name: 'Sarah Chen',
    avatar: '👩‍🔬',
    company: 'BioHealth Labs',
    tier: 'Pro',
    previousInteractions: 8,
    lastInteraction: 'Yesterday',
    knownPreferences: ['Requires HIPAA compliance documentation', 'Morning calls preferred (8 AM - 11 AM)'],
    sentimentHistory: ['Frustrated', 'Neutral', 'Positive', 'Positive'],
    openIssue: 'Delayed lab equipment shipment #TRK-8891',
    aiRecommendation: 'Customer is sensitive to shipping delays. Provide instant tracking update and offer expedited replacement.',
    priority: 'High'
  },
  {
    id: 'cust-103',
    name: 'Marcus Vance',
    avatar: '👨‍⚖️',
    company: 'Vance & Associates Legal',
    tier: 'Enterprise VIP',
    previousInteractions: 12,
    lastInteraction: '3 hours ago',
    knownPreferences: ['Executive tone expected', 'Direct handoff to senior account partner if technical'],
    sentimentHistory: ['Positive', 'Positive', 'Positive', 'Delighted'],
    openIssue: null,
    aiRecommendation: 'High-value customer expanding account. Recommend scheduling quarterly executive business review.',
    priority: 'Critical'
  }
];

export const INITIAL_SIMULATION_EVENTS: SimulationEvent[] = [
  {
    id: 'sim-1',
    time: '09:02 AM',
    type: 'call_received',
    title: 'Incoming Customer Voice Call',
    detail: 'John Doe called regarding appointment rescheduling.',
    agentName: 'Nova',
    impact: 'Intent: Reschedule | Confidence: 98%'
  },
  {
    id: 'sim-2',
    time: '09:03 AM',
    type: 'inquiry_resolved',
    title: 'Automated Calendar Update',
    detail: 'Rescheduled consult to Thursday 2:30 PM. Calendar sync sent.',
    agentName: 'Nova',
    impact: 'Resolved in 42s | Zero Human Touch'
  },
  {
    id: 'sim-3',
    time: '09:17 AM',
    type: 'lead_qualified',
    title: 'Inbound Enterprise Lead Qualified',
    detail: 'Qualified $120k ARR prospect from BioHealth Labs.',
    agentName: 'Echo',
    impact: 'Budget: $150k | Timeline: Immediate'
  },
  {
    id: 'sim-4',
    time: '09:43 AM',
    type: 'appointment_booked',
    title: 'Executive Demo Booked',
    detail: 'Demo scheduled with VP of Sales for Friday 10:00 AM.',
    agentName: 'Echo',
    impact: 'Calendar invite & SMS confirmation dispatched'
  },
  {
    id: 'sim-5',
    time: '10:21 AM',
    type: 'escalation_detected',
    title: 'Customer Sentiment Warning',
    detail: 'Sarah Chen voiced frustration over delayed shipment #TRK-8891.',
    agentName: 'Cipher',
    impact: 'Sentiment score dropped to 32% (Frustrated)'
  },
  {
    id: 'sim-6',
    time: '10:22 AM',
    type: 'handoff_prepared',
    title: 'Human Handoff Dossier Generated',
    detail: 'Dossier with complete transcript & tracking logs pushed to Tier 2 Supervisor.',
    agentName: 'Cipher',
    impact: 'Handoff completed in 1.4s with 100% context'
  },
  {
    id: 'sim-7',
    time: '11:04 AM',
    type: 'followup_sent',
    title: 'Autonomous Proactive SMS Follow-up',
    detail: 'Dispatched delivery tracking confirmation link via SMS.',
    agentName: 'Atlas',
    impact: 'Customer satisfaction restored to 94%'
  }
];

export const INITIAL_ACTIONS: ExecutedAction[] = [
  {
    id: 'act-101',
    actionType: 'schedule_appointment',
    title: 'Schedule Appointment',
    description: 'Booked consultation for Thursday at 2:30 PM with Dr. Aris Thorne.',
    timestamp: 'Just now',
    status: 'success',
    reasoningFactors: [
      'Customer requested afternoon slot',
      'Physician EHR calendar confirmed open slot at 2:30 PM',
      'Insurance authorization active'
    ],
    payload: { date: '2026-08-27', time: '14:30', specialist: 'Dr. Aris Thorne' }
  },
  {
    id: 'act-102',
    actionType: 'update_crm',
    title: 'Update CRM Context Record',
    description: 'Appended preferred contact channel: SMS + Afternoon slot priority.',
    timestamp: '2 mins ago',
    status: 'success',
    reasoningFactors: [
      'Extracted preference from customer voice transcript',
      'High confidence (96%) in intent extraction'
    ]
  },
  {
    id: 'act-103',
    actionType: 'create_ticket',
    title: 'Create Priority Support Ticket',
    description: 'Generated Ticket #TK-9921 for delayed shipment tracking.',
    timestamp: '5 mins ago',
    status: 'success',
    reasoningFactors: [
      'Order status query indicated delay > 24 hours',
      'VIP Tier SLA enforced automatic ticket generation'
    ]
  }
];
