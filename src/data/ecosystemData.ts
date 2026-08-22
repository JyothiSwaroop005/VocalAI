import type { IntegrationPlatform } from '../types';

export const INTEGRATIONS_REGISTRY: IntegrationPlatform[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    agentName: 'AI Content Agent',
    agentRole: 'Video & Streaming Navigation Engine',
    category: 'Entertainment',
    status: 'CONNECTED',
    logo: '📺',
    description: 'Direct browser navigation and media playback engine for video streaming and research playlists.',
    capabilities: ['Direct Video Launch', 'Playlist Curation', 'Search Extraction', 'Channel Telemetry'],
    accentColor: 'from-red-500 to-rose-600',
    sampleQuery: 'Can you open YouTube for me?',
    simulatedWorkflowSteps: ['Ingesting media query', 'Parsing channel & topic', 'Dispatching browser navigation', 'Playback initialized'],
    sampleResult: {
      title: 'YouTube Navigation Active',
      summary: 'Browser tab navigated to https://www.youtube.com.',
      metrics: { Status: 'Connected', Mode: 'Direct Web Launch' }
    }
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Web',
    agentName: 'AI Conversation Agent',
    agentRole: 'Messaging & Broadcast Specialist',
    category: 'Communication',
    status: 'CONNECTED',
    logo: '💬',
    description: 'Instant web messaging dispatcher for automated group notices and customer broadcast sync.',
    capabilities: ['Direct Web Launch', 'Draft Broadcast', 'Contact Matching', 'SMS Fallback'],
    accentColor: 'from-emerald-500 to-teal-600',
    sampleQuery: 'Open WhatsApp Web and draft message for trip group',
    simulatedWorkflowSteps: ['Matching contact group', 'Extracting message payload', 'Launching WhatsApp Web interface', 'Message ready'],
    sampleResult: {
      title: 'WhatsApp Web Dispatched',
      summary: 'Navigated to https://web.whatsapp.com with group draft.',
      metrics: { Delivery: 'Real-time Web', Encryption: 'E2E Verified' }
    }
  },
  {
    id: 'makemytrip',
    name: 'MakeMyTrip',
    agentName: 'AI Travel Agent',
    agentRole: 'Flight, Train & Itinerary Planner',
    category: 'Travel',
    status: 'DEMO',
    logo: '✈️',
    description: 'Simulated travel booking agent for holiday package planning, flight seat selection, and fare optimization.',
    capabilities: ['Itinerary Synthesis', 'Flight Rate Scan', 'Hotel Room Reserve', 'Package Bundling'],
    accentColor: 'from-blue-500 to-indigo-600',
    sampleQuery: 'I want to travel to Goa for 4 days next weekend',
    simulatedWorkflowSteps: ['Understanding travel request', 'Extracting destination & dates', 'Querying flight & resort rates', 'Generating 4-day itinerary'],
    sampleResult: {
      title: '4-Day Goa Vacation Package Prepared',
      summary: 'Non-stop flight + Beachfront Resort reserved; Total: $480.',
      metrics: { Flight: 'IndiGo 6E-204', Hotel: 'Taj Exotica Goa', Savings: '18% Demo Rate' }
    }
  },
  {
    id: 'googlemaps',
    name: 'Google Maps',
    agentName: 'AI Location Agent',
    agentRole: 'Geospatial Route & Navigation Guide',
    category: 'Travel',
    status: 'DEMO',
    logo: '🗺️',
    description: 'Real-time spatial mapping agent evaluating traffic SLA, landmark stops, and scenic detour routes.',
    capabilities: ['Route Optimization', 'Traffic Forecast', 'POI Landmark Extraction', 'ETA Calculation'],
    accentColor: 'from-emerald-500 to-blue-500',
    sampleQuery: 'Find best route and stops from Mumbai to Goa',
    simulatedWorkflowSteps: ['Querying spatial coordinates', 'Evaluating traffic delay vectors', 'Selecting top 3 scenic stops', 'Generating route map'],
    sampleResult: {
      title: 'Scenic Coastal Highway Route Mapped',
      summary: 'NH 66 route optimized; ETA: 9 hrs 45 mins with 2 scenic lunch stops.',
      metrics: { Distance: '585 km', Stops: 'Chiplun & Ratnagiri' }
    }
  },
  {
    id: 'gmail',
    name: 'Gmail',
    agentName: 'AI Email Agent',
    agentRole: 'Autonomous Email Composer & Inbox Triage',
    category: 'Communication',
    status: 'DEMO',
    logo: '✉️',
    description: 'Automated executive email composer drafting travel confirmations, meeting invites, and client briefs.',
    capabilities: ['Smart Thread Draft', 'Urgency Triage', 'Attachment Parser', 'Out-of-Office Rule'],
    accentColor: 'from-red-500 to-amber-600',
    sampleQuery: 'Draft confirmation email for Goa trip to my manager',
    simulatedWorkflowSteps: ['Analyzing recipient & context', 'Drafting formal out-of-office note', 'Attaching travel itinerary', 'Staging draft in Gmail'],
    sampleResult: {
      title: 'Travel Leave Notice Draft Staged',
      summary: 'Draft prepared in Gmail: "Out of Office: Goa Consult (June 12-15)".',
      metrics: { Status: 'Draft Staged', Recipient: 'Manager / Team' }
    }
  },
  {
    id: 'gcalendar',
    name: 'Google Calendar',
    agentName: 'AI Scheduling Agent',
    agentRole: 'Executive Calendar & Timeblock Coordinator',
    category: 'Productivity',
    status: 'DEMO',
    logo: '📅',
    description: 'Autonomous calendar coordinator blocking focus slots, vacation days, and client meetings with zero conflicts.',
    capabilities: ['Conflict Resolution', 'Timeblock Allocation', 'Timezone Converter', 'Attendee Invites'],
    accentColor: 'from-blue-600 to-cyan-500',
    sampleQuery: 'Block my calendar for Goa trip next Thursday to Sunday',
    simulatedWorkflowSteps: ['Scanning existing events', 'Identifying 0 schedule conflicts', 'Creating 4-day Out of Office block', 'Syncing calendar'],
    sampleResult: {
      title: 'Calendar Block Confirmed',
      summary: 'Events blocked: June 12 09:00 AM to June 15 06:00 PM.',
      metrics: { BlockedDays: '4 Days', ConflictsResolved: '3 Meetings Rescheduled' }
    }
  },
  {
    id: 'spotify',
    name: 'Spotify',
    agentName: 'AI Music Agent',
    agentRole: 'Audio Mood & Playlist Curation Engine',
    category: 'Entertainment',
    status: 'DEMO',
    logo: '🎵',
    description: 'Smart soundscape engine generating custom road-trip playlists, deep focus ambient tracks, and party queues.',
    capabilities: ['BPM Track Matching', 'Mood Curation', 'Podcast Queueing', 'Audio Dynamics'],
    accentColor: 'from-green-500 to-emerald-600',
    sampleQuery: 'Create a 4-hour road trip playlist for Goa travel',
    simulatedWorkflowSteps: ['Analyzing genre preferences', 'Selecting 65 indie & chill acoustic tracks', 'Building 4-hour flow', 'Publishing playlist'],
    sampleResult: {
      title: 'Playlist Generated: "Goa Coastal Drive 🌅"',
      summary: '65 tracks curated (4 hrs 12 mins) blending chill acoustic & tropical vibes.',
      metrics: { Tracks: '65 Songs', Vibe: 'Tropical Sunset Chill' }
    }
  },
  {
    id: 'amazon',
    name: 'Amazon',
    agentName: 'AI Shopping Agent',
    agentRole: 'Product Intelligence & Cart Curator',
    category: 'Shopping',
    status: 'DEMO',
    logo: '📦',
    description: 'Smart retail assistant comparing prime delivery SLAs, price drops, and beachwear essentials.',
    capabilities: ['Price Tracker', 'Prime SLA Check', 'Cart Auto-Curation', 'Review Summarizer'],
    accentColor: 'from-amber-500 to-orange-600',
    sampleQuery: 'Find travel sunscreen and waterproof phone pouch on Amazon',
    simulatedWorkflowSteps: ['Scanning top-rated Prime items', 'Filtering >4.5 star ratings', 'Adding SPF 50 & IPX8 pouch to cart', 'Checkout staging'],
    sampleResult: {
      title: 'Beach Travel Essentials Cart Staged',
      summary: 'Neutrogena SPF 50 + Spigen IPX8 Pouch added ($28 total). Delivery tomorrow.',
      metrics: { SLA: 'Tomorrow 10 AM', Savings: '$6 Prime Discount' }
    }
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    agentName: 'AI Shopping Agent',
    agentRole: 'E-Commerce Deal & Electronics Finder',
    category: 'Shopping',
    status: 'DEMO',
    logo: '🛍️',
    description: 'Deals radar agent tracking SuperCoins rewards, instant bank discounts, and travel gadgets.',
    capabilities: ['SuperCoin Redemption', 'Bank Instant Offer Scan', 'Product Comparison', 'Express Dispatch'],
    accentColor: 'from-blue-500 to-cyan-600',
    sampleQuery: 'Find noise canceling headphones on Flipkart under $100',
    simulatedWorkflowSteps: ['Querying audio category', 'Applying 10% HDFC card offer', 'Selecting CMF Phone/Headphones', 'Staging order'],
    sampleResult: {
      title: 'Noise Canceling Headphones Deal Found',
      summary: 'boAt Nirvana ANC Headphones for $54 (Saved 35%).',
      metrics: { SuperCoins: '+120 Earned', Delivery: '2 Days' }
    }
  },
  {
    id: 'zomato',
    name: 'Zomato',
    agentName: 'AI Food Agent',
    agentRole: 'Restaurant Discovery & Dining Planner',
    category: 'Food',
    status: 'DEMO',
    logo: '🍔',
    description: 'Gastronomy agent booking table reservations at top-rated seafood shacks and dining hotspots.',
    capabilities: ['Table Reservation', 'Cuisine Match', 'Gold Member Offers', 'Dietary Filter'],
    accentColor: 'from-red-600 to-rose-700',
    sampleQuery: 'Reserve table for 2 at top seafood restaurant in North Goa',
    simulatedWorkflowSteps: ['Searching North Goa seafood restaurants', 'Filtering 4.8+ rating', 'Selecting Thalassa / Britto\'s', 'Reserving sunset table'],
    sampleResult: {
      title: 'Table Reserved at Thalassa Vagator 🌊',
      summary: 'Sunset table for 2 reserved for Friday 7:00 PM.',
      metrics: { Discount: '20% Zomato Gold', Seat: 'Cliffside Sunset View' }
    }
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    agentName: 'AI Food Agent',
    agentRole: 'Hyperlocal Food & Instamart Express Dispatch',
    category: 'Food',
    status: 'DEMO',
    logo: '🍕',
    description: 'Express delivery manager ordering late-night snacks, fresh fruit juices, and beach supplies.',
    capabilities: ['Instamart 10-min Delivery', 'One Binge Offers', 'Live Order Tracking', 'Group Order'],
    accentColor: 'from-orange-500 to-amber-600',
    sampleQuery: 'Order cold beverages and snacks to resort via Swiggy Instamart',
    simulatedWorkflowSteps: ['Locating nearest Instamart dark store', 'Curating coconut water & chips', 'Applying Swiggy One free delivery', 'Driver assigned'],
    sampleResult: {
      title: 'Instamart Order Dispatched 🛵',
      summary: 'Cold Brew + Energy Bars arriving in 12 mins to resort lobby.',
      metrics: { ETA: '12 Minutes', DeliveryFee: '$0 (Swiggy One)' }
    }
  },
  {
    id: 'uber',
    name: 'Uber',
    agentName: 'AI Mobility Agent',
    agentRole: 'Autonomous Ride & Fleet Dispatcher',
    category: 'Travel',
    status: 'DEMO',
    logo: '🚗',
    description: 'Mobility coordinator scheduling airport pickups, SUV rentals, and premium ride locks.',
    capabilities: ['Reserve Ride in Advance', 'Surge Pricing Dodge', 'UberXL Fleet Selection', 'Driver Live GPS'],
    accentColor: 'from-slate-800 to-slate-950',
    sampleQuery: 'Schedule an UberXL for Goa Airport pickup at 2:00 PM',
    simulatedWorkflowSteps: ['Checking airport terminal arrival time', 'Reserving UberXL SUV', 'Locking rate to prevent surge', 'Driver dossier prepared'],
    sampleResult: {
      title: 'UberXL Airport Pickup Reserved',
      summary: 'Driver assigned for 2:00 PM pickup at Dabolim Airport (GOI).',
      metrics: { Vehicle: 'Toyota Innova Crysta', PriceLock: '$32 Fixed' }
    }
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    agentName: 'AI Stay Agent',
    agentRole: 'Bespoke Villa & Unique Stays Concierge',
    category: 'Travel',
    status: 'DEMO',
    logo: '🏡',
    description: 'Concierge agent matching private pool villas, superhost apartments, and beachfront cottages.',
    capabilities: ['Superhost Filter', 'Private Pool Match', 'Instant Book Rules', 'Amenities Verification'],
    accentColor: 'from-rose-500 to-pink-600',
    sampleQuery: 'Find a private pool villa in Anjuna Goa on Airbnb',
    simulatedWorkflowSteps: ['Searching Anjuna Superhost villas', 'Verifying private pool & high-speed WiFi', 'Applying 10% weekly discount', 'Staging booking request'],
    sampleResult: {
      title: 'Luxury Pool Villa Selected 🏊',
      summary: 'Villa Terra Rosa (3 BHK with private infinity pool) reserved.',
      metrics: { Rating: '4.98 ★ Superhost', WiFi: '250 Mbps Fiber' }
    }
  },
  {
    id: 'booking',
    name: 'Booking.com',
    agentName: 'AI Travel/Stay Agent',
    agentRole: 'Global Hotel & Flight Fare Comparison',
    category: 'Travel',
    status: 'DEMO',
    logo: '🏨',
    description: 'Global travel matrix agent scanning Genius loyalty discounts, free cancellation locks, and hotel upgrades.',
    capabilities: ['Genius Level 3 Discounts', 'Free Cancellation Locks', 'Breakfast Included Filter', 'Multi-currency'],
    accentColor: 'from-blue-700 to-indigo-800',
    sampleQuery: 'Compare 5-star beach resorts in Goa with free cancellation',
    simulatedWorkflowSteps: ['Scanning 5-star beachfront resorts', 'Applying Genius Level 3 20% discount', 'Selecting W Goa Resort', 'Locking free cancellation till June 10'],
    sampleResult: {
      title: 'W Goa Resort Booking Prepared',
      summary: 'Wonderful Room with ocean balcony + Free Breakfast ($190/night).',
      metrics: { GeniusDiscount: '20% Off', Cancellation: 'Free until June 10' }
    }
  },
  {
    id: 'zoom',
    name: 'Zoom',
    agentName: 'AI Meeting Agent',
    agentRole: 'Virtual Conference & Transcript Summarizer',
    category: 'Meetings',
    status: 'DEMO',
    logo: '📹',
    description: 'Autonomous meeting assistant scheduling HD Zoom rooms, sending calendar invites, and recording AI notes.',
    capabilities: ['Auto Room Generation', 'AI Summary & Action Items', 'Waiting Room Security', 'Cloud Recording'],
    accentColor: 'from-blue-500 to-cyan-500',
    sampleQuery: 'Schedule a 30-min Zoom meeting for Friday 11:00 AM with sales team',
    simulatedWorkflowSteps: ['Generating secure Zoom room URL', 'Attaching passcode & waiting room rules', 'Adding link to Google Calendar', 'Inviting 6 team members'],
    sampleResult: {
      title: 'Zoom Meeting Room Created',
      summary: 'Topic: "Quarterly Sales Briefing" (June 13, 11:00 AM).',
      metrics: { RoomID: '891-4420-9901', Security: 'Passcode + Waiting Room' }
    }
  },
  {
    id: 'slack',
    name: 'Slack',
    agentName: 'AI Team Agent',
    agentRole: 'Channel Workspace Triage & Huddle Dispatch',
    category: 'Communication',
    status: 'DEMO',
    logo: '💬',
    description: 'Workspace agent posting automated status updates, summarizing unread channels, and launching huddles.',
    capabilities: ['Channel Broadcast', 'Huddle Trigger', 'Status Auto-Set', 'Thread Summarizer'],
    accentColor: 'from-purple-600 to-amber-500',
    sampleQuery: 'Update Slack status to Traveling and notify #team-leads',
    simulatedWorkflowSteps: ['Updating Slack status to ✈️ Traveling', 'Posting update to #team-leads', 'Pausing notifications until Monday', 'Sync completed'],
    sampleResult: {
      title: 'Slack Status & Broadcast Updated',
      summary: 'Status set to "✈️ Out of Office". Message posted to #team-leads.',
      metrics: { Notifications: 'Snoozed', Workspace: 'Nexus Enterprise' }
    }
  },
  {
    id: 'msteams',
    name: 'Microsoft Teams',
    agentName: 'AI Collaboration Agent',
    agentRole: 'Enterprise Collaboration & Ops Sync',
    category: 'Meetings',
    status: 'DEMO',
    logo: '👔',
    description: 'Enterprise Teams bot managing channel files, scheduling Viva Insights focus blocks, and initiating calls.',
    capabilities: ['Viva Insights Block', 'Channel File Share', 'Live Transcript Sync', 'Tenant Policy Enforcement'],
    accentColor: 'from-indigo-600 to-blue-700',
    sampleQuery: 'Schedule Teams call with IT Security for compliance review',
    simulatedWorkflowSteps: ['Checking IT Security calendar availability', 'Creating Teams meeting link', 'Attaching compliance dossier PDF', 'Invites dispatched'],
    sampleResult: {
      title: 'Microsoft Teams Meeting Scheduled',
      summary: 'Teams Link: "Security SLA Review" (Thursday 4:00 PM).',
      metrics: { Channel: 'IT-Compliance', Tenant: 'Verified Office 365' }
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    agentName: 'AI Career/Talent Agent',
    agentRole: 'Professional Network & Talent Sourcing Radar',
    category: 'Career',
    status: 'DEMO',
    logo: '💼',
    description: 'Career intelligence agent monitoring candidate profiles, industry news shifts, and networking outreach.',
    capabilities: ['Candidate Sourcing', 'Post Engagement Analytics', 'InMail Draft Generator', 'Industry News Triage'],
    accentColor: 'from-blue-600 to-cyan-700',
    sampleQuery: 'Find senior AI engineers on LinkedIn in San Francisco',
    simulatedWorkflowSteps: ['Querying LinkedIn Recruiter network', 'Filtering >5 yrs AI experience in SF', 'Shortlisting top 5 candidates', 'Drafting personalized InMail'],
    sampleResult: {
      title: '5 Senior AI Candidates Shortlisted',
      summary: 'Matched 5 SF-based AI Staff Engineers with PyTorch & LLM experience.',
      metrics: { ResponseRateEst: '68%', Candidates: '5 Verified Profiles' }
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    agentName: 'AI Social Engagement Agent',
    agentRole: 'Social Brand & Visual Content Curator',
    category: 'Entertainment',
    status: 'DEMO',
    logo: '📸',
    description: 'Visual engagement agent curating vacation reel ideas, trending audio tracks, and brand story drafts.',
    capabilities: ['Reel Audio Matcher', 'Caption Generator', 'Hashtag Optimization', 'Story Scheduler'],
    accentColor: 'from-purple-500 via-pink-500 to-amber-500',
    sampleQuery: 'Generate Goa trip Instagram Reel captions and trending audio tags',
    simulatedWorkflowSteps: ['Analyzing travel aesthetic keywords', 'Selecting top 3 trending tropical audio tracks', 'Generating 5 catchy captions', 'Hashtag set prepared'],
    sampleResult: {
      title: 'Reel Captions & Audio Tags Ready ✨',
      summary: 'Caption: "Tropical state of mind 🌴🌊". Audio: "Goa Sunset Mix (Trending)".',
      metrics: { ReachScore: 'High Potential', Hashtags: '#GoaVibes #BeachLife #TravelReels' }
    }
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    agentName: 'AI Document Agent',
    agentRole: 'Cloud File Indexer & Semantic Search Assistant',
    category: 'Productivity',
    status: 'DEMO',
    logo: '📁',
    description: 'Document intelligence agent indexing PDFs, sheets, and presentations across enterprise shared drives.',
    capabilities: ['OCR Document Search', 'PDF Content Extractor', 'Permission Audit', 'Auto-Folder Organization'],
    accentColor: 'from-amber-400 via-emerald-500 to-blue-500',
    sampleQuery: 'Find the Q3 Travel Expense report PDF in Google Drive',
    simulatedWorkflowSteps: ['Querying Drive API semantic index', 'Filtering PDF files matching "Travel Expense"', 'Found "Q3_Travel_Expenses_Final.pdf"', 'Generated preview link'],
    sampleResult: {
      title: 'Drive Document Found: Q3 Travel Expenses',
      summary: 'File located in "Shared Drive / Finance / 2026 Reports".',
      metrics: { Size: '2.4 MB', LastModified: '3 days ago' }
    }
  },
  {
    id: 'notion',
    name: 'Notion',
    agentName: 'AI Knowledge Agent',
    agentRole: 'Workspace Wiki & Database Synthesizer',
    category: 'Productivity',
    status: 'DEMO',
    logo: '📝',
    description: 'Workspace wiki synthesizer converting messy conversation notes into structured Notion databases and roadmaps.',
    capabilities: ['Database Auto-Creation', 'Markdown Page Synthesis', 'Kanban Board Sync', 'Wiki Search'],
    accentColor: 'from-slate-700 to-slate-950',
    sampleQuery: 'Create a Notion travel page for Goa trip with packing checklist',
    simulatedWorkflowSteps: ['Structuring Notion page template', 'Building Packing Checklist database', 'Adding itinerary sub-pages', 'Publishing to workspace'],
    sampleResult: {
      title: 'Notion Travel Dashboard Published 📝',
      summary: 'Page "Goa Trip 2026" created with Packing Checklist & Budget database.',
      metrics: { DatabaseItems: '18 Items', Status: 'Live Workspace Page' }
    }
  },
  {
    id: 'github',
    name: 'GitHub',
    agentName: 'AI Developer Agent',
    agentRole: 'Codebase Audit & PR Review Specialist',
    category: 'Development',
    status: 'DEMO',
    logo: '🐙',
    description: 'Developer intelligence agent auditing pull requests, running CI test suites, and drafting release notes.',
    capabilities: ['PR Code Review', 'CI/CD Workflow Trigger', 'Issue Triage', 'Release Notes Synthesizer'],
    accentColor: 'from-purple-600 to-slate-900',
    sampleQuery: 'Review latest PR #142 and run CI workflow on GitHub',
    simulatedWorkflowSteps: ['Fetching PR #142 code diff', 'Running static analysis & test suite', 'Verifying 100% test pass rate', 'Approving PR & staging merge'],
    sampleResult: {
      title: 'GitHub PR #142 Approved & CI Verified',
      summary: 'PR "feat: AI Cross-Platform Orchestrator" passed all CI tests (14/14).',
      metrics: { Tests: '14 Passed', Coverage: '98.6%' }
    }
  }
];
