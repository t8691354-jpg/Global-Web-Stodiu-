// server.ts
import express2 from "express";
import path3 from "path";
import { fileURLToPath } from "url";

// server/routes.ts
import express from "express";
import multer from "multer";
import path2 from "path";
import crypto3 from "crypto";
import fs2 from "fs";

// server/storage.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";

// src/data/initialData.ts
var initialAgencySettings = {
  businessName: "GlobalWeb Studio",
  tagline: "Precision Web Engineering & International Digital Solutions",
  contactEmail: "contact@globalwebstudio.com",
  supportEmail: "support@globalwebstudio.com",
  phone: "+1 (555) 019-2834",
  headquarters: "International Remote Studio \u2022 Serving Clients Worldwide",
  workingHours: "Monday \u2013 Friday, 08:00 \u2013 18:00 UTC",
  currency: "USD",
  currencySymbol: "$",
  orderPrefix: "GWS",
  allowHighValueDealsUpTo2M: true
};
var initialPackages = [
  // --- AFFORDABLE PROJECTS ($80 - $999) ---
  {
    id: "basic-landing-80",
    name: "Basic Landing Page",
    tagline: "Compact, high-speed single section presence designed for fast campaigns, bios, or pre-launch notices.",
    price: 80,
    tier: "affordable",
    category: "Landing Pages",
    pagesDescription: "1 Single Landing Page",
    revisions: "1 revision round",
    deliveryTime: "2 \u2013 3 business days",
    idealClient: "Solopreneurs, product teasers, event organizers",
    description: "Clean responsive single-page design with call-to-action button, essential contact links, and fast loading performance.",
    active: true,
    displayOrder: 1,
    includedFeatures: [
      "Single responsive landing view",
      "Hero banner with CTA headline",
      "Mobile & desktop optimized layout",
      "Direct WhatsApp or email mailto link",
      "Semantic HTML5 & clean modern CSS"
    ],
    excludedFeatures: [
      "Multi-page navigation",
      "Server-side form backend",
      "CMS or dynamic database"
    ]
  },
  {
    id: "personal-portfolio-99",
    name: "Personal Portfolio Website",
    tagline: "Showcase resume, case studies, creative assets, and bio with sleek typography.",
    price: 99,
    tier: "affordable",
    category: "Portfolio",
    pagesDescription: "1 \u2013 2 responsive pages",
    revisions: "2 revision rounds",
    deliveryTime: "3 business days",
    idealClient: "Freelancers, consultants, photographers, software developers",
    description: "An elegant personal portfolio crafted to showcase projects, skills, background, and downloadable resume.",
    active: true,
    displayOrder: 2,
    includedFeatures: [
      "Curated projects showcase gallery",
      "Interactive modal for project inspection",
      "Downloadable resume/CV button",
      "Contact inquiry trigger",
      "Social links & personal branding palette"
    ],
    excludedFeatures: [
      "E-commerce store or billing",
      "Client login portal"
    ]
  },
  {
    id: "starter",
    name: "Starter Business Website",
    tagline: "Ideal for startups, solopreneurs, and single-service businesses needing a swift, high-impact presence.",
    price: 149,
    tier: "affordable",
    popular: true,
    category: "Business",
    pagesDescription: "1 to 3 fully responsive pages",
    revisions: "2 rounds of structured revisions",
    deliveryTime: "3 \u2013 5 business days",
    idealClient: "Local service businesses, consulting practices, niche startups",
    description: "Clean, professional digital storefront engineered for speed, mobile responsiveness, and foundational conversion.",
    active: true,
    displayOrder: 3,
    includedFeatures: [
      "1\u20133 Custom Designed Pages (Home, About, Services/Contact)",
      "100% Mobile & Tablet Responsive Layout",
      "Clean Semantic HTML5, CSS & Modern Framework",
      "Interactive Contact Form with Validation",
      "Essential On-Page Meta Tag SEO Setup",
      "Fast Load Time Optimization (< 1.5s target)",
      "Social Media & Direct WhatsApp / Email Links",
      "Cross-Browser Testing (Chrome, Safari, Edge, Firefox)",
      "Deployment to your preferred web host or server"
    ],
    excludedFeatures: [
      "E-commerce cart and product checkout",
      "Complex server database / custom backend API",
      "Third-party automated payment gateway",
      "Multi-language dynamic translation engine"
    ]
  },
  {
    id: "pro-landing-199",
    name: "Professional Landing Page",
    tagline: "Engineered for ad campaigns, lead capture funnels, and marketing PPC conversions.",
    price: 199,
    tier: "affordable",
    category: "Landing Pages",
    pagesDescription: "Dedicated High-Conversion Funnel Page",
    revisions: "3 revision rounds",
    deliveryTime: "4 \u2013 5 business days",
    idealClient: "Growth marketers, SaaS product launches, real estate lead capture",
    description: "A focused, multi-section landing page equipped with hero video/image support, benefits matrix, lead capture form, and FAQ accordion.",
    active: true,
    displayOrder: 4,
    includedFeatures: [
      "High-converting multi-section landing flow",
      "Lead capture form with server validation",
      "Trust badges & feature highlight grid",
      "FAQ accordion component",
      "Google Analytics 4 & Meta Pixel integration ready"
    ],
    excludedFeatures: ["Multi-page corporate site", "User login portal"]
  },
  {
    id: "small-biz-249",
    name: "Small Business Website",
    tagline: "Multi-page digital presence for local storefronts, trades, and professional agencies.",
    price: 249,
    tier: "affordable",
    category: "Business",
    pagesDescription: "Up to 5 structured pages",
    revisions: "3 revision rounds",
    deliveryTime: "5 \u2013 7 business days",
    idealClient: "Clinics, dental practices, trade professionals, local firms",
    description: "Standard 5-page business site covering Home, About, Services, Gallery, and Contact with location map.",
    active: true,
    displayOrder: 5,
    includedFeatures: [
      "Up to 5 custom designed pages",
      "Interactive Google Maps embed",
      "Service catalog with detailed breakdowns",
      "Contact form with email dispatch",
      "Mobile responsive navigation drawer"
    ],
    excludedFeatures: ["E-commerce online transactions", "Member dashboard"]
  },
  {
    id: "multi-page-299",
    name: "Multi-Page Website",
    tagline: "Expansive information architecture with dedicated team bios, client resources, and quote request forms.",
    price: 299,
    tier: "affordable",
    category: "Business",
    pagesDescription: "6 to 7 customized pages",
    revisions: "3 revision rounds",
    deliveryTime: "6 \u2013 8 business days",
    idealClient: "Legal firms, architecture studios, regional consultancies",
    description: "Complete informational platform with custom branded styling and structured navigation.",
    active: true,
    displayOrder: 6,
    includedFeatures: [
      "6\u20137 structured pages with custom layouts",
      "Detailed services and process overview",
      "Team members & credentials showcase",
      "Comprehensive quote request form",
      "Speed optimization & technical SEO tags"
    ],
    excludedFeatures: ["User accounts / login", "Payment processing"]
  },
  {
    id: "business",
    name: "Business Website Plus",
    tagline: "The complete corporate digital foundation for established companies and professional practices.",
    price: 349,
    tier: "affordable",
    popular: true,
    isFeatured: true,
    category: "Corporate",
    pagesDescription: "Up to 7\u201310 structured pages",
    revisions: "4 rounds of comprehensive revisions",
    deliveryTime: "7 \u2013 10 business days",
    idealClient: "Established commercial brands, logistics firms, corporate practices",
    description: "A comprehensive, multi-page web platform designed to establish commercial authority, capture inbound leads, and present your services.",
    active: true,
    displayOrder: 7,
    includedFeatures: [
      "Up to 7\u201310 Custom Pages (Home, About, Detailed Services, Portfolio, FAQ, Blog, Contact)",
      "Bespoke Visual Design with Branded Typography & Palette",
      "Full Responsive Architecture & Micro-Interactions",
      "Content Management / Blog Structure Setup",
      "Advanced On-Page Technical SEO & Schema Markup Ready",
      "Lead Generation Forms with File Upload & Email Routing",
      "Google Maps & Location Integration",
      "Google Analytics 4 & Meta Pixel Setup Ready",
      "Speed & Performance Optimization (Score 90+ Target)",
      "30 Days Post-Launch Bug Fix Support Guarantee"
    ],
    excludedFeatures: [
      "Multi-vendor marketplace functionality",
      "Custom user membership portals with subscription billing",
      "Third-party ERP or warehousing API synchronization"
    ]
  },
  {
    id: "pro-portfolio-499",
    name: "Professional Portfolio Website",
    tagline: "High-end aesthetic portfolio with filterable work galleries and client presentation decks.",
    price: 499,
    tier: "affordable",
    category: "Creative & Agency",
    pagesDescription: "Rich filterable portfolio with case study pages",
    revisions: "4 revision rounds",
    deliveryTime: "7 \u2013 10 business days",
    idealClient: "Creative agencies, filmmakers, architects, luxury photographers",
    description: "Rich visual experience featuring media sliders, interactive categorization, client testimonials structure, and project deep-dives.",
    active: true,
    displayOrder: 8,
    includedFeatures: [
      "Filterable project matrix with dynamic modals",
      "Case study deep-dive templates",
      "High-resolution imagery optimization",
      "Smooth micro-interactions & transitions",
      "Client consultation booking flow"
    ],
    excludedFeatures: ["Digital downloads e-commerce checkout"]
  },
  {
    id: "adv-biz-599",
    name: "Advanced Business Website",
    tagline: "Scalable corporate web infrastructure with multi-department inquiries and resource center.",
    price: 599,
    tier: "affordable",
    category: "Corporate",
    pagesDescription: "10 to 14 structured corporate pages",
    revisions: "4 revision rounds",
    deliveryTime: "8 \u2013 12 business days",
    idealClient: "Mid-sized industrial enterprises, manufacturing firms, multi-location companies",
    description: "Extensive business platform with dedicated career postings, press/news section, multi-office contacts, and lead triage.",
    active: true,
    displayOrder: 9,
    includedFeatures: [
      "10\u201314 bespoke corporate pages",
      "Multi-department contact routing",
      "Careers & job opening board layout",
      "Downloadable whitepaper / PDF brochure gating",
      "Technical SEO architecture & breadcrumb schema"
    ],
    excludedFeatures: ["Full transactional shopping cart"]
  },
  {
    id: "ecommerce",
    name: "Starter E-commerce Website",
    tagline: "Full-featured online store ready for product sales, catalog browsing, and manual bank/wire checkout.",
    price: 699,
    tier: "affordable",
    popular: true,
    category: "Commerce",
    pagesDescription: "Full store: Catalog, Product Pages, Cart, Checkout & Policies",
    revisions: "5 rounds of detailed revisions",
    deliveryTime: "12 \u2013 16 business days",
    idealClient: "Boutique retailers, direct-to-consumer lifestyle brands, wholesalers",
    description: "A robust e-commerce storefront featuring organized product categorization, cart management, manual bank transfer checkout, and order tracking.",
    active: true,
    displayOrder: 10,
    includedFeatures: [
      "Full E-Commerce Catalog & Product Architecture",
      "Initial Upload & Formatting of up to 25 Sample Products",
      "Product Filtering, Search, and Category Management",
      "Shopping Cart & Streamlined Checkout Flow",
      "Manual Payment Instructions & Bank Transfer Processing Workflow",
      "Automated Order Confirmation Email Templates",
      "Customer Account & Order History Interfaces",
      "Inventory Tracking & Out-of-Stock Badges",
      "Coupon & Promotional Discount Code Mechanism",
      "Comprehensive Mobile Optimization for Shoppers",
      "45 Days Post-Launch Support & Walkthrough Documentation"
    ],
    excludedFeatures: [
      "Automatic card payment gateway merchant integration (Manual/Bank transfer included)",
      "Multi-vendor split-payout marketplace architecture",
      "Custom warehouse robotics automation or SAP ERP direct sync"
    ]
  },
  {
    id: "ecommerce-plus-799",
    name: "E-commerce Plus",
    tagline: "Enhanced commercial storefront with advanced product variant selectors, reviews, and related items engine.",
    price: 799,
    tier: "affordable",
    category: "Commerce",
    pagesDescription: "Up to 50 initial products with advanced filtering",
    revisions: "5 revision rounds",
    deliveryTime: "14 \u2013 18 business days",
    idealClient: "Established online merchants, specialty apparel, electronics retailers",
    description: "High-converting online store with multi-attribute variants (size, color, material), related item cross-sells, and customer wishlist.",
    active: true,
    displayOrder: 11,
    includedFeatures: [
      "Multi-attribute product variant engine",
      "Customer wishlist & product comparison table",
      "Cross-sell & related item recommendations",
      "Manual bank transfer checkout with proof upload",
      "Customer order tracking portal integration"
    ],
    excludedFeatures: ["Multi-currency live exchange rate automated hedging"]
  },
  {
    id: "pro-biz-999",
    name: "Professional Business Website",
    tagline: "Premier corporate platform engineered for market authority, lead automation, and executive branding.",
    price: 999,
    tier: "affordable",
    isFeatured: true,
    category: "Corporate",
    pagesDescription: "15+ pages with interactive calculators and client intake",
    revisions: "6 revision rounds",
    deliveryTime: "14 \u2013 20 business days",
    idealClient: "Financial services, wealth management, consulting consortiums",
    description: "Top-tier corporate presence featuring interactive pricing calculators, custom appointment scheduling, and bilingual preparation.",
    active: true,
    displayOrder: 12,
    includedFeatures: [
      "15+ custom pages with bespoke layouts",
      "Interactive pricing or ROI calculator component",
      "Executive leadership profile portfolio",
      "Custom appointment scheduling integration",
      "60-day priority maintenance warranty"
    ],
    excludedFeatures: ["Custom cloud infrastructure backend coding"]
  },
  // --- GROWING BUSINESS PROJECTS ($1,200 - $100,000) ---
  {
    id: "adv-biz-1200",
    name: "Advanced Business Web System",
    tagline: "Multi-regional corporate website with language localization and dynamic content portals.",
    price: 1200,
    tier: "growing",
    category: "Corporate",
    pagesDescription: "Comprehensive corporate portal with multi-language layout",
    revisions: "6 revision rounds",
    deliveryTime: "3 \u2013 4 weeks",
    idealClient: "International exporters, regional distributors, professional networks",
    description: "Robust international business website supporting multi-language navigation, interactive regional office selector, and partner portals.",
    active: true,
    displayOrder: 13,
    includedFeatures: [
      "Multi-language UI framework architecture",
      "Interactive regional distributor / office directory",
      "Document library with downloadable resource access",
      "Advanced lead qualifying questionnaire",
      "Full TypeScript/React source code handover"
    ],
    excludedFeatures: ["Real-time algorithmic trading / automated order clearing"]
  },
  {
    id: "custom",
    name: "Custom Business Website",
    tagline: "Tailored digital solutions, bespoke layouts, and custom workflows tailored to exact specifications.",
    price: 1500,
    isStartingAt: true,
    tier: "growing",
    category: "Custom Enterprise",
    pagesDescription: "Custom architecture tailored to functional scope",
    revisions: "Milestone-based collaborative review cycles",
    deliveryTime: "3 \u2013 6 weeks (milestone-based delivery)",
    idealClient: "High-growth companies requiring custom features, tailored integrations",
    description: "For companies requiring unique web platforms, internal operational dashboards, custom client portals, or specialized interactive tooling.",
    active: true,
    displayOrder: 14,
    includedFeatures: [
      "Bespoke Architecture & Interactive UI/UX Design System",
      "Custom Database Schema & Secure REST APIs",
      "Role-Based Access Control (RBAC) & User Management",
      "Custom Business Logic, Dashboards & Reporting Panels",
      "Private File Upload & Document Management System",
      "Staging Environment for Milestone Approvals",
      "Full Source Code Ownership & Deployment Pipeline Setup",
      "60 Days Dedicated Technical Maintenance & Warranty"
    ],
    excludedFeatures: ["Third-party external license fees or premium cloud infrastructure bills"]
  },
  {
    id: "adv-ecom-platform-2000",
    name: "Advanced E-commerce Platform",
    tagline: "B2B/B2C hybrid commerce platform with wholesale tiers, bulk pricing, and custom checkout flows.",
    price: 2e3,
    tier: "growing",
    category: "Commerce",
    pagesDescription: "Full B2B/B2C commerce suite with account tiers",
    revisions: "Milestone cycles",
    deliveryTime: "4 \u2013 5 weeks",
    idealClient: "B2B wholesalers, high-volume consumer brands, subscription goods",
    description: "Extensive e-commerce solution with wholesale customer accounts, volume discount matrices, tiered pricing, and bank wire reconciliation.",
    active: true,
    displayOrder: 15,
    includedFeatures: [
      "Tiered pricing & wholesale customer account management",
      "Bulk order quantity pricing engine",
      "Custom invoice generation & PDF packing slips",
      "Multi-currency price display module",
      "Automated email notifications on order milestones"
    ],
    excludedFeatures: ["Custom hardware ERP robot sync"]
  },
  {
    id: "booking-platform-2500",
    name: "Booking and Appointment Platform",
    tagline: "Interactive reservations platform with staff schedules, resource availability, and client reminders.",
    price: 2500,
    tier: "growing",
    category: "Booking & Operations",
    pagesDescription: "Full scheduling platform with staff & client views",
    revisions: "Milestone cycles",
    deliveryTime: "4 \u2013 6 weeks",
    idealClient: "Medical practices, wellness retreats, consulting firms, tour operators",
    description: "Automated booking and scheduling system featuring real-time calendar availability, appointment approvals, staff roster management, and reminders.",
    active: true,
    displayOrder: 16,
    includedFeatures: [
      "Real-time availability calendar & time-slot picker",
      "Staff management dashboard with assigned schedules",
      "Service catalog with duration & buffer times",
      "Client appointment status & rescheduling portal",
      "Automated confirmation email workflows"
    ],
    excludedFeatures: ["Automated credit card gateway fees (Manual bank settlement supported)"]
  },
  {
    id: "customer-portal-3000",
    name: "Customer Portal & Client Area",
    tagline: "Authenticated client dashboard for contract tracking, deliverables inspection, and private messaging.",
    price: 3e3,
    tier: "growing",
    category: "Web Applications",
    pagesDescription: "Client portal with secure authentication and document vault",
    revisions: "Milestone cycles",
    deliveryTime: "4 \u2013 6 weeks",
    idealClient: "Accounting firms, legal consultancies, creative agencies, contractors",
    description: "Dedicated client area where clients log in securely to review project statuses, download confidential files, submit feedback, and view payment ledgers.",
    active: true,
    displayOrder: 17,
    includedFeatures: [
      "Secure client authentication & session handling",
      "Confidential document vault with upload/download permissions",
      "Real-time project milestone progress indicator",
      "Client messaging & revision request log",
      "Financial statement & bank payment tracking"
    ],
    excludedFeatures: ["Third-party biometric scanning hardware"]
  },
  {
    id: "custom-web-app-5000",
    name: "Custom Web Application",
    tagline: "Interactive operational web app tailored with custom backend logic, role permissions, and database models.",
    price: 5e3,
    tier: "growing",
    category: "Web Applications",
    pagesDescription: "Full-stack application tailored to operational workflows",
    revisions: "Milestone cycles",
    deliveryTime: "6 \u2013 8 weeks",
    idealClient: "Logistics operators, specialized service firms, internal corporate tooling",
    description: "Bespoke web application built with React, TypeScript, and Express. Includes custom workflows, data visualizers, role-based dashboards, and CSV/PDF export.",
    active: true,
    displayOrder: 18,
    includedFeatures: [
      "Complete React 19 + TypeScript frontend with tailored UI",
      "Express REST API backend with relational/document schema",
      "Multi-role access permissions (Super Admin, Manager, Staff, Client)",
      "Data filtering, search, and CSV/PDF reporting engines",
      "Detailed immutable audit trail logging"
    ],
    excludedFeatures: ["Native iOS/Android App Store compilation (Mobile web responsive included)"]
  },
  {
    id: "saas-mvp-7500",
    name: "SaaS MVP (Minimum Viable Product)",
    tagline: "Launch-ready software-as-a-service foundation with workspace onboarding, dashboard, and subscription tiers.",
    price: 7500,
    tier: "growing",
    isFeatured: true,
    category: "SaaS & Product",
    pagesDescription: "Complete SaaS MVP architecture with tenant workspaces",
    revisions: "Milestone cycles",
    deliveryTime: "6 \u2013 10 weeks",
    idealClient: "Tech founders, startup incubators, innovative domain experts",
    description: "Production-ready SaaS boilerplate and core application functionality. Includes tenant separation, user authentication, profile settings, and data dashboard.",
    active: true,
    displayOrder: 19,
    includedFeatures: [
      "Multi-tenant workspace architecture",
      "User signup, email verification & password recovery workflows",
      "Interactive application dashboard with functional widgets",
      "Subscription plan logic with feature gating",
      "Admin monitoring panel with tenant usage metrics"
    ],
    excludedFeatures: ["Automated merchant card gateway integration (manual wire & invoice rails included)"]
  },
  {
    id: "adv-saas-10000",
    name: "Advanced SaaS Platform",
    tagline: "Feature-rich SaaS platform with team invitations, API access tokens, activity feeds, and notifications.",
    price: 1e4,
    tier: "growing",
    category: "SaaS & Product",
    pagesDescription: "Multi-organization SaaS with team collaboration tools",
    revisions: "Milestone cycles",
    deliveryTime: "8 \u2013 12 weeks",
    idealClient: "Funded tech startups, enterprise internal SaaS tools",
    description: "Comprehensive software platform featuring organization management, member invitations with granular permission levels, webhook events, and reporting.",
    active: true,
    displayOrder: 20,
    includedFeatures: [
      "Organization & team collaboration module with invite links",
      "Granular permission matrices (Owner, Admin, Member, Read-Only)",
      "API key generation and usage rate limiting",
      "In-app notification center and email trigger alerts",
      "Advanced data visualization with charts and export filters"
    ],
    excludedFeatures: ["External legal compliance filing or trademark registration"]
  },
  {
    id: "marketplace-15000",
    name: "Multi-Vendor Marketplace",
    tagline: "Two-sided digital marketplace connecting buyers and sellers with individual storefronts and order management.",
    price: 15e3,
    tier: "growing",
    category: "Marketplace",
    pagesDescription: "Buyer & Seller portals with centralized administration",
    revisions: "Milestone cycles",
    deliveryTime: "10 \u2013 14 weeks",
    idealClient: "Industry niche marketplaces, artisan collectives, rental aggregators",
    description: "Full multi-vendor platform featuring vendor onboarding, product listing submissions with admin approval, commission logic, and order fulfillment.",
    active: true,
    displayOrder: 21,
    includedFeatures: [
      "Dedicated vendor portal for product listing and inventory",
      "Admin moderation desk for vendor and product approval",
      "Buyer browsing, shopping cart, and unified checkout",
      "Commission calculation and payout ledger tracking",
      "Vendor sales performance and reviews management"
    ],
    excludedFeatures: ["Automated instantaneous split banking payouts (manual ledger provided)"]
  },
  {
    id: "biz-automation-20000",
    name: "Business Automation Platform",
    tagline: "Centralize fragmented internal operations, CRM leads, inventory, and cross-department approvals.",
    price: 2e4,
    tier: "growing",
    category: "Enterprise Automation",
    pagesDescription: "Internal operational suite with workflow builder",
    revisions: "Milestone cycles",
    deliveryTime: "10 \u2013 16 weeks",
    idealClient: "Medium enterprises, fulfillment networks, multi-branch operations",
    description: "Custom ERP/CRM bridge eliminating manual spreadsheets. Automates lead assignment, inventory alerts, procurement approvals, and executive reports.",
    active: true,
    displayOrder: 22,
    includedFeatures: [
      "Automated multi-stage approval workflows",
      "Inventory stock level tracking with reorder thresholds",
      "Customer relationship management (CRM) pipeline",
      "Staff activity logs and performance metrics",
      "Automated PDF invoice and purchase order generation"
    ],
    excludedFeatures: ["Legacy on-premise mainframe hardware cabling"]
  },
  {
    id: "ent-webapp-25000",
    name: "Enterprise Web Application",
    tagline: "Robust enterprise-grade application engineered for high concurrency, stringent data security, and auditability.",
    price: 25e3,
    tier: "growing",
    category: "Enterprise Applications",
    pagesDescription: "High-security enterprise system with automated test suite",
    revisions: "Milestone cycles",
    deliveryTime: "12 \u2013 18 weeks",
    idealClient: "Financial consultancies, healthcare networks, corporate compliance",
    description: "Architected with strict type safety, unit and integration test coverage, encrypted data storage, and comprehensive compliance logging.",
    active: true,
    displayOrder: 23,
    includedFeatures: [
      "Enterprise architecture with automated test coverage",
      "Comprehensive Role-Based Access Control (RBAC) engine",
      "Encrypted confidential document repository",
      "Immutable audit logging for regulatory compliance",
      "Staging and production deployment pipelines (CI/CD ready)"
    ],
    excludedFeatures: ["On-premise hardware procurement"]
  },
  {
    id: "adv-marketplace-50000",
    name: "Advanced Marketplace Platform",
    tagline: "High-scale multi-sided commerce ecosystem with geo-location, real-time messaging, and dispute arbitration.",
    price: 5e4,
    isStartingAt: true,
    tier: "growing",
    category: "Marketplace",
    pagesDescription: "Comprehensive marketplace with dispute resolution and geo-matching",
    revisions: "Collaborative milestone phases",
    deliveryTime: "16 \u2013 24 weeks",
    idealClient: "High-growth marketplace ventures, international trading exchanges",
    description: "Scalable marketplace infrastructure featuring location-based supplier matching, real-time negotiation chat, milestone escrow ledger, and dispute management.",
    active: true,
    displayOrder: 24,
    includedFeatures: [
      "Location and radius-based vendor matching",
      "Real-time direct communication and negotiation system",
      "Milestone-based manual escrow ledger management",
      "Administrative dispute arbitration desk",
      "Comprehensive analytics suite for marketplace GMV and take-rates"
    ],
    excludedFeatures: ["Direct banking licensing / financial broker underwriting"]
  },
  {
    id: "ent-saas-75000",
    name: "Enterprise SaaS Solution",
    tagline: "Full enterprise software ecosystem with custom tenant domains, SSO capability, and deep analytics.",
    price: 75e3,
    isStartingAt: true,
    tier: "growing",
    category: "Enterprise SaaS",
    pagesDescription: "White-label multi-tenant SaaS with custom domains",
    revisions: "Collaborative milestone phases",
    deliveryTime: "20 \u2013 28 weeks",
    idealClient: "Scale-ups, corporate spin-offs, international B2B software vendors",
    description: "Enterprise multi-tenant architecture designed to support white-label domains, organization hierarchical permissions, custom reporting engines, and high-volume data.",
    active: true,
    displayOrder: 25,
    includedFeatures: [
      "White-label tenant branding & custom domain mapping framework",
      "Hierarchical permissions (Super Tenant, Org Admin, Unit Manager, End-User)",
      "Custom report builder with visual chart exports",
      "Webhook notification framework for external system sync",
      "Dedicated staging and QA environments with load testing benchmark report"
    ],
    excludedFeatures: ["Third-party external premium cloud hosting bills"]
  },
  {
    id: "large-digital-platform-100000",
    name: "Large-Scale Digital Platform",
    tagline: "Comprehensive digital infrastructure integrating mobile-responsive web, admin command center, and custom APIs.",
    price: 1e5,
    isStartingAt: true,
    tier: "growing",
    isEnterprise: true,
    category: "Digital Infrastructure",
    pagesDescription: "Complete digital ecosystem with multiple interconnected portals",
    revisions: "Structured sprint milestones",
    deliveryTime: "6 \u2013 8 months",
    idealClient: "National organizations, established franchise systems, industry leaders",
    description: "Large-scale digital infrastructure connecting consumers, branch staff, and executive leadership into a unified, secure real-time digital operational engine.",
    active: true,
    displayOrder: 26,
    includedFeatures: [
      "Multi-portal architecture (Customer Web, Branch Portal, Executive Command)",
      "Microservice/modular backend designed for horizontal scaling",
      "Complete end-to-end API documentation with Swagger/OpenAPI",
      "Enterprise security audit preparation & vulnerability remediation",
      "90 days dedicated post-launch hypercare technical team support"
    ],
    excludedFeatures: ["Government licensing fees and legal filings"]
  },
  // --- ENTERPRISE AND LARGE-SCALE PROJECTS ($150,000 - $2,000,000) ---
  {
    id: "ent-market-eco-150000",
    name: "Enterprise Marketplace Ecosystem",
    tagline: "Multi-regional marketplace infrastructure with complex logistics routing and supplier verification portals.",
    price: 15e4,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Enterprise Ecosystem",
    pagesDescription: "Continental marketplace network with multi-currency ledgers",
    revisions: "Dedicated agile sprint governance",
    deliveryTime: "6 \u2013 9 months",
    idealClient: "Global trade consortiums, commodity exchanges, cross-border aggregators",
    description: "Massive marketplace infrastructure supporting continental supplier onboarding, automated KYC document intake, multi-currency ledger tracking, and customs documentation.",
    active: true,
    displayOrder: 27,
    includedFeatures: [
      "Multi-region supplier verification and onboarding pipeline",
      "Automated customs & trade documentation generator",
      "Ledger-based multi-currency accounts and escrow milestones",
      "Dedicated dispute resolution and risk analysis tooling",
      "High-availability database replication architecture"
    ],
    excludedFeatures: ["Legal regulatory broker licensure"]
  },
  {
    id: "multi-industry-200000",
    name: "Multi-Industry Business Platform",
    tagline: "Unified digital command platform linking diverse subsidiaries, business units, and consolidated reporting.",
    price: 2e5,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Enterprise Platform",
    pagesDescription: "Multi-subsidiary conglomerate digital command center",
    revisions: "Dedicated agile governance",
    deliveryTime: "7 \u2013 10 months",
    idealClient: "Conglomerates, multi-sector holding corporations, private equity portfolios",
    description: "Enables holding companies to oversee operational workflows across disparate business units while standardizing user authentication, data privacy, and executive analytics.",
    active: true,
    displayOrder: 28,
    includedFeatures: [
      "Multi-subsidiary tenant isolation with parent group oversight",
      "Unified executive telemetry and financial consolidation dashboard",
      "Role-based cross-entity collaboration portals",
      "Compliance & data sovereignty framework",
      "Full source code, architecture blueprints, and deployment scripts"
    ],
    excludedFeatures: ["Acquisition target due diligence legal fees"]
  },
  {
    id: "ent-saas-eco-250000",
    name: "Enterprise SaaS Ecosystem",
    tagline: "Global multi-region SaaS platform engineered for international compliance, data sovereignty, and massive scale.",
    price: 25e4,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Enterprise SaaS",
    pagesDescription: "Multi-cluster SaaS with regional data sovereignty pods",
    revisions: "Enterprise sprint cycles",
    deliveryTime: "8 \u2013 12 months",
    idealClient: "Major tech corporations, multinational software providers",
    description: "Full software ecosystem featuring distributed regional database clusters, zero-downtime deployment pipelines, compliance logs, and dedicated enterprise support tools.",
    active: true,
    displayOrder: 29,
    includedFeatures: [
      "Multi-region deployment architecture with regional data pods",
      "Comprehensive security hardening (OWASP Top 10, SOC 2 alignment)",
      "Enterprise self-service admin portal with audit export",
      "Automated regression, performance, and chaos engineering test suite",
      "Dedicated engineering team handover and technical documentation"
    ],
    excludedFeatures: ["Cloud infrastructure billing (AWS/GCP/Azure)"]
  },
  {
    id: "large-ecom-eco-300000",
    name: "Large E-commerce Ecosystem",
    tagline: "Omnichannel digital commerce ecosystem spanning web, mobile responsive, warehouse dispatch, and supplier networks.",
    price: 3e5,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Digital Commerce",
    pagesDescription: "Full omnichannel commerce network with fulfillment engine",
    revisions: "Phased milestone delivery",
    deliveryTime: "8 \u2013 12 months",
    idealClient: "High-volume international retailers, distribution conglomerates",
    description: "Enterprise commerce engine engineered to withstand flash-sale peak traffic, coordinate multiple dispatch hubs, and process complex high-SKU catalogs.",
    active: true,
    displayOrder: 30,
    includedFeatures: [
      "High-throughput checkout engine engineered for 100k+ concurrent shoppers",
      "Multi-warehouse inventory allocation and dispatch optimizer",
      "Automated returns, RMA, and warranty management portal",
      "Supplier EDI and inventory ingestion pipelines",
      "120 days post-launch dedicated hypercare warranty"
    ],
    excludedFeatures: ["Physical warehouse conveyance equipment"]
  },
  {
    id: "adv-commerce-net-400000",
    name: "Advanced Digital Commerce Network",
    tagline: "Multi-country B2B/B2C commerce network with localized tax engines, currency settlement, and fulfillment tracking.",
    price: 4e5,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Digital Commerce",
    pagesDescription: "Global commerce network across 20+ national markets",
    revisions: "Phased milestone delivery",
    deliveryTime: "9 \u2013 14 months",
    idealClient: "Multinational consumer brands, international trade operators",
    description: "Global commerce architecture featuring country-specific storefronts, localized VAT/tax calculations, regional fulfillment routing, and currency ledgers.",
    active: true,
    displayOrder: 31,
    includedFeatures: [
      "Multi-jurisdiction tax and regulatory compliance rules engine",
      "Regional supplier and 3PL fulfillment synchronization",
      "Dynamic currency conversion and localized payment rail instructions",
      "Enterprise fraud prevention and risk profiling ledger",
      "Full source code ownership with zero recurring vendor lock-in"
    ],
    excludedFeatures: ["Third-party legal filings in international territories"]
  },
  {
    id: "ent-tech-platform-500000",
    name: "Enterprise Technology Platform",
    tagline: "Foundational digital operating platform unifying customer portals, internal operations, and automated analytics.",
    price: 5e5,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    isFeatured: true,
    category: "Enterprise Infrastructure",
    pagesDescription: "Core enterprise digital backbone across all company operations",
    revisions: "Agile enterprise steering committee",
    deliveryTime: "10 \u2013 15 months",
    idealClient: "Large-scale international institutions, telecommunications, infrastructure operators",
    description: "Consolidates all digital touchpoints into a unified, secure, high-availability architecture with zero-trust security policies and scalable microservices.",
    active: true,
    displayOrder: 32,
    includedFeatures: [
      "Zero-trust security architecture with granular authorization policies",
      "Distributed microservice backend with message queue decoupling",
      "Executive BI dashboard with real-time streaming analytics",
      "Automated disaster recovery and multi-region failover protocols",
      "6 months dedicated post-launch operational support & maintenance"
    ],
    excludedFeatures: ["Physical server hardware hosting infrastructure"]
  },
  {
    id: "multi-platform-eco-600000",
    name: "Multi-Platform Business Ecosystem",
    tagline: "Comprehensive business ecosystem spanning web, responsive customer portals, partner APIs, and operational command suites.",
    price: 6e5,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Enterprise Ecosystem",
    pagesDescription: "Multi-channel digital infrastructure spanning 5+ dedicated portals",
    revisions: "Agile steering committee",
    deliveryTime: "12 \u2013 16 months",
    idealClient: "Aviation, national transport, healthcare conglomerates, energy consortiums",
    description: "Unifies disparate organizational ecosystems into a high-concurrency, auditable digital platform with multi-tenant sub-organizations and public API gateways.",
    active: true,
    displayOrder: 33,
    includedFeatures: [
      "Five interconnected stakeholder portals with shared authentication core",
      "Public developer API gateway with rate limiting and documentation",
      "Real-time event streaming and operational telemetry dashboards",
      "Comprehensive vulnerability assessment and penetration test remediation",
      "Dedicated technical account director and architectural lead"
    ],
    excludedFeatures: ["Government regulatory licensing fees"]
  },
  {
    id: "large-infra-750000",
    name: "Large-Scale Digital Infrastructure Platform",
    tagline: "Mission-critical digital infrastructure engineered for millions of users with fault-tolerant distributed resilience.",
    price: 75e4,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Mission-Critical Infrastructure",
    pagesDescription: "Fault-tolerant distributed software grid with multi-cloud redundancy",
    revisions: "Agile sprint milestones",
    deliveryTime: "12 \u2013 18 months",
    idealClient: "Sovereign entities, public utilities, massive financial institutions",
    description: "Built to withstand catastrophic network interruptions and extreme traffic surges. Implements multi-cloud failover, cryptographic audit trails, and strict data isolation.",
    active: true,
    displayOrder: 34,
    includedFeatures: [
      "Multi-cloud active-active architecture (AWS, GCP, Azure redundancy ready)",
      "Cryptographically signed immutable audit trail for forensic compliance",
      "Sub-second query performance across hundred-million-record datasets",
      "Comprehensive disaster recovery drills and architectural certification",
      "9 months dedicated hypercare technical assurance"
    ],
    excludedFeatures: ["Direct telecommunication satellite spectrum rights"]
  },
  {
    id: "global-tech-eco-900000",
    name: "Global Business Technology Ecosystem",
    tagline: "Worldwide digital infrastructure operating across continents with localized edge computing and regulatory compliance.",
    price: 9e5,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Global Infrastructure",
    pagesDescription: "Continental edge infrastructure with regional compliance engines",
    revisions: "Agile enterprise steering",
    deliveryTime: "14 \u2013 20 months",
    idealClient: "Multinational banking groups, global logistics consortiums",
    description: "Complete continental software grid supporting global trade, multi-currency treasury reconciliation, localized data governance, and uninterrupted service delivery.",
    active: true,
    displayOrder: 35,
    includedFeatures: [
      "Edge-localized computing architecture for minimal latency worldwide",
      "Multi-jurisdiction privacy compliance (GDPR, CCPA, APPI, LGPD ready)",
      "Corporate treasury manual wire and bank settlement automation ledger",
      "Automated disaster recovery with zero data-loss guarantee (RPO 0)",
      "12 months dedicated enterprise engineering support retainer"
    ],
    excludedFeatures: ["Inter-bank settlement clearing license"]
  },
  // --- SEVEN-FIGURE MILLION-DOLLAR ENTERPRISE PLATFORMS ---
  {
    id: "million-dollar-1000000",
    name: "Million-Dollar Enterprise Platform",
    tagline: "Monumental digital operating ecosystem designed to power an entire international corporate industry standard.",
    price: 1e6,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    isFeatured: true,
    category: "Flagship Enterprise",
    pagesDescription: "Comprehensive global digital operating system tailored from ground up",
    revisions: "Dedicated continuous agile enterprise steering",
    deliveryTime: "16 \u2013 24 months (multi-phase deployment)",
    idealClient: "Global Fortune 500 enterprises, national digital transformations, industry monopolists",
    description: "A landmark digital platform engineered to unify an entire enterprise. Includes comprehensive strategic scoping, bespoke UI/UX research, distributed resilient microservices, custom security hardening, and dedicated multi-disciplinary engineering squads.",
    active: true,
    displayOrder: 36,
    includedFeatures: [
      "Bespoke architectural engineering with zero proprietary vendor lock-in",
      "Distributed multi-cloud infrastructure with automated self-healing pods",
      "Military-grade encryption and zero-trust security matrix",
      "Multi-portal unified interface suite for millions of concurrent actors",
      "Automated continuous delivery pipelines with comprehensive automated testing",
      "1 Year dedicated senior engineering team hypercare and round-the-clock warranty"
    ],
    excludedFeatures: ["Hardware server physical procurement & regulatory filing costs"],
    enterpriseOverview: {
      modules: [
        "Global Customer Facing Experience Layer",
        "Partner & Vendor Extranet Portal",
        "Executive Real-Time Telemetry & BI Command Room",
        "Regulatory Compliance & Cryptographic Audit Ledger",
        "Automated Workflow & Process Automation Engine",
        "Public Developer Ecosystem & High-Throughput API Gateway"
      ],
      securityAndScalability: "Engineered for 99.999% uptime with multi-region active-active deployment. Implements end-to-end encryption at rest and in transit, hardware security module (HSM) key rotation, and zero-trust mutual TLS inter-service communication.",
      infrastructurePlan: "Containerized microservices orchestrated via Kubernetes with automated horizontal pod autoscaling. Redundant database clustering with automated multi-region replication and sub-second disaster recovery.",
      implementationPhases: [
        "Phase 1: Enterprise Scoping, Stakeholder Discovery & Architecture Blueprints (Months 1\u20133)",
        "Phase 2: Core Data Platform & Foundation Infrastructure Build (Months 4\u20137)",
        "Phase 3: Stakeholder Portals & User Experience Construction (Months 8\u201313)",
        "Phase 4: API Integration, Security Hardening & Penetration Testing (Months 14\u201317)",
        "Phase 5: Staged Rollout, Pilot Testing & Global Production Launch (Months 18\u201324)"
      ],
      supportAndSLA: "Includes 12 months of dedicated senior engineering squad hypercare with guaranteed 15-minute response SLA for critical incidents, dedicated technical account director, and monthly executive reviews."
    }
  },
  {
    id: "intl-commerce-eco-1250000",
    name: "International Digital Commerce Ecosystem",
    tagline: "Massive global digital trade infrastructure connecting international suppliers, freight carriers, and consumer hubs.",
    price: 125e4,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Global Trade Infrastructure",
    pagesDescription: "Worldwide digital trade grid across 50+ countries",
    revisions: "Dedicated enterprise governance",
    deliveryTime: "18 \u2013 26 months",
    idealClient: "Global retail consortiums, maritime freight alliances, multinational marketplaces",
    description: "An international digital commerce grid connecting global producers, freight networks, customs brokers, and consumer storefronts with synchronized multi-currency settlement ledgers.",
    active: true,
    displayOrder: 37,
    includedFeatures: [
      "Global multi-currency transactional ledger with treasury reconciliation",
      "Real-time cargo tracking and supply chain event routing",
      "Customs clearance document automation across 50+ national authorities",
      "High-throughput distributed catalog handling millions of product records",
      "18 months dedicated enterprise engineering warranty and maintenance"
    ],
    excludedFeatures: ["Maritime insurance underwriting and port customs fees"],
    enterpriseOverview: {
      modules: [
        "Global Multi-Currency Commerce Engine",
        "Supply Chain & Cargo Tracking Grid",
        "Customs & Regulatory Automated Documentation",
        "Enterprise Dispute & Escrow Ledger",
        "Carrier & Warehouse Synchronization Protocol"
      ],
      securityAndScalability: "Distributed cloud pods deployed across 6 continents ensuring under 50ms latency globally with automated bank-grade transaction auditing.",
      infrastructurePlan: "Geo-distributed Kubernetes clusters with active database replication across AWS, Azure, and Google Cloud Platform.",
      implementationPhases: [
        "Phase 1: Global Trade Matrix Architecture & Compliance Design (Months 1\u20134)",
        "Phase 2: Ledger Core & Freight Network Integration (Months 5\u20139)",
        "Phase 3: Multi-Language Merchant & Buyer Portals (Months 10\u201315)",
        "Phase 4: End-to-End Testing & Security Certification (Months 16\u201319)",
        "Phase 5: Global Staged Rollout & Operational Handover (Months 20\u201326)"
      ],
      supportAndSLA: "18 Months 24/7 dedicated engineering coverage with 15-minute emergency SLA and quarterly on-site technical governance."
    }
  },
  {
    id: "global-ent-tech-1500000",
    name: "Global Enterprise Technology Network",
    tagline: "Integrated continental software infrastructure powering multi-national government or corporate ecosystems.",
    price: 15e5,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Sovereign & Enterprise",
    pagesDescription: "Sovereign-grade continental operating network with zero-trust defense",
    revisions: "Continuous agile steering",
    deliveryTime: "20 \u2013 30 months",
    idealClient: "Sovereign wealth funds, transnational utility alliances, aviation consortia",
    description: "High-security technological network built with sovereign-grade isolation, decentralized data pipelines, resilient disaster failover, and comprehensive compliance controls.",
    active: true,
    displayOrder: 38,
    includedFeatures: [
      "Zero-trust cryptographic security architecture with sovereign data isolation",
      "Real-time operational command centers with geo-spatial telemetry",
      "Decentralized event sourcing with cryptographically verified state machines",
      "Complete intellectual property handover with full developer documentation",
      "2 Years dedicated enterprise tier engineering support and evolution"
    ],
    excludedFeatures: ["Sovereign government operational regulatory clearances"],
    enterpriseOverview: {
      modules: [
        "Sovereign Data Isolation Layer",
        "Real-Time Geo-Spatial Command Center",
        "Decentralized Event State Machine",
        "Inter-Agency / Inter-Department Secure Mesh",
        "Automated Forensic Audit & Compliance Engine"
      ],
      securityAndScalability: "Isolated air-gapped deployment capability with post-quantum encryption compatibility and automated intrusion containment.",
      infrastructurePlan: "Multi-cloud sovereign infrastructure deployed in client-owned sovereign cloud accounts with full infrastructure-as-code automation.",
      implementationPhases: [
        "Phase 1: High-Security Threat Modeling & Architectural Specification (Months 1\u20135)",
        "Phase 2: Core Sovereign Mesh & Cryptographic Ledger Build (Months 6\u201312)",
        "Phase 3: Command Center & Stakeholder Experience Engineering (Months 13\u201318)",
        "Phase 4: Simulated Red-Team Penetration & Stress Testing (Months 19\u201323)",
        "Phase 5: Final Production Deployment & Enterprise Team Certification (Months 24\u201330)"
      ],
      supportAndSLA: "24 Months of continuous engineering hypercare with dedicated lead architects and dedicated incident response team."
    }
  },
  {
    id: "large-intl-eco-1750000",
    name: "Large-Scale International Digital Ecosystem",
    tagline: "Universal digital infrastructure interconnecting billions of records, millions of users, and diverse international industries.",
    price: 175e4,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    category: "Global Digital Backbone",
    pagesDescription: "Multi-industry digital backbone engineered for massive international scale",
    revisions: "Continuous enterprise governance",
    deliveryTime: "22 \u2013 32 months",
    idealClient: "International multi-industry conglomerates, global banking networks, supranational trade bodies",
    description: "Massive, multi-industry digital operating backbone connecting supply chains, banking settlement networks, consumer portals, and regulatory compliance authorities worldwide.",
    active: true,
    displayOrder: 39,
    includedFeatures: [
      "Multi-industry architecture unifying disparate commercial verticals",
      "High-speed transactional ledger processing tens of thousands of ops per second",
      "Automated global tax, regulatory, and privacy enforcement",
      "Comprehensive disaster-proof multi-cloud resilient mesh",
      "2 Years dedicated architectural team support and maintenance guarantee"
    ],
    excludedFeatures: ["Direct banking license procurement fees"],
    enterpriseOverview: {
      modules: [
        "Universal Multi-Industry Data Mesh",
        "Ultra-High-Throughput Transaction Ledger",
        "Global Automated Compliance Authority",
        "Consolidated Holding BI & AI Telemetry Engine",
        "Developer Platform with Multi-Tenant SDKs"
      ],
      securityAndScalability: "Engineered to process 50,000+ operations per second with sub-50ms latency and 99.999% SLA across 40 global edge regions.",
      infrastructurePlan: "Hybrid multi-cloud edge infrastructure with distributed caching, automated failover, and geographic data residency.",
      implementationPhases: [
        "Phase 1: Multi-Industry Scope & Enterprise Blueprints (Months 1\u20136)",
        "Phase 2: High-Throughput Core Platform Build (Months 7\u201314)",
        "Phase 3: Vertical-Specific Module Implementation (Months 15\u201322)",
        "Phase 4: Global Performance Optimization & Audit (Months 23\u201327)",
        "Phase 5: Staged Worldwide Launch & Institutional Handover (Months 28\u201332)"
      ],
      supportAndSLA: "24 Months dedicated senior engineering squad with 10-minute critical response SLA and dedicated Chief Technology Architect."
    }
  },
  {
    id: "ultimate-global-2000000",
    name: "Ultimate Global Digital Platform",
    tagline: "The pinnacle of global web engineering \u2014 a fully bespoke, sovereign-grade digital empire platform engineered without compromise.",
    price: 2e6,
    isStartingAt: true,
    tier: "enterprise",
    isEnterprise: true,
    isFeatured: true,
    category: "Pinnacle Enterprise",
    pagesDescription: "Monumental global digital operating system uniting global industries",
    revisions: "Dedicated executive agile steering & continuous evolution",
    deliveryTime: "24 \u2013 36 months (custom multi-phase roadmap)",
    idealClient: "Global Fortune 100 leaders, sovereign states, transnational conglomerates building world-standard digital platforms",
    description: "The Ultimate Global Digital Platform is our most ambitious enterprise engineering engagement. Tailor-built for organizations operating at the highest tier of international commerce, digital infrastructure, or governance. It integrates bespoke responsive frontend design, distributed microservices, multi-region database clustering, automated regulatory adherence, zero-trust security architecture, and end-to-end operational dashboards. Delivered with 100% intellectual property ownership, zero vendor lock-in, and a dedicated 24-month multi-disciplinary engineering hypercare squad.",
    active: true,
    displayOrder: 40,
    includedFeatures: [
      "Bespoke multi-portal architecture spanning customer web, vendor hubs, executive command centers, and public developer APIs",
      "Multi-cloud active-active infrastructure engineered for 99.999% availability with automated cross-continent failover",
      "Zero-trust security architecture, military-grade encryption, and automated cryptographic audit ledger",
      "Sub-second query performance across hundred-million-record distributed datasets",
      "Automated global privacy and trade compliance rules engine (GDPR, CCPA, SOC 2, ISO 27001 aligned)",
      "100% source code ownership, complete architecture blueprints, and automated CI/CD pipelines",
      "24 Months of dedicated elite engineering squad support with 15-minute emergency SLA and quarterly on-site reviews"
    ],
    excludedFeatures: [
      "Physical data center real estate acquisition and hardware procurement",
      "Third-party cloud infrastructure hosting service bills",
      "Government regulatory filing and legal licensing fees"
    ],
    enterpriseOverview: {
      modules: [
        "Global Customer Facing Experience Suite (Web, Tablet & Mobile Responsive)",
        "Enterprise Partner, Supplier & Vendor B2B Extranet",
        "Executive Real-Time Telemetry & Operations Command Room",
        "High-Throughput Global Financial & Settlement Ledger",
        "Cryptographic Compliance, KYC & Regulatory Audit Vault",
        "Public Developer Ecosystem, Webhooks & Open API Gateway",
        "Automated Process Orchestration & AI Telemetry Engine"
      ],
      securityAndScalability: "Engineered from inception for 99.999% availability with zero-point-of-failure multi-region redundancy. Implements post-quantum compatible cryptographic algorithms, hardware-backed key management (HSM), automated intrusion detection and container isolation, and rigorous zero-trust mutual TLS inter-service authentication.",
      infrastructurePlan: "Distributed Kubernetes clusters deployed across multi-cloud regions (AWS, Google Cloud, and Azure) with automated horizontal pod autoscaling, geo-DNS routing, and sub-second disaster recovery failover (RPO 0, RTO < 60s).",
      implementationPhases: [
        "Phase 1: Enterprise Architectural Discovery, Threat Modeling & Global Scoping (Months 1\u20136)",
        "Phase 2: Core Data Engine, Cryptographic Ledger & Multi-Cloud Mesh Construction (Months 7\u201313)",
        "Phase 3: Stakeholder Portals, Executive Command Suite & Mobile Web Architecture (Months 14\u201320)",
        "Phase 4: Rigorous Penetration Testing, Chaos Engineering & Performance Benchmarking (Months 21\u201325)",
        "Phase 5: Multi-Stage Global Pilot, Production Cutover & Institutional Team Handover (Months 26\u201336)"
      ],
      supportAndSLA: "Includes 24 continuous months of dedicated senior engineering squad hypercare with guaranteed 15-minute response SLA for critical incidents, dedicated Chief Solutions Architect, and continuous operational advisory."
    }
  }
];
var initialPortfolioItems = [
  {
    id: "demo-aurora-logistics",
    title: "Apex Freight & Logistics Portal",
    category: "business",
    description: "A multi-regional corporate web presence for an international freight and customs forwarding provider. Features fleet specifications, interactive route calculators, and quote request workflows.",
    keyFeatures: ["Interactive Route Matrix", "Instant Quote Calculator", "Multi-Office Directory", "Modern Industrial Aesthetics"],
    demoType: "live_demo",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80",
    tags: ["Corporate", "Logistics", "Enterprise"],
    isSample: true
  },
  {
    id: "demo-lumina-boutique",
    title: "Lumina Artisan Goods \u2014 E-Commerce Showcase",
    category: "ecommerce",
    description: "A minimal, editorial e-commerce experience designed for lifestyle goods. Includes category filtering, slide-out cart drawer, and custom bank transfer checkout instructions.",
    keyFeatures: ["Dynamic Cart Drawer", "Product Variant Selector", "Manual Wire Transfer Modal", "Lookbook Gallery"],
    demoType: "live_demo",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80",
    tags: ["E-Commerce", "Retail", "Minimalist"],
    isSample: true
  },
  {
    id: "demo-vantage-realty",
    title: "Vantage Meridian Luxury Real Estate",
    category: "real_estate",
    description: "A high-aesthetic property showcase demonstrating luxury residential estates with neighborhood guides, floor plan views, and private agent tour bookings.",
    keyFeatures: ["Interactive Property Filters", "Floorplan Inspection Tool", "VIP Showing Scheduler", "Virtual Tour Embeds"],
    demoType: "live_demo",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    tags: ["Real Estate", "Luxury", "High-Impact"],
    isSample: true
  },
  {
    id: "demo-saffron-bistro",
    title: "Saffron & Salt Culinary Atelier",
    category: "restaurants",
    description: "Interactive restaurant concept presenting tasting menus, sommelier pairings, private dining requests, and chef bios with rich tactile styling.",
    keyFeatures: ["Seasonal Digital Menu", "Private Dining Reservation Form", "Chef Note Journal", "Dietary Filter Badges"],
    demoType: "live_demo",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    tags: ["Hospitality", "Dining", "Reservations"],
    isSample: true
  },
  {
    id: "demo-novus-health",
    title: "Novus Premier Medical & Wellness Clinic",
    category: "services",
    description: "Specialist medical practice website with practitioner credentials, patient intake guidelines, accepted insurance directory, and confidential consultation requests.",
    keyFeatures: ["Practitioner Roster", "Patient Intake Guidelines", "Treatment Directory", "Secure Consultation Form"],
    demoType: "live_demo",
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80",
    tags: ["Healthcare", "Services", "Trust-Centered"],
    isSample: true
  },
  {
    id: "demo-strata-metrics",
    title: "Strata Cloud Operations Platform MVP",
    category: "custom",
    description: "Demonstration of a custom React web app dashboard with telemetry charts, team role permissions, audit trails, and data export facilities.",
    keyFeatures: ["Role-Based Layout", "Data Visualization", "Audit Trail UI", "Custom Filter Engine"],
    demoType: "live_demo",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
    tags: ["Web Application", "SaaS MVP", "Dashboard"],
    isSample: true
  }
];
var initialPaymentMethods = [
  {
    id: "askari-bank",
    title: "Askari Bank Account Transfer",
    type: "bank_transfer",
    bankOrProviderName: "Askari Bank Limited",
    accountHolderName: "GlobalWeb Studio (Pvt.) Ltd.",
    accountNumberOrIban: "0123-098765432101",
    swiftBicOrRouting: "ASCPPKKAXXX",
    branchName: "Corporate & Commercial Banking Branch",
    supportedCurrencies: ["USD", "PKR", "EUR", "GBP"],
    instructions: [
      "Log into your Askari Bank mobile app, internet banking portal, or visit any Askari Bank branch.",
      "Select Transfer to Askari Account / Other Bank Transfer.",
      "Enter the exact Account / IBAN number specified above.",
      "CRUCIAL: In the Payment Purpose / Remarks field, enter your EXACT Order Reference number (e.g. GWS-2026-XXXXX).",
      "Confirm the transaction and save or screenshot the official PDF receipt / transaction confirmation.",
      "Return to this website and upload your transaction receipt in the Payment Proof form."
    ],
    referenceNote: "Always quote your Order Reference in the bank transaction narration.",
    enabled: true,
    displayOrder: 1
  },
  {
    id: "wire-transfer",
    title: "International Wire / Other Bank Transfer",
    type: "other_bank",
    bankOrProviderName: "Standard Chartered / International Correspondent Bank",
    accountHolderName: "GlobalWeb Studio Treasury Services",
    accountNumberOrIban: "GB29 SCBL 0000 1234 5678 90",
    swiftBicOrRouting: "SCBLGB2LXXX",
    branchName: "International Corporate Treasury Desk",
    supportedCurrencies: ["USD", "EUR", "GBP"],
    instructions: [
      "Instruct your local bank or treasury to initiate an international wire / SEPA / SWIFT transfer.",
      "Ensure the beneficiary name matches exactly as listed above.",
      "Provide your bank with the SWIFT/BIC code and IBAN.",
      "Mandatory: Instruct the sending bank to include your Order Reference in Field 70 (Remittance Information / Narration).",
      "Wire transfers typically take 1\u20133 business days to clear depending on correspondent banks.",
      "Upload the official wire confirmation slip once dispatched."
    ],
    referenceNote: "Bank wire reference field must carry your GWS Order Reference.",
    enabled: true,
    displayOrder: 2
  },
  {
    id: "international-remittance",
    title: "International Money Transfer (Wise, Remitly, Western Union)",
    type: "international_transfer",
    bankOrProviderName: "Wise / Remitly / Western Union / Ria",
    accountHolderName: "GlobalWeb Studio Operations",
    accountNumberOrIban: "wise.account@globalwebstudio.com / IBAN as provided",
    swiftBicOrRouting: "TRWIBEBB",
    branchName: "Digital Remittance & Cross-Border Desk",
    supportedCurrencies: ["USD", "CAD", "AUD", "EUR", "GBP"],
    instructions: [
      "Open your Wise, Remitly, or preferred transfer service application.",
      "Select Send Money and choose the exact currency of your order.",
      "Input the recipient details provided above.",
      "Ensure the recipient receives the exact invoiced package total in full (sender covers provider transfer fees).",
      "Enter your Order Reference in the transfer note / reference section.",
      "Save the transfer receipt showing the MTCN or Transfer Reference number.",
      "Upload the receipt through our secure proof submission portal."
    ],
    referenceNote: "Enter the provider MTCN or Transaction ID when uploading proof.",
    enabled: true,
    displayOrder: 3
  }
];
var initialCashbackPromoSettings = {
  enabled: false,
  legalTermsAcknowledged: false,
  currentWeekBoundaryStart: "2026-10-12T00:00:00.000Z",
  currentWeekBoundaryEnd: "2026-10-19T00:00:00.000Z",
  timezone: "UTC",
  cashbackPercentage: 50,
  maxAwardPerWinner: 350,
  totalWeeklyBudget: 1e3,
  allowDualWinner: false,
  publishedTerms: `GlobalWeb Studio Weekly Client Appreciation & Cashback Promotion (Provisional Terms):
1. Eligibility: Open exclusively to clients who have ordered a website package within the specified weekly calendar boundary (Monday 00:00:00 UTC through following Monday 00:00:00 UTC) whose payment has been strictly reviewed and manually verified by our finance team before the week closes.
2. Award A (Verifiable Random Selection): One eligible client order selected through an auditable server-side pseudorandom draw mechanism.
3. Award B (Top Project Award): The eligible client with the highest qualifying single project value within the same weekly boundary.
4. Calculation: Cashback is calculated at 50% of the qualifying order base price, capped at $350 per winner. Total combined weekly cashback will never exceed the configured studio budget of $1,000.
5. Verification & Payout: No automatic payouts occur. Following admin review and publication, cashback amounts are credited or transferred manually via the original payment rail within 7 business days.
6. Legal Notice: This promotion is provisional and subject to local promotional contest laws. The promotion remains inactive until formally toggled and authorized by studio ownership.`
};

// server/storage.ts
var DATA_DIR = path.resolve(process.cwd(), "data");
var DB_FILE = path.join(DATA_DIR, "store.json");
var PRIVATE_UPLOADS_DIR = path.resolve(process.cwd(), "private_uploads");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PRIVATE_UPLOADS_DIR)) {
  fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
}
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
}
var defaultSalt = "gws_secure_salt_2026";
var defaultAdminHash = hashPassword("Admin@GlobalWeb2026!", defaultSalt);
var defaultAdminUser = {
  id: "admin-master-1",
  email: "admin@globalwebstudio.com",
  name: "Studio Finance Director",
  passwordHash: defaultAdminHash,
  salt: defaultSalt,
  role: "super_admin"
};
function getInitialData() {
  return {
    packages: initialPackages,
    portfolio: initialPortfolioItems,
    paymentMethods: initialPaymentMethods,
    settings: initialAgencySettings,
    cashbackSettings: initialCashbackPromoSettings,
    orders: [],
    auditLogs: [
      {
        id: `audit-${Date.now()}-init`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        action: "SYSTEM_INITIALIZED",
        actor: "system",
        targetType: "settings",
        targetId: "system",
        details: "GlobalWeb Studio core database initialized with catalog ($80 - $2,000,000) and payment methods."
      }
    ],
    promoDraws: [],
    contactInquiries: [],
    adminUsers: [defaultAdminUser],
    customRequests: [],
    quotations: [],
    notifications: []
  };
}
var Store = class {
  constructor() {
    this.data = this.load();
  }
  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        let loadedPackages = parsed.packages || initialPackages;
        if (!loadedPackages || loadedPackages.length < 10) {
          loadedPackages = initialPackages;
        }
        return {
          packages: loadedPackages,
          portfolio: parsed.portfolio || initialPortfolioItems,
          paymentMethods: parsed.paymentMethods || initialPaymentMethods,
          settings: { ...initialAgencySettings, ...parsed.settings || {} },
          cashbackSettings: parsed.cashbackSettings || initialCashbackPromoSettings,
          orders: parsed.orders || [],
          auditLogs: parsed.auditLogs || [],
          promoDraws: parsed.promoDraws || [],
          contactInquiries: parsed.contactInquiries || [],
          adminUsers: parsed.adminUsers && parsed.adminUsers.length > 0 ? parsed.adminUsers : [defaultAdminUser],
          customRequests: parsed.customRequests || [],
          quotations: parsed.quotations || [],
          notifications: parsed.notifications || []
        };
      }
    } catch (err) {
      console.error("Failed to load store, initializing fresh data:", err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }
  saveData(dataToSave) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save store to disk:", err);
    }
  }
  save() {
    this.saveData(this.data);
  }
  // Getters
  getPackages() {
    return [...this.data.packages].sort((a, b) => a.price - b.price);
  }
  getPortfolio() {
    return this.data.portfolio;
  }
  getPaymentMethods() {
    return this.data.paymentMethods;
  }
  getSettings() {
    return this.data.settings;
  }
  getCashbackSettings() {
    return this.data.cashbackSettings;
  }
  getOrders() {
    return this.data.orders;
  }
  getAuditLogs() {
    return this.data.auditLogs;
  }
  getPromoDraws() {
    return this.data.promoDraws;
  }
  getContactInquiries() {
    return this.data.contactInquiries;
  }
  getAdminUsers() {
    return this.data.adminUsers;
  }
  getCustomRequests() {
    return this.data.customRequests;
  }
  getQuotations() {
    return this.data.quotations;
  }
  getNotifications() {
    return this.data.notifications;
  }
  // Modifiers
  setPackages(packages) {
    this.data.packages = packages;
    this.save();
  }
  setPortfolio(portfolio) {
    this.data.portfolio = portfolio;
    this.save();
  }
  setPaymentMethods(methods) {
    this.data.paymentMethods = methods;
    this.save();
  }
  setSettings(settings) {
    this.data.settings = settings;
    this.save();
  }
  setCashbackSettings(settings) {
    this.data.cashbackSettings = settings;
    this.save();
  }
  addOrder(order) {
    this.data.orders.unshift(order);
    this.save();
  }
  updateOrder(orderRef, updater) {
    const order = this.data.orders.find((o) => o.orderRef === orderRef);
    if (!order) return null;
    updater(order);
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    return order;
  }
  addAuditLog(entry) {
    const log = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...entry
    };
    this.data.auditLogs.unshift(log);
    this.save();
  }
  addPromoDraw(draw) {
    this.data.promoDraws.unshift(draw);
    this.save();
  }
  updatePromoDraw(id, updater) {
    const draw = this.data.promoDraws.find((d) => d.id === id);
    if (!draw) return null;
    updater(draw);
    this.save();
    return draw;
  }
  addContactInquiry(inquiry) {
    this.data.contactInquiries.unshift(inquiry);
    this.save();
  }
  updateContactInquiryStatus(id, status) {
    const inquiry = this.data.contactInquiries.find((i) => i.id === id);
    if (inquiry) {
      inquiry.status = status;
      this.save();
    }
  }
  // Custom Project Requests
  addCustomRequest(request) {
    this.data.customRequests.unshift(request);
    this.save();
  }
  updateCustomRequest(requestId, updater) {
    const req = this.data.customRequests.find((r) => r.requestId === requestId);
    if (!req) return null;
    updater(req);
    req.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    return req;
  }
  // Quotations
  addQuotation(quotation) {
    this.data.quotations.unshift(quotation);
    this.save();
  }
  updateQuotation(quotationId, updater) {
    const quot = this.data.quotations.find((q) => q.quotationId === quotationId);
    if (!quot) return null;
    updater(quot);
    this.save();
    return quot;
  }
  // Notifications
  addNotification(notification) {
    const notif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      read: false,
      ...notification
    };
    this.data.notifications.unshift(notif);
    this.save();
  }
  markNotificationAsRead(id) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }
  updateAdminPassword(email, newPasswordPlain) {
    const user = this.data.adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    const newSalt = crypto.randomBytes(16).toString("hex");
    user.salt = newSalt;
    user.passwordHash = hashPassword(newPasswordPlain, newSalt);
    this.save();
    return true;
  }
};
var db = new Store();

// server/auth.ts
import crypto2 from "crypto";
var sessions = /* @__PURE__ */ new Map();
var SESSION_DURATION_MS = 12 * 60 * 60 * 1e3;
function loginAdmin(email, passwordPlain) {
  if (!email || !passwordPlain) {
    return { success: false, error: "Email and password are required." };
  }
  const users = db.getAdminUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return { success: false, error: "Invalid administrative credentials." };
  }
  const computedHash = hashPassword(passwordPlain, user.salt);
  if (computedHash !== user.passwordHash) {
    return { success: false, error: "Invalid administrative credentials." };
  }
  const token = crypto2.randomBytes(32).toString("hex");
  const now = Date.now();
  const session = {
    token,
    adminId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS
  };
  sessions.set(token, session);
  db.addAuditLog({
    action: "ADMIN_LOGIN_SUCCESS",
    actor: user.email,
    targetType: "settings",
    targetId: user.id,
    details: `Admin authenticated successfully from session token [${token.substring(0, 8)}...]`
  });
  return { success: true, session };
}
function verifyAdminSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}
function logoutAdmin(token) {
  const session = sessions.get(token);
  if (session) {
    db.addAuditLog({
      action: "ADMIN_LOGOUT",
      actor: session.email,
      targetType: "settings",
      targetId: session.adminId,
      details: "Admin logged out securely."
    });
    sessions.delete(token);
    return true;
  }
  return false;
}

// server/routes.ts
var apiRouter = express.Router();
var rateLimits = /* @__PURE__ */ new Map();
function rateLimiter(limit, windowMs) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const current = rateLimits.get(ip);
    if (!current || now > current.resetTime) {
      rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    if (current.count >= limit) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
    }
    current.count++;
    next();
  };
}
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRIVATE_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto3.randomBytes(12).toString("hex");
    const safeExt = path2.extname(file.originalname).toLowerCase();
    cb(null, `proof-${Date.now()}-${randomHex}${safeExt}`);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "application/pdf", "image/jpg"];
    const safeExts = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path2.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) && safeExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format. Only JPG, PNG, and PDF receipts are accepted."));
    }
  }
});
function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  const session = verifyAdminSession(token);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized: Administrative authentication required." });
  }
  req.admin = session;
  next();
}
apiRouter.get("/config", (req, res) => {
  const settings = db.getSettings();
  const packages = db.getPackages().filter((p) => p.active);
  const paymentMethods = db.getPaymentMethods().filter((m) => m.enabled);
  const promo = db.getCashbackSettings();
  res.json({
    settings,
    packages,
    paymentMethods,
    cashbackPromo: {
      enabled: promo.enabled,
      currentWeekBoundaryStart: promo.currentWeekBoundaryStart,
      currentWeekBoundaryEnd: promo.currentWeekBoundaryEnd,
      timezone: promo.timezone,
      cashbackPercentage: promo.cashbackPercentage,
      maxAwardPerWinner: promo.maxAwardPerWinner,
      totalWeeklyBudget: promo.totalWeeklyBudget,
      publishedTerms: promo.publishedTerms
    }
  });
});
apiRouter.get("/packages", (req, res) => {
  res.json(db.getPackages());
});
apiRouter.get("/portfolio", (req, res) => {
  res.json(db.getPortfolio());
});
apiRouter.post("/contact", rateLimiter(5, 60 * 1e3), (req, res) => {
  const { name, email, country, businessType, serviceRequired, budgetRange, projectDescription } = req.body;
  if (!name || !email || !projectDescription) {
    return res.status(400).json({ error: "Name, email, and project description are required." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  const inquiry = {
    id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().toLowerCase().slice(0, 100),
    country: String(country || "Not specified").trim().slice(0, 50),
    businessType: String(businessType || "General").trim().slice(0, 50),
    serviceRequired: String(serviceRequired || "Website Development").trim().slice(0, 50),
    budgetRange: String(budgetRange || "Not specified").trim().slice(0, 50),
    projectDescription: String(projectDescription).trim().slice(0, 3e3),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "new"
  };
  db.addContactInquiry(inquiry);
  db.addAuditLog({
    action: "CONTACT_INQUIRY_RECEIVED",
    actor: inquiry.email,
    targetType: "settings",
    targetId: inquiry.id,
    details: `Inquiry submitted by ${inquiry.name} (${inquiry.email}) for ${inquiry.serviceRequired}`
  });
  res.status(201).json({ success: true, message: "Inquiry received. A senior engineer will respond shortly." });
});
function generateUniqueOrderRef() {
  const prefix = db.getSettings().orderPrefix || "GWS";
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "";
  let attempts = 0;
  const existingRefs = new Set(db.getOrders().map((o) => o.orderRef));
  do {
    let randomPart = "";
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    ref = `${prefix}-${year}-${randomPart}`;
    attempts++;
  } while (existingRefs.has(ref) && attempts < 100);
  return ref;
}
apiRouter.post("/orders", rateLimiter(10, 60 * 1e3), (req, res) => {
  const {
    customerName,
    email,
    country,
    businessName,
    packageId,
    projectRequirements,
    requiredFeatures,
    preferredDeliveryDate,
    additionalNotes
  } = req.body;
  if (!customerName || !email || !country || !packageId || !projectRequirements) {
    return res.status(400).json({ error: "Please fill in all mandatory order details." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address for order notifications." });
  }
  const pkg = db.getPackages().find((p) => p.id === packageId && p.active);
  if (!pkg) {
    return res.status(400).json({ error: "The selected website package is unavailable or invalid." });
  }
  const orderRef = generateUniqueOrderRef();
  const clientAccessToken = crypto3.randomBytes(24).toString("hex");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const newOrder = {
    id: `ord-${Date.now()}-${crypto3.randomBytes(4).toString("hex")}`,
    orderRef,
    customerName: String(customerName).trim().slice(0, 100),
    email: String(email).trim().toLowerCase().slice(0, 120),
    country: String(country).trim().slice(0, 60),
    businessName: businessName ? String(businessName).trim().slice(0, 100) : void 0,
    packageId: pkg.id,
    packageName: pkg.name,
    packagePrice: pkg.price,
    currency: "USD",
    projectRequirements: String(projectRequirements).trim().slice(0, 5e3),
    requiredFeatures: Array.isArray(requiredFeatures) ? requiredFeatures.map((f) => String(f).slice(0, 100)) : [],
    preferredDeliveryDate: preferredDeliveryDate ? String(preferredDeliveryDate).slice(0, 50) : void 0,
    additionalNotes: additionalNotes ? String(additionalNotes).trim().slice(0, 2e3) : void 0,
    createdAt: now,
    updatedAt: now,
    status: "awaiting_payment",
    verificationStatus: "none",
    proofs: [],
    totalPaid: 0,
    clientAccessToken
  };
  db.addOrder(newOrder);
  db.addAuditLog({
    action: "ORDER_CREATED",
    actor: newOrder.email,
    targetType: "order",
    targetId: orderRef,
    details: `Order created for package "${pkg.name}" ($${pkg.price}). Status: awaiting_payment.`
  });
  res.status(201).json({
    success: true,
    orderRef: newOrder.orderRef,
    clientAccessToken,
    order: newOrder
  });
});
apiRouter.get("/orders/:orderRef", (req, res) => {
  const { orderRef } = req.params;
  const token = req.query.token || req.headers["x-order-token"];
  const emailQuery = req.query.email?.trim().toLowerCase();
  const adminToken = req.headers["x-admin-token"];
  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: "Order not found with the provided reference." });
  }
  const isAdmin = !!verifyAdminSession(adminToken);
  const isAuthorizedCustomer = token && token === order.clientAccessToken || emailQuery && emailQuery === order.email.toLowerCase();
  if (!isAdmin && !isAuthorizedCustomer) {
    return res.status(403).json({ error: "Access denied. Valid order access token or customer email required." });
  }
  const paymentMethods = db.getPaymentMethods().filter((m) => m.enabled);
  res.json({
    order,
    paymentMethods,
    agencySettings: db.getSettings()
  });
});
apiRouter.post(
  "/orders/:orderRef/proof",
  upload.single("proofFile"),
  (req, res) => {
    const { orderRef } = req.params;
    const {
      clientAccessToken,
      paymentMethodId,
      amountTransferred,
      currency,
      transferDate,
      transactionReference,
      customerNote
    } = req.body;
    const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
    if (!order) {
      if (req.file) fs2.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Order reference not found." });
    }
    const adminToken = req.headers["x-admin-token"];
    const isAdmin = !!verifyAdminSession(adminToken);
    const isOwner = clientAccessToken && clientAccessToken === order.clientAccessToken;
    if (!isAdmin && !isOwner) {
      if (req.file) fs2.unlinkSync(req.file.path);
      return res.status(403).json({ error: "Unauthorized to upload proof for this order." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Payment receipt file is required (JPG, PNG, or PDF)." });
    }
    const parsedAmount = parseFloat(amountTransferred);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      fs2.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Please enter a valid transferred amount greater than 0." });
    }
    if (!transactionReference || String(transactionReference).trim() === "") {
      fs2.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Bank transaction or remittance reference number is required." });
    }
    const proofId = `prf-${Date.now()}-${crypto3.randomBytes(4).toString("hex")}`;
    const newProof = {
      id: proofId,
      orderRef: order.orderRef,
      paymentMethodId: String(paymentMethodId || "bank_transfer"),
      amountTransferred: parsedAmount,
      currency: String(currency || "USD").toUpperCase(),
      transferDate: String(transferDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]),
      transactionReference: String(transactionReference).trim(),
      fileName: req.file.filename,
      fileOriginalName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      fileUrl: `/api/orders/${order.orderRef}/proof-file/${proofId}`,
      customerNote: customerNote ? String(customerNote).trim().slice(0, 500) : void 0,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      verificationStatus: "pending_review"
    };
    db.updateOrder(order.orderRef, (ord) => {
      ord.proofs.unshift(newProof);
      ord.activeProofId = newProof.id;
      ord.status = "proof_submitted";
      ord.verificationStatus = "pending_review";
    });
    db.addAuditLog({
      action: "PAYMENT_PROOF_SUBMITTED",
      actor: order.email,
      targetType: "proof",
      targetId: newProof.id,
      details: `Proof submitted for Order ${order.orderRef}. Amount: ${newProof.currency} ${newProof.amountTransferred}, TxRef: "${newProof.transactionReference}". Awaiting admin manual verification.`
    });
    res.status(201).json({
      success: true,
      message: "Proof Submitted \u2014 Awaiting Verification. Our finance team will verify the transfer against bank records.",
      proof: newProof,
      order: db.getOrders().find((o) => o.orderRef === order.orderRef)
    });
  }
);
apiRouter.get("/orders/:orderRef/proof-file/:proofId", (req, res) => {
  const { orderRef, proofId } = req.params;
  const token = req.query.token || req.headers["x-order-token"];
  const adminToken = req.headers["x-admin-token"];
  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }
  const isAdmin = !!verifyAdminSession(adminToken);
  const isOwner = token && token === order.clientAccessToken;
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: "Unauthorized. Only the order owner or studio finance admin can access payment proofs." });
  }
  const proof = order.proofs.find((p) => p.id === proofId);
  if (!proof) {
    return res.status(404).json({ error: "Payment proof document not found." });
  }
  const filePath = path2.join(PRIVATE_UPLOADS_DIR, proof.fileName);
  if (!fs2.existsSync(filePath)) {
    return res.status(404).json({ error: "Proof file no longer exists on private server storage." });
  }
  res.setHeader("Content-Type", proof.fileMimeType);
  res.setHeader("Content-Disposition", `inline; filename="${proof.fileOriginalName.replace(/"/g, "")}"`);
  res.sendFile(filePath);
});
apiRouter.post("/admin/login", (req, res) => {
  const { email, password } = req.body;
  const result = loginAdmin(email, password);
  if (!result.success || !result.session) {
    return res.status(401).json({ error: result.error || "Authentication failed." });
  }
  res.json({
    success: true,
    token: result.session.token,
    user: {
      id: result.session.adminId,
      email: result.session.email,
      name: result.session.name,
      role: result.session.role
    }
  });
});
apiRouter.post("/admin/logout", (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token) {
    logoutAdmin(token);
  }
  res.json({ success: true, message: "Logged out successfully." });
});
apiRouter.get("/admin/me", requireAdmin, (req, res) => {
  const admin = req.admin;
  res.json({ user: admin });
});
apiRouter.get("/admin/dashboard-stats", requireAdmin, (req, res) => {
  const orders = db.getOrders();
  const promo = db.getCashbackSettings();
  const draws = db.getPromoDraws();
  const totalOrders = orders.length;
  const awaitingPayment = orders.filter((o) => o.status === "awaiting_payment").length;
  const proofsAwaitingReview = orders.filter((o) => o.status === "proof_submitted" || o.verificationStatus === "pending_review").length;
  const verifiedPayments = orders.filter((o) => o.verificationStatus === "verified").length;
  const inProgress = orders.filter((o) => o.status === "in_progress" || o.status === "review_ready").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const refunded = orders.filter((o) => o.status === "refunded").length;
  const totalRevenueVerified = orders.filter((o) => o.verificationStatus === "verified").reduce((sum, o) => sum + (o.totalPaid || o.packagePrice), 0);
  const weekStart = new Date(promo.currentWeekBoundaryStart).getTime();
  const weekEnd = new Date(promo.currentWeekBoundaryEnd).getTime();
  const weeklyOrders = orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= weekStart && t < weekEnd && o.verificationStatus === "verified";
  });
  const weeklySalesVolume = weeklyOrders.reduce((sum, o) => sum + (o.totalPaid || o.packagePrice), 0);
  let cashbackLiabilities = 0;
  draws.forEach((d) => {
    if (d.isLocked) {
      if (d.randomDrawWinner && !d.payoutStatus.randomWinnerPaid) {
        cashbackLiabilities += d.randomDrawWinner.cashbackAwarded;
      }
      if (d.highestValueWinner && !d.payoutStatus.highestWinnerPaid) {
        cashbackLiabilities += d.highestValueWinner.cashbackAwarded;
      }
    }
  });
  res.json({
    totalOrders,
    awaitingPayment,
    proofsAwaitingReview,
    verifiedPayments,
    inProgress,
    completed,
    refunded,
    totalRevenueVerified,
    weeklySalesVolume,
    weeklyVerifiedCount: weeklyOrders.length,
    cashbackLiabilities,
    recentOrders: orders.slice(0, 8),
    recentAuditLogs: db.getAuditLogs().slice(0, 10)
  });
});
apiRouter.get("/admin/orders", requireAdmin, (req, res) => {
  res.json(db.getOrders());
});
apiRouter.post("/admin/orders/:orderRef/verify-proof", requireAdmin, (req, res) => {
  const { orderRef } = req.params;
  const { proofId, verifiedAmount, notes } = req.body;
  const admin = req.admin;
  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) return res.status(404).json({ error: "Order not found." });
  const proof = order.proofs.find((p) => p.id === proofId);
  if (!proof) return res.status(404).json({ error: "Proof not found." });
  if (proof.verificationStatus === "verified") {
    return res.status(400).json({ error: "This payment proof has already been verified." });
  }
  const finalAmount = verifiedAmount !== void 0 ? parseFloat(verifiedAmount) : proof.amountTransferred;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  db.updateOrder(order.orderRef, (ord) => {
    const targetProof = ord.proofs.find((p) => p.id === proofId);
    if (targetProof) {
      targetProof.verificationStatus = "verified";
      targetProof.verifiedAt = now;
      targetProof.verifiedBy = admin.email;
    }
    ord.verificationStatus = "verified";
    ord.status = "payment_verified";
    ord.totalPaid = finalAmount;
  });
  db.addAuditLog({
    action: "PAYMENT_VERIFIED",
    actor: admin.email,
    targetType: "order",
    targetId: order.orderRef,
    details: `Manual bank payment verified by ${admin.name}. Verified amount: $${finalAmount}. Notes: ${notes || "Matches bank account statement."}`
  });
  res.json({
    success: true,
    message: "Payment proof verified successfully. Order marked as Payment Verified.",
    order: db.getOrders().find((o) => o.orderRef === order.orderRef)
  });
});
apiRouter.post("/admin/orders/:orderRef/reject-proof", requireAdmin, (req, res) => {
  const { orderRef } = req.params;
  const { proofId, rejectionReason, isCorrectionRequest } = req.body;
  const admin = req.admin;
  if (!rejectionReason || String(rejectionReason).trim() === "") {
    return res.status(400).json({ error: "Please specify the reason for rejection or correction request." });
  }
  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) return res.status(404).json({ error: "Order not found." });
  const newStatus = isCorrectionRequest ? "correction_requested" : "rejected";
  db.updateOrder(order.orderRef, (ord) => {
    const targetProof = ord.proofs.find((p) => p.id === proofId);
    if (targetProof) {
      targetProof.verificationStatus = newStatus;
      targetProof.rejectionReason = String(rejectionReason).trim();
    }
    ord.verificationStatus = newStatus;
    ord.status = "awaiting_payment";
  });
  db.addAuditLog({
    action: isCorrectionRequest ? "PROOF_CORRECTION_REQUESTED" : "PROOF_REJECTED",
    actor: admin.email,
    targetType: "order",
    targetId: order.orderRef,
    details: `Proof ${proofId} set to "${newStatus}" by ${admin.name}. Reason: "${rejectionReason}".`
  });
  res.json({
    success: true,
    message: isCorrectionRequest ? "Correction requested. Customer can now upload a corrected receipt." : "Payment proof rejected.",
    order: db.getOrders().find((o) => o.orderRef === order.orderRef)
  });
});
apiRouter.post("/admin/orders/:orderRef/update-project-status", requireAdmin, (req, res) => {
  const { orderRef } = req.params;
  const { newStatus, note } = req.body;
  const admin = req.admin;
  const validStatuses = ["awaiting_payment", "in_progress", "review_ready", "completed", "cancelled"];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ error: "Invalid project status provided." });
  }
  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) return res.status(404).json({ error: "Order not found." });
  const oldStatus = order.status;
  db.updateOrder(order.orderRef, (ord) => {
    ord.status = newStatus;
  });
  db.addAuditLog({
    action: "PROJECT_STATUS_UPDATED",
    actor: admin.email,
    targetType: "order",
    targetId: order.orderRef,
    details: `Status transitioned from "${oldStatus}" to "${newStatus}". Note: ${note || "Status updated by project lead."}`
  });
  res.json({
    success: true,
    message: `Project status updated to ${newStatus}.`,
    order: db.getOrders().find((o) => o.orderRef === order.orderRef)
  });
});
apiRouter.post("/admin/orders/:orderRef/record-refund", requireAdmin, (req, res) => {
  const { orderRef } = req.params;
  const { refundAmount, reason } = req.body;
  const admin = req.admin;
  const parsed = parseFloat(refundAmount);
  if (isNaN(parsed) || parsed <= 0) {
    return res.status(400).json({ error: "Please enter a valid refund amount." });
  }
  const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
  if (!order) return res.status(404).json({ error: "Order not found." });
  db.updateOrder(order.orderRef, (ord) => {
    ord.status = "refunded";
    ord.refundedAmount = (ord.refundedAmount || 0) + parsed;
  });
  db.addAuditLog({
    action: "PAYMENT_REFUNDED",
    actor: admin.email,
    targetType: "order",
    targetId: order.orderRef,
    details: `Refund of $${parsed} recorded by ${admin.name}. Reason: ${reason || "Customer requested cancellation."}`
  });
  res.json({
    success: true,
    message: `Refund of $${parsed} recorded successfully.`,
    order: db.getOrders().find((o) => o.orderRef === order.orderRef)
  });
});
apiRouter.put("/admin/packages", requireAdmin, (req, res) => {
  const { packages } = req.body;
  if (!Array.isArray(packages)) return res.status(400).json({ error: "Packages array is required." });
  db.setPackages(packages);
  db.addAuditLog({
    action: "PACKAGES_UPDATED",
    actor: req.admin.email,
    targetType: "package",
    targetId: "all",
    details: `Website packages updated. Count: ${packages.length}.`
  });
  res.json({ success: true, packages: db.getPackages() });
});
apiRouter.put("/admin/portfolio", requireAdmin, (req, res) => {
  const { portfolio } = req.body;
  if (!Array.isArray(portfolio)) return res.status(400).json({ error: "Portfolio array is required." });
  db.setPortfolio(portfolio);
  db.addAuditLog({
    action: "PORTFOLIO_UPDATED",
    actor: req.admin.email,
    targetType: "settings",
    targetId: "portfolio",
    details: `Portfolio showcases updated. Count: ${portfolio.length}.`
  });
  res.json({ success: true, portfolio: db.getPortfolio() });
});
apiRouter.put("/admin/payment-methods", requireAdmin, (req, res) => {
  const { paymentMethods } = req.body;
  if (!Array.isArray(paymentMethods)) return res.status(400).json({ error: "Payment methods array is required." });
  db.setPaymentMethods(paymentMethods);
  db.addAuditLog({
    action: "PAYMENT_METHODS_UPDATED",
    actor: req.admin.email,
    targetType: "payment_method",
    targetId: "all",
    details: "Bank transfer instructions and enabled methods updated by admin."
  });
  res.json({ success: true, paymentMethods: db.getPaymentMethods() });
});
apiRouter.put("/admin/settings", requireAdmin, (req, res) => {
  const { settings } = req.body;
  if (!settings) return res.status(400).json({ error: "Settings object is required." });
  db.setSettings(settings);
  db.addAuditLog({
    action: "AGENCY_SETTINGS_UPDATED",
    actor: req.admin.email,
    targetType: "settings",
    targetId: "agency",
    details: "Agency business details, contact information, and hours updated."
  });
  res.json({ success: true, settings: db.getSettings() });
});
apiRouter.get("/admin/cashback/config", requireAdmin, (req, res) => {
  res.json({
    settings: db.getCashbackSettings(),
    draws: db.getPromoDraws()
  });
});
apiRouter.put("/admin/cashback/config", requireAdmin, (req, res) => {
  const { cashbackSettings } = req.body;
  if (!cashbackSettings) return res.status(400).json({ error: "Cashback settings object is required." });
  db.setCashbackSettings(cashbackSettings);
  db.addAuditLog({
    action: "CASHBACK_CONFIG_UPDATED",
    actor: req.admin.email,
    targetType: "promo",
    targetId: "config",
    details: `Cashback promotion settings updated. Enabled: ${cashbackSettings.enabled}, Percentage: ${cashbackSettings.cashbackPercentage}%, Budget: $${cashbackSettings.totalWeeklyBudget}.`
  });
  res.json({ success: true, settings: db.getCashbackSettings() });
});
apiRouter.get("/admin/cashback/eligible-orders", requireAdmin, (req, res) => {
  const promo = db.getCashbackSettings();
  const weekStart = new Date(promo.currentWeekBoundaryStart).getTime();
  const weekEnd = new Date(promo.currentWeekBoundaryEnd).getTime();
  const qualifyingStatuses = ["payment_verified", "in_progress", "review_ready", "completed"];
  const eligible = db.getOrders().filter((o) => {
    const createdTime = new Date(o.createdAt).getTime();
    return createdTime >= weekStart && createdTime < weekEnd && qualifyingStatuses.includes(o.status) && o.verificationStatus === "verified" && (!o.refundedAmount || o.refundedAmount === 0);
  });
  res.json({
    count: eligible.length,
    eligibleOrders: eligible.map((o) => ({
      orderRef: o.orderRef,
      customerName: o.customerName,
      packageName: o.packageName,
      amount: o.totalPaid || o.packagePrice,
      createdAt: o.createdAt
    }))
  });
});
apiRouter.post("/admin/cashback/run-draw", requireAdmin, (req, res) => {
  const promo = db.getCashbackSettings();
  if (!promo.enabled) {
    return res.status(400).json({
      error: "The promotion is currently disabled. Please confirm legal compliance and enable the module first."
    });
  }
  const weekStart = new Date(promo.currentWeekBoundaryStart).getTime();
  const weekEnd = new Date(promo.currentWeekBoundaryEnd).getTime();
  const qualifyingStatuses = ["payment_verified", "in_progress", "review_ready", "completed"];
  const eligibleOrders = db.getOrders().filter((o) => {
    const createdTime = new Date(o.createdAt).getTime();
    return createdTime >= weekStart && createdTime < weekEnd && qualifyingStatuses.includes(o.status) && o.verificationStatus === "verified" && (!o.refundedAmount || o.refundedAmount === 0);
  });
  if (eligibleOrders.length === 0) {
    return res.status(400).json({
      error: "No verified qualifying orders found within the configured weekly boundary."
    });
  }
  const sortedByAmount = [...eligibleOrders].sort((a, b) => {
    const amtA = a.totalPaid || a.packagePrice;
    const amtB = b.totalPaid || b.packagePrice;
    return amtB - amtA;
  });
  const highestOrder = sortedByAmount[0];
  const highestBase = highestOrder.totalPaid || highestOrder.packagePrice;
  const rawHighestAward = highestBase * promo.cashbackPercentage / 100;
  const highestAward = Math.min(rawHighestAward, promo.maxAwardPerWinner);
  let randomPool = eligibleOrders;
  if (!promo.allowDualWinner && eligibleOrders.length > 1) {
    randomPool = eligibleOrders.filter((o) => o.orderRef !== highestOrder.orderRef);
  }
  const seed = crypto3.randomBytes(16).toString("hex");
  const randomIndex = Math.floor(Math.random() * randomPool.length);
  const randomWinnerOrder = randomPool[randomIndex];
  const randomBase = randomWinnerOrder.totalPaid || randomWinnerOrder.packagePrice;
  const rawRandomAward = randomBase * promo.cashbackPercentage / 100;
  const randomAward = Math.min(rawRandomAward, promo.maxAwardPerWinner);
  let totalAward = highestAward + randomAward;
  if (totalAward > promo.totalWeeklyBudget) {
    const ratio = promo.totalWeeklyBudget / totalAward;
    totalAward = promo.totalWeeklyBudget;
  }
  const calculationResult = {
    weekStart: promo.currentWeekBoundaryStart,
    weekEnd: promo.currentWeekBoundaryEnd,
    totalEligible: eligibleOrders.length,
    randomDrawWinner: {
      orderRef: randomWinnerOrder.orderRef,
      customerName: randomWinnerOrder.customerName,
      orderAmount: randomBase,
      cashbackAwarded: randomAward
    },
    highestValueWinner: {
      orderRef: highestOrder.orderRef,
      customerName: highestOrder.customerName,
      orderAmount: highestBase,
      cashbackAwarded: highestAward
    },
    totalCashbackAwarded: totalAward,
    drawSeed: seed
  };
  res.json({ success: true, calculationResult });
});
apiRouter.post("/admin/cashback/lock-draw", requireAdmin, (req, res) => {
  const { drawResult, auditNote } = req.body;
  const admin = req.admin;
  if (!drawResult || !drawResult.randomDrawWinner || !drawResult.highestValueWinner) {
    return res.status(400).json({ error: "Valid draw calculation result is required." });
  }
  const record = {
    id: `draw-${Date.now()}-${crypto3.randomBytes(3).toString("hex")}`,
    weekStart: drawResult.weekStart,
    weekEnd: drawResult.weekEnd,
    drawDate: (/* @__PURE__ */ new Date()).toISOString(),
    randomDrawWinner: drawResult.randomDrawWinner,
    highestValueWinner: drawResult.highestValueWinner,
    totalCashbackAwarded: drawResult.totalCashbackAwarded,
    isLocked: true,
    published: true,
    drawSeedOrProof: drawResult.drawSeed || crypto3.randomBytes(16).toString("hex"),
    auditNote: String(auditNote || "Draw executed and locked after administrative verification.").trim(),
    payoutStatus: {
      randomWinnerPaid: false,
      highestWinnerPaid: false
    }
  };
  db.addPromoDraw(record);
  db.addAuditLog({
    action: "CASHBACK_DRAW_LOCKED",
    actor: admin.email,
    targetType: "promo",
    targetId: record.id,
    details: `Weekly cashback draw locked. Total liability: $${record.totalCashbackAwarded}. Random Winner: ${record.randomDrawWinner?.orderRef} ($${record.randomDrawWinner?.cashbackAwarded}), Top Buyer: ${record.highestValueWinner?.orderRef} ($${record.highestValueWinner?.cashbackAwarded}).`
  });
  res.status(201).json({ success: true, draw: record });
});
apiRouter.post("/admin/cashback/payout", requireAdmin, (req, res) => {
  const { drawId, winnerType, verificationDetails } = req.body;
  const admin = req.admin;
  const draw = db.getPromoDraws().find((d) => d.id === drawId);
  if (!draw) return res.status(404).json({ error: "Draw record not found." });
  db.updatePromoDraw(drawId, (d) => {
    if (winnerType === "random") {
      d.payoutStatus.randomWinnerPaid = true;
    } else if (winnerType === "highest") {
      d.payoutStatus.highestWinnerPaid = true;
    }
    d.payoutStatus.paidAt = (/* @__PURE__ */ new Date()).toISOString();
  });
  db.addAuditLog({
    action: "CASHBACK_PAYOUT_VERIFIED",
    actor: admin.email,
    targetType: "promo",
    targetId: drawId,
    details: `Manual payout verified for ${winnerType} winner. Method: ${verificationDetails || "Manual bank wire / reversal completed."}`
  });
  res.json({
    success: true,
    message: `Cashback payout for ${winnerType} winner marked as paid.`,
    draw: db.getPromoDraws().find((d) => d.id === drawId)
  });
});
apiRouter.get("/admin/reports/csv", requireAdmin, (req, res) => {
  const orders = db.getOrders();
  const headers = [
    "Order Ref",
    "Customer Name",
    "Email",
    "Country",
    "Package",
    "Price (USD)",
    "Total Paid (USD)",
    "Refunded (USD)",
    "Order Status",
    "Payment Verification",
    "Created At"
  ];
  const rows = orders.map((o) => [
    `"${o.orderRef}"`,
    `"${o.customerName.replace(/"/g, '""')}"`,
    `"${o.email}"`,
    `"${o.country}"`,
    `"${o.packageName}"`,
    o.packagePrice,
    o.totalPaid || 0,
    o.refundedAmount || 0,
    `"${o.status}"`,
    `"${o.verificationStatus}"`,
    `"${o.createdAt}"`
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="globalwebstudio-orders-${Date.now()}.csv"`);
  res.send(csvContent);
});
apiRouter.get("/admin/audit-logs", requireAdmin, (req, res) => {
  res.json(db.getAuditLogs());
});
apiRouter.get("/admin/contact-inquiries", requireAdmin, (req, res) => {
  res.json(db.getContactInquiries());
});
apiRouter.put("/admin/contact-inquiries/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.updateContactInquiryStatus(id, status);
  res.json({ success: true });
});
function generateUniqueRequestId() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "";
  let attempts = 0;
  const existingRefs = new Set(db.getCustomRequests().map((r) => r.requestId));
  do {
    let randomPart = "";
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    ref = `CPR-${year}-${randomPart}`;
    attempts++;
  } while (existingRefs.has(ref) && attempts < 100);
  return ref;
}
function generateUniqueQuotationId() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "";
  let attempts = 0;
  const existingRefs = new Set(db.getQuotations().map((q) => q.quotationId));
  do {
    let randomPart = "";
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    ref = `QUOT-${year}-${randomPart}`;
    attempts++;
  } while (existingRefs.has(ref) && attempts < 100);
  return ref;
}
var attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRIVATE_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto3.randomBytes(12).toString("hex");
    const safeExt = path2.extname(file.originalname).toLowerCase();
    cb(null, `spec-${Date.now()}-${randomHex}${safeExt}`);
  }
});
var uploadAttachments = multer({
  storage: attachmentStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  // 15MB limit per file
  fileFilter: (req, file, cb) => {
    const allowedExts = [".jpg", ".jpeg", ".png", ".pdf", ".txt", ".zip", ".docx", ".csv", ".json"];
    const ext = path2.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not supported. Please upload JPG, PNG, PDF, ZIP, TXT, or DOCX.`));
    }
  }
});
apiRouter.post(
  "/custom-requests",
  rateLimiter(10, 60 * 1e3),
  uploadAttachments.array("attachments", 5),
  (req, res) => {
    try {
      const {
        customerName,
        email,
        country,
        businessName,
        projectTitle,
        projectCategory,
        projectDescription,
        businessProblem,
        requiredFeatures,
        preferredTech,
        referenceUrls,
        expectedPagesOrModules,
        userRolesAndDashboards,
        thirdPartyIntegrations,
        trafficAndScalability,
        designStylePreference,
        targetLaunchDate,
        budgetRangeUSD,
        additionalRequirements
      } = req.body;
      if (!customerName || !email || !country || !projectTitle || !projectDescription || !businessProblem) {
        return res.status(400).json({
          error: "Please provide full name, email, country, project title, description, and business problem."
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
      }
      const requestId = generateUniqueRequestId();
      const clientAccessToken = crypto3.randomBytes(24).toString("hex");
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const uploadedFiles = req.files || [];
      const attachments = uploadedFiles.map((f) => ({
        id: `att-${Date.now()}-${crypto3.randomBytes(3).toString("hex")}`,
        fileName: f.filename,
        originalName: f.originalname,
        mimeType: f.mimetype,
        sizeBytes: f.size,
        fileUrl: `/api/custom-requests/${requestId}/attachments/${f.filename}`
      }));
      let parsedFeatures = [];
      if (Array.isArray(requiredFeatures)) {
        parsedFeatures = requiredFeatures;
      } else if (typeof requiredFeatures === "string") {
        try {
          parsedFeatures = JSON.parse(requiredFeatures);
        } catch {
          parsedFeatures = requiredFeatures.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }
      const newRequest = {
        id: `cpr-${Date.now()}-${crypto3.randomBytes(4).toString("hex")}`,
        requestId,
        customerName: String(customerName).trim().slice(0, 100),
        email: String(email).trim().toLowerCase().slice(0, 120),
        country: String(country).trim().slice(0, 60),
        businessName: businessName ? String(businessName).trim().slice(0, 120) : void 0,
        projectTitle: String(projectTitle).trim().slice(0, 150),
        projectCategory: String(projectCategory || "Custom Web Application").trim().slice(0, 100),
        projectDescription: String(projectDescription).trim().slice(0, 8e3),
        businessProblem: String(businessProblem).trim().slice(0, 4e3),
        requiredFeatures: parsedFeatures.map((f) => String(f).slice(0, 150)),
        preferredTech: preferredTech ? String(preferredTech).trim().slice(0, 200) : void 0,
        referenceUrls: referenceUrls ? String(referenceUrls).trim().slice(0, 500) : void 0,
        expectedPagesOrModules: expectedPagesOrModules ? String(expectedPagesOrModules).trim().slice(0, 150) : void 0,
        userRolesAndDashboards: userRolesAndDashboards ? String(userRolesAndDashboards).trim().slice(0, 1e3) : void 0,
        thirdPartyIntegrations: thirdPartyIntegrations ? String(thirdPartyIntegrations).trim().slice(0, 1e3) : void 0,
        trafficAndScalability: trafficAndScalability ? String(trafficAndScalability).trim().slice(0, 1e3) : void 0,
        designStylePreference: designStylePreference ? String(designStylePreference).trim().slice(0, 300) : void 0,
        targetLaunchDate: targetLaunchDate ? String(targetLaunchDate).slice(0, 50) : void 0,
        budgetRangeUSD: String(budgetRangeUSD || "To be scoped").trim().slice(0, 100),
        additionalRequirements: additionalRequirements ? String(additionalRequirements).trim().slice(0, 3e3) : void 0,
        attachments,
        clientAccessToken,
        status: "Submitted",
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: `msg-${Date.now()}-init`,
            sender: "admin",
            senderName: "GlobalWeb Studio Architecture Team",
            message: `Hello ${customerName}, we have received your custom project brief for "${projectTitle}". Our senior engineering team is reviewing your requirements to evaluate architecture, dependencies, and delivery milestones. A formal quotation will be prepared shortly.`,
            timestamp: now
          }
        ],
        internalNotes: []
      };
      db.addCustomRequest(newRequest);
      db.addAuditLog({
        action: "CUSTOM_PROJECT_REQUEST_SUBMITTED",
        actor: newRequest.email,
        targetType: "custom_request",
        targetId: requestId,
        details: `Custom project request "${newRequest.projectTitle}" submitted by ${newRequest.customerName}. Budget: ${newRequest.budgetRangeUSD}. Status: Submitted.`
      });
      db.addNotification({
        targetEmail: newRequest.email,
        requestId,
        type: "new_project_request",
        title: `Custom Project Request ${requestId} Received`,
        message: `Your project request for "${newRequest.projectTitle}" has been logged and is under architectural evaluation.`,
        missingConfigNotice: "Client notification logged to Customer Portal."
      });
      res.status(201).json({
        success: true,
        requestId,
        clientAccessToken,
        customRequest: newRequest
      });
    } catch (err) {
      console.error("Error creating custom request:", err);
      res.status(500).json({ error: err.message || "Failed to submit custom project request." });
    }
  }
);
apiRouter.get("/custom-requests/:requestId", (req, res) => {
  const { requestId } = req.params;
  const token = req.query.token || req.headers["x-order-token"];
  const emailQuery = req.query.email?.trim().toLowerCase();
  const adminToken = req.headers["x-admin-token"];
  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) {
    return res.status(404).json({ error: "Custom project request not found." });
  }
  const isAdmin = !!verifyAdminSession(adminToken);
  const isAuthorizedCustomer = token && token === request.clientAccessToken || emailQuery && emailQuery === request.email.toLowerCase();
  if (!isAdmin && !isAuthorizedCustomer) {
    return res.status(403).json({ error: "Access denied. Valid client token or customer email required." });
  }
  const quotations = db.getQuotations().filter((q) => q.requestId === request.requestId);
  const linkedOrder = db.getOrders().find((o) => o.linkedCustomRequestId === request.requestId || o.orderRef === request.linkedOrderRef);
  const sanitizedRequest = {
    ...request,
    internalNotes: isAdmin ? request.internalNotes : void 0,
    internalEstimates: isAdmin ? request.internalEstimates : void 0
  };
  res.json({
    customRequest: sanitizedRequest,
    quotations,
    linkedOrder: linkedOrder || null,
    paymentMethods: db.getPaymentMethods().filter((m) => m.enabled)
  });
});
apiRouter.get("/custom-requests/:requestId/attachments/:fileName", (req, res) => {
  const { requestId, fileName } = req.params;
  const token = req.query.token || req.headers["x-order-token"];
  const adminToken = req.headers["x-admin-token"];
  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: "Request not found." });
  const isAdmin = !!verifyAdminSession(adminToken);
  const isOwner = token && token === request.clientAccessToken;
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: "Access denied. Only the project owner or administrator may view this file." });
  }
  const attachment = request.attachments.find((a) => a.fileName === fileName);
  if (!attachment) return res.status(404).json({ error: "Attachment file not found." });
  const filePath = path2.join(PRIVATE_UPLOADS_DIR, attachment.fileName);
  if (!fs2.existsSync(filePath)) {
    return res.status(404).json({ error: "Attachment file does not exist on storage." });
  }
  res.setHeader("Content-Type", attachment.mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${attachment.originalName.replace(/"/g, "")}"`);
  res.sendFile(filePath);
});
apiRouter.post("/custom-requests/:requestId/message", (req, res) => {
  const { requestId } = req.params;
  const { message, token } = req.body;
  const adminToken = req.headers["x-admin-token"];
  if (!message || String(message).trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty." });
  }
  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: "Request not found." });
  const adminSession = verifyAdminSession(adminToken);
  const isOwner = token && token === request.clientAccessToken;
  if (!adminSession && !isOwner) {
    return res.status(403).json({ error: "Unauthorized to post messages on this project." });
  }
  const sender = adminSession ? "admin" : "client";
  const senderName = adminSession ? adminSession.name : request.customerName;
  const newMsg = {
    id: `msg-${Date.now()}-${crypto3.randomBytes(3).toString("hex")}`,
    sender,
    senderName,
    message: String(message).trim().slice(0, 3e3),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.updateCustomRequest(request.requestId, (r) => {
    r.messages.push(newMsg);
  });
  db.addAuditLog({
    action: "CUSTOM_REQUEST_MESSAGE_ADDED",
    actor: adminSession ? adminSession.email : request.email,
    targetType: "custom_request",
    targetId: request.requestId,
    details: `Message sent by ${senderName} (${sender}): "${newMsg.message.substring(0, 60)}..."`
  });
  res.json({ success: true, message: newMsg });
});
apiRouter.get("/customer-portal/requests", (req, res) => {
  const email = req.query.email?.trim().toLowerCase();
  const token = req.query.token?.trim();
  if (!email && !token) {
    return res.status(400).json({ error: "Client email or access token required." });
  }
  const requests = db.getCustomRequests().filter((r) => {
    if (token && r.clientAccessToken === token) return true;
    if (email && r.email.toLowerCase() === email) return true;
    return false;
  });
  const sanitized = requests.map((r) => ({
    ...r,
    internalNotes: void 0,
    internalEstimates: void 0
  }));
  res.json({ requests: sanitized });
});
apiRouter.get("/admin/custom-requests", requireAdmin, (req, res) => {
  res.json(db.getCustomRequests());
});
apiRouter.post("/admin/custom-requests/:requestId/status", requireAdmin, (req, res) => {
  const { requestId } = req.params;
  const { status, note } = req.body;
  const admin = req.admin;
  const validStatuses = [
    "Submitted",
    "Under Review",
    "More Information Required",
    "Quote Prepared",
    "Deal Offered",
    "Accepted by Client",
    "Awaiting Payment",
    "Payment Proof Submitted",
    "Payment Verified",
    "In Development",
    "Delivered",
    "Completed",
    "Declined",
    "Cancelled"
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status "${status}".` });
  }
  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: "Request not found." });
  const oldStatus = request.status;
  db.updateCustomRequest(request.requestId, (r) => {
    r.status = status;
  });
  db.addAuditLog({
    action: "CUSTOM_REQUEST_STATUS_UPDATED",
    actor: admin.email,
    targetType: "custom_request",
    targetId: request.requestId,
    details: `Status updated from "${oldStatus}" to "${status}" by ${admin.name}. Note: ${note || "No note"}`
  });
  db.addNotification({
    targetEmail: request.email,
    requestId: request.requestId,
    type: "request_status_change",
    title: `Project Status: ${status}`,
    message: `Your custom project "${request.projectTitle}" status is now "${status}".`,
    missingConfigNotice: "Event logged in Customer Portal."
  });
  res.json({ success: true, request: db.getCustomRequests().find((r) => r.requestId === request.requestId) });
});
apiRouter.post("/admin/custom-requests/:requestId/internal-note", requireAdmin, (req, res) => {
  const { requestId } = req.params;
  const { note } = req.body;
  const admin = req.admin;
  if (!note || String(note).trim() === "") {
    return res.status(400).json({ error: "Note content cannot be empty." });
  }
  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: "Request not found." });
  const newNote = {
    id: `note-${Date.now()}-${crypto3.randomBytes(3).toString("hex")}`,
    author: admin.name || admin.email,
    note: String(note).trim(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.updateCustomRequest(request.requestId, (r) => {
    r.internalNotes.unshift(newNote);
  });
  db.addAuditLog({
    action: "ADMIN_INTERNAL_NOTE_ADDED",
    actor: admin.email,
    targetType: "custom_request",
    targetId: request.requestId,
    details: `Private internal note added: "${newNote.note.substring(0, 50)}..."`
  });
  res.json({ success: true, note: newNote });
});
apiRouter.post("/admin/custom-requests/:requestId/internal-estimate", requireAdmin, (req, res) => {
  const { requestId } = req.params;
  const { estimatedHours, laborCostUSD, infrastructureCostUSD, contingencyMarginPercent, suggestedQuotePriceUSD, notes } = req.body;
  const admin = req.admin;
  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: "Request not found." });
  const estimates = {
    estimatedHours: parseFloat(estimatedHours) || 0,
    laborCostUSD: parseFloat(laborCostUSD) || 0,
    infrastructureCostUSD: parseFloat(infrastructureCostUSD) || 0,
    contingencyMarginPercent: parseFloat(contingencyMarginPercent) || 0,
    suggestedQuotePriceUSD: parseFloat(suggestedQuotePriceUSD) || 0,
    notes: String(notes || "").trim(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.updateCustomRequest(request.requestId, (r) => {
    r.internalEstimates = estimates;
  });
  db.addAuditLog({
    action: "ADMIN_INTERNAL_ESTIMATE_SAVED",
    actor: admin.email,
    targetType: "custom_request",
    targetId: request.requestId,
    details: `Internal estimate: ${estimates.estimatedHours} hrs, Labor $${estimates.laborCostUSD}, Infra $${estimates.infrastructureCostUSD}, Suggested Quote $${estimates.suggestedQuotePriceUSD}.`
  });
  res.json({ success: true, internalEstimates: estimates });
});
apiRouter.post("/admin/custom-requests/:requestId/ask-info", requireAdmin, (req, res) => {
  const { requestId } = req.params;
  const { message } = req.body;
  const admin = req.admin;
  if (!message || String(message).trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty." });
  }
  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: "Request not found." });
  const msgObj = {
    id: `msg-${Date.now()}-${crypto3.randomBytes(3).toString("hex")}`,
    sender: "admin",
    senderName: admin.name || "Studio Project Lead",
    message: String(message).trim(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.updateCustomRequest(request.requestId, (r) => {
    r.messages.push(msgObj);
    r.status = "More Information Required";
  });
  db.addAuditLog({
    action: "ADMIN_REQUESTED_MORE_INFO",
    actor: admin.email,
    targetType: "custom_request",
    targetId: request.requestId,
    details: `Admin requested clarification: "${msgObj.message.substring(0, 70)}..."`
  });
  db.addNotification({
    targetEmail: request.email,
    requestId: request.requestId,
    type: "more_info_required",
    title: "Clarification Needed on Project Request",
    message: `Our engineering team has sent you a message regarding "${request.projectTitle}". Please view your customer portal to reply.`,
    missingConfigNotice: "Event logged in Customer Portal."
  });
  res.json({ success: true, message: msgObj });
});
apiRouter.post("/admin/custom-requests/:requestId/quotations", requireAdmin, (req, res) => {
  const { requestId } = req.params;
  const {
    projectTitle,
    agreedScope,
    deliverables,
    excludedFeatures,
    totalPriceUSD,
    paymentSchedule,
    deliveryTimeline,
    revisionPolicy,
    maintenanceTerms,
    thirdPartyCostsNote,
    expiryDate,
    cancellationAndRefundTerms
  } = req.body;
  const admin = req.admin;
  const request = db.getCustomRequests().find((r) => r.requestId.toUpperCase() === requestId.toUpperCase());
  if (!request) return res.status(404).json({ error: "Request not found." });
  const parsedPrice = parseFloat(totalPriceUSD);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "Please enter a valid positive agreed price in USD." });
  }
  const milestones = Array.isArray(paymentSchedule) ? paymentSchedule : [];
  if (milestones.length === 0) {
    return res.status(400).json({ error: "At least one payment milestone is required." });
  }
  const milestoneSum = milestones.reduce((sum, m) => sum + (parseFloat(m.amountUSD) || 0), 0);
  if (Math.abs(milestoneSum - parsedPrice) > 1) {
    return res.status(400).json({
      error: `Milestone amounts ($${milestoneSum}) must equal the total agreed quotation price ($${parsedPrice}).`
    });
  }
  const quotationId = generateUniqueQuotationId();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const formattedMilestones = milestones.map((m, idx) => ({
    id: `ms-${Date.now()}-${idx}-${crypto3.randomBytes(2).toString("hex")}`,
    title: String(m.title || `Milestone ${idx + 1}`).trim(),
    description: String(m.description || "").trim(),
    percentage: parseFloat(m.percentage) || Math.round(m.amountUSD / parsedPrice * 100),
    amountUSD: parseFloat(m.amountUSD),
    status: idx === 0 ? "pending_payment" : "pending_payment",
    proofs: []
  }));
  const newQuotation = {
    id: `quot-${Date.now()}-${crypto3.randomBytes(3).toString("hex")}`,
    quotationId,
    requestId: request.requestId,
    version: 1,
    projectTitle: String(projectTitle || request.projectTitle).trim(),
    agreedScope: String(agreedScope).trim(),
    deliverables: Array.isArray(deliverables) ? deliverables : [String(deliverables || "")],
    excludedFeatures: Array.isArray(excludedFeatures) ? excludedFeatures : [],
    totalPriceUSD: parsedPrice,
    paymentSchedule: formattedMilestones,
    deliveryTimeline: String(deliveryTimeline || "Per milestone roadmap").trim(),
    revisionPolicy: String(revisionPolicy || "3 revision rounds per milestone").trim(),
    maintenanceTerms: String(maintenanceTerms || "30 days bug-fix warranty post-delivery").trim(),
    thirdPartyCostsNote: thirdPartyCostsNote ? String(thirdPartyCostsNote).trim() : void 0,
    expiryDate: String(expiryDate || new Date(Date.now() + 14 * 864e5).toISOString().split("T")[0]),
    cancellationAndRefundTerms: String(
      cancellationAndRefundTerms || "Milestone deposits are non-refundable once engineering sprints have commenced. Completed milestone deliverables are owned by the client upon full settlement."
    ).trim(),
    status: "offered",
    createdAt: now,
    offeredAt: now,
    versionHistory: [
      {
        version: 1,
        totalPriceUSD: parsedPrice,
        updatedAt: now,
        changeSummary: "Initial formal deal quotation prepared by administration."
      }
    ],
    clientAccessToken: request.clientAccessToken
  };
  db.addQuotation(newQuotation);
  db.updateCustomRequest(request.requestId, (r) => {
    r.linkedQuotationId = quotationId;
    r.status = "Deal Offered";
    r.messages.push({
      id: `msg-${Date.now()}-quote`,
      sender: "admin",
      senderName: admin.name || "Studio Finance & Architecture",
      message: `A formal negotiated deal quotation (${quotationId}) for $${parsedPrice.toLocaleString()} USD has been prepared and published to your customer portal. Please review the deliverables, milestone schedule, and offer expiry date.`,
      timestamp: now
    });
  });
  db.addAuditLog({
    action: "PROJECT_QUOTATION_ISSUED",
    actor: admin.email,
    targetType: "quotation",
    targetId: quotationId,
    details: `Quotation ${quotationId} issued for request ${request.requestId}. Total Agreed: $${parsedPrice} USD with ${formattedMilestones.length} milestones.`
  });
  db.addNotification({
    targetEmail: request.email,
    requestId: request.requestId,
    type: "new_quotation_available",
    title: `Formal Deal Quotation Ready: ${quotationId}`,
    message: `We have prepared a formal quotation ($${parsedPrice.toLocaleString()} USD) for your project "${newQuotation.projectTitle}".`,
    missingConfigNotice: "Notification dispatched to Customer Portal."
  });
  res.status(201).json({ success: true, quotation: newQuotation });
});
apiRouter.put("/admin/quotations/:quotationId", requireAdmin, (req, res) => {
  const { quotationId } = req.params;
  const {
    agreedScope,
    deliverables,
    excludedFeatures,
    totalPriceUSD,
    paymentSchedule,
    deliveryTimeline,
    revisionPolicy,
    maintenanceTerms,
    expiryDate,
    changeSummary
  } = req.body;
  const admin = req.admin;
  const quotation = db.getQuotations().find((q) => q.quotationId.toUpperCase() === quotationId.toUpperCase());
  if (!quotation) return res.status(404).json({ error: "Quotation not found." });
  if (quotation.status === "accepted") {
    return res.status(400).json({ error: "Cannot modify a quotation that has already been accepted by the client." });
  }
  const parsedPrice = totalPriceUSD !== void 0 ? parseFloat(totalPriceUSD) : quotation.totalPriceUSD;
  const newVersion = quotation.version + 1;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  db.updateQuotation(quotation.quotationId, (q) => {
    q.version = newVersion;
    if (agreedScope) q.agreedScope = agreedScope;
    if (deliverables) q.deliverables = deliverables;
    if (excludedFeatures) q.excludedFeatures = excludedFeatures;
    if (totalPriceUSD) q.totalPriceUSD = parsedPrice;
    if (paymentSchedule) q.paymentSchedule = paymentSchedule;
    if (deliveryTimeline) q.deliveryTimeline = deliveryTimeline;
    if (revisionPolicy) q.revisionPolicy = revisionPolicy;
    if (maintenanceTerms) q.maintenanceTerms = maintenanceTerms;
    if (expiryDate) q.expiryDate = expiryDate;
    q.versionHistory.unshift({
      version: newVersion,
      totalPriceUSD: parsedPrice,
      updatedAt: now,
      changeSummary: String(changeSummary || `Version ${newVersion} revisions issued by ${admin.name}`).trim()
    });
  });
  db.addAuditLog({
    action: "PROJECT_QUOTATION_REVISED",
    actor: admin.email,
    targetType: "quotation",
    targetId: quotation.quotationId,
    details: `Quotation revised to Version ${newVersion}. Total: $${parsedPrice} USD. Summary: ${changeSummary || "Scope/Price adjustments"}`
  });
  res.json({ success: true, quotation: db.getQuotations().find((q) => q.quotationId === quotation.quotationId) });
});
apiRouter.get("/quotations/:quotationId", (req, res) => {
  const { quotationId } = req.params;
  const token = req.query.token || req.headers["x-order-token"];
  const adminToken = req.headers["x-admin-token"];
  const quotation = db.getQuotations().find((q) => q.quotationId.toUpperCase() === quotationId.toUpperCase());
  if (!quotation) return res.status(404).json({ error: "Quotation not found." });
  const isAdmin = !!verifyAdminSession(adminToken);
  const isOwner = token && (token === quotation.clientAccessToken || db.getCustomRequests().some((r) => r.requestId === quotation.requestId && r.clientAccessToken === token));
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: "Access denied. Valid access token required to view quotation." });
  }
  const linkedRequest = db.getCustomRequests().find((r) => r.requestId === quotation.requestId);
  const linkedOrder = db.getOrders().find((o) => o.linkedQuotationId === quotation.quotationId);
  res.json({
    quotation,
    customRequest: linkedRequest || null,
    linkedOrder: linkedOrder || null,
    paymentMethods: db.getPaymentMethods().filter((m) => m.enabled)
  });
});
apiRouter.post("/quotations/:quotationId/accept", (req, res) => {
  const { quotationId } = req.params;
  const { clientAccessToken, acceptanceSignature, acceptanceNotes } = req.body;
  const quotation = db.getQuotations().find((q) => q.quotationId.toUpperCase() === quotationId.toUpperCase());
  if (!quotation) return res.status(404).json({ error: "Quotation not found." });
  const linkedRequest = db.getCustomRequests().find((r) => r.requestId === quotation.requestId);
  if (!linkedRequest) return res.status(404).json({ error: "Linked project request not found." });
  if (clientAccessToken !== linkedRequest.clientAccessToken && clientAccessToken !== quotation.clientAccessToken) {
    return res.status(403).json({ error: "Invalid client access token. Unauthorized to accept quotation." });
  }
  if (quotation.status === "accepted") {
    return res.status(400).json({ error: "This quotation has already been accepted." });
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  db.updateQuotation(quotation.quotationId, (q) => {
    q.status = "accepted";
    q.acceptedAt = now;
    q.acceptedByClient = true;
    q.acceptanceSignature = String(acceptanceSignature || linkedRequest.customerName).trim();
  });
  const orderRef = generateUniqueOrderRef();
  const firstMilestone = quotation.paymentSchedule[0];
  const initialDueAmount = firstMilestone ? firstMilestone.amountUSD : quotation.totalPriceUSD;
  const newOrder = {
    id: `ord-custom-${Date.now()}-${crypto3.randomBytes(3).toString("hex")}`,
    orderRef,
    customerName: linkedRequest.customerName,
    email: linkedRequest.email,
    country: linkedRequest.country,
    businessName: linkedRequest.businessName,
    packageId: "custom-negotiated-deal",
    packageName: `${quotation.projectTitle} (Custom Negotiated Deal)`,
    packagePrice: quotation.totalPriceUSD,
    currency: "USD",
    projectRequirements: quotation.agreedScope,
    requiredFeatures: quotation.deliverables,
    createdAt: now,
    updatedAt: now,
    status: "awaiting_payment",
    verificationStatus: "none",
    proofs: [],
    totalPaid: 0,
    clientAccessToken: linkedRequest.clientAccessToken,
    linkedCustomRequestId: linkedRequest.requestId,
    linkedQuotationId: quotation.quotationId,
    milestones: quotation.paymentSchedule,
    activeMilestoneIndex: 0,
    isCustomDeal: true
  };
  db.addOrder(newOrder);
  db.updateCustomRequest(linkedRequest.requestId, (r) => {
    r.status = "Accepted by Client";
    r.linkedOrderRef = orderRef;
    r.messages.push({
      id: `msg-${Date.now()}-accepted`,
      sender: "client",
      senderName: linkedRequest.customerName,
      message: `I have formally accepted Quotation ${quotation.quotationId} ($${quotation.totalPriceUSD.toLocaleString()} USD) with agreed deliverables and milestone schedule. Order reference ${orderRef} has been initialized for Milestone 1 payment.`,
      timestamp: now
    });
  });
  db.addAuditLog({
    action: "PROJECT_QUOTATION_ACCEPTED",
    actor: linkedRequest.email,
    targetType: "quotation",
    targetId: quotation.quotationId,
    details: `Quotation ${quotation.quotationId} accepted by ${linkedRequest.customerName}. Order ${orderRef} created for Milestone 1 ($${initialDueAmount}). Status: awaiting_payment.`
  });
  db.addNotification({
    targetEmail: linkedRequest.email,
    requestId: linkedRequest.requestId,
    orderRef,
    type: "deal_accepted",
    title: `Deal Accepted! Order ${orderRef} Initialized`,
    message: `You have accepted quotation ${quotation.quotationId}. Please review Askari Bank and wire transfer instructions for Milestone 1 ($${initialDueAmount} USD).`,
    missingConfigNotice: "Dispatched to Customer Portal."
  });
  res.json({
    success: true,
    message: "Quotation accepted successfully. Custom order initialized for payment.",
    orderRef,
    order: newOrder,
    quotation: db.getQuotations().find((q) => q.quotationId === quotation.quotationId)
  });
});
apiRouter.post("/quotations/:quotationId/decline", (req, res) => {
  const { quotationId } = req.params;
  const { clientAccessToken, reason } = req.body;
  const quotation = db.getQuotations().find((q) => q.quotationId.toUpperCase() === quotationId.toUpperCase());
  if (!quotation) return res.status(404).json({ error: "Quotation not found." });
  const linkedRequest = db.getCustomRequests().find((r) => r.requestId === quotation.requestId);
  if (!linkedRequest) return res.status(404).json({ error: "Linked request not found." });
  if (clientAccessToken !== linkedRequest.clientAccessToken && clientAccessToken !== quotation.clientAccessToken) {
    return res.status(403).json({ error: "Unauthorized." });
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  db.updateQuotation(quotation.quotationId, (q) => {
    q.status = "declined";
    q.declinedAt = now;
    q.declineReason = String(reason || "Client opted not to proceed at this time.").trim();
  });
  db.updateCustomRequest(linkedRequest.requestId, (r) => {
    r.status = "Declined";
    r.messages.push({
      id: `msg-${Date.now()}-declined`,
      sender: "client",
      senderName: linkedRequest.customerName,
      message: `Quotation ${quotation.quotationId} declined. Reason: "${reason || "Scope / Price negotiation needed"}".`,
      timestamp: now
    });
  });
  db.addAuditLog({
    action: "PROJECT_QUOTATION_DECLINED",
    actor: linkedRequest.email,
    targetType: "quotation",
    targetId: quotation.quotationId,
    details: `Quotation declined. Reason: ${reason || "Not specified"}`
  });
  res.json({ success: true, message: "Quotation status updated to declined." });
});
apiRouter.post(
  "/orders/:orderRef/milestones/:milestoneId/proof",
  upload.single("proofFile"),
  (req, res) => {
    const { orderRef, milestoneId } = req.params;
    const {
      clientAccessToken,
      paymentMethodId,
      amountTransferred,
      currency,
      transferDate,
      transactionReference,
      customerNote
    } = req.body;
    const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
    if (!order) {
      if (req.file) fs2.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Order not found." });
    }
    const adminToken = req.headers["x-admin-token"];
    const isAdmin = !!verifyAdminSession(adminToken);
    const isOwner = clientAccessToken && clientAccessToken === order.clientAccessToken;
    if (!isAdmin && !isOwner) {
      if (req.file) fs2.unlinkSync(req.file.path);
      return res.status(403).json({ error: "Unauthorized to upload payment proof." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Payment receipt file is required (JPG, PNG, or PDF)." });
    }
    const parsedAmt = parseFloat(amountTransferred);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      fs2.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Please enter a valid transferred amount greater than 0." });
    }
    if (!transactionReference || String(transactionReference).trim() === "") {
      fs2.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Transaction or MTCN reference number is required." });
    }
    const proofId = `prf-ms-${Date.now()}-${crypto3.randomBytes(3).toString("hex")}`;
    const newProof = {
      id: proofId,
      orderRef: order.orderRef,
      milestoneId,
      paymentMethodId: String(paymentMethodId || "bank_transfer"),
      amountTransferred: parsedAmt,
      currency: String(currency || "USD").toUpperCase(),
      transferDate: String(transferDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]),
      transactionReference: String(transactionReference).trim(),
      fileName: req.file.filename,
      fileOriginalName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      fileUrl: `/api/orders/${order.orderRef}/proof-file/${proofId}`,
      customerNote: customerNote ? String(customerNote).trim().slice(0, 500) : void 0,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      verificationStatus: "pending_review"
    };
    db.updateOrder(order.orderRef, (ord) => {
      ord.proofs.unshift(newProof);
      ord.activeProofId = newProof.id;
      ord.status = "proof_submitted";
      ord.verificationStatus = "pending_review";
      if (ord.milestones) {
        const ms = ord.milestones.find((m) => m.id === milestoneId);
        if (ms) {
          ms.status = "proof_submitted";
          ms.activeProofId = newProof.id;
          if (!ms.proofs) ms.proofs = [];
          ms.proofs.unshift(newProof);
        }
      }
    });
    if (order.linkedCustomRequestId) {
      db.updateCustomRequest(order.linkedCustomRequestId, (r) => {
        r.status = "Payment Proof Submitted";
      });
    }
    db.addAuditLog({
      action: "MILESTONE_PAYMENT_PROOF_SUBMITTED",
      actor: order.email,
      targetType: "proof",
      targetId: newProof.id,
      details: `Proof submitted for Order ${order.orderRef} Milestone ${milestoneId}. Amount: ${newProof.currency} ${newProof.amountTransferred}, TxRef: "${newProof.transactionReference}". Awaiting admin manual verification.`
    });
    db.addNotification({
      targetEmail: order.email,
      orderRef: order.orderRef,
      type: "payment_proof_submitted",
      title: "Milestone Payment Proof Submitted",
      message: `Your payment receipt for Milestone (${newProof.currency} ${newProof.amountTransferred}) has been submitted for manual verification.`,
      missingConfigNotice: "Dispatched to Customer Portal."
    });
    res.status(201).json({
      success: true,
      message: "Payment Proof Submitted \u2014 Awaiting Admin Verification.",
      proof: newProof,
      order: db.getOrders().find((o) => o.orderRef === order.orderRef)
    });
  }
);
apiRouter.post(
  "/admin/orders/:orderRef/milestones/:milestoneId/verify",
  requireAdmin,
  (req, res) => {
    const { orderRef, milestoneId } = req.params;
    const { proofId, verifiedAmount, notes } = req.body;
    const admin = req.admin;
    const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
    if (!order) return res.status(404).json({ error: "Order not found." });
    const proof = order.proofs.find((p) => p.id === proofId);
    if (!proof) return res.status(404).json({ error: "Proof not found." });
    const finalAmount = verifiedAmount !== void 0 ? parseFloat(verifiedAmount) : proof.amountTransferred;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    db.updateOrder(order.orderRef, (ord) => {
      const targetProof = ord.proofs.find((p) => p.id === proofId);
      if (targetProof) {
        targetProof.verificationStatus = "verified";
        targetProof.verifiedAt = now;
        targetProof.verifiedBy = admin.email;
      }
      if (ord.milestones) {
        const msIndex = ord.milestones.findIndex((m) => m.id === milestoneId);
        if (msIndex !== -1) {
          ord.milestones[msIndex].status = "payment_verified";
          ord.milestones[msIndex].verifiedAmount = finalAmount;
          ord.milestones[msIndex].verifiedAt = now;
          ord.milestones[msIndex].verifiedBy = admin.email;
          if (msIndex + 1 < ord.milestones.length) {
            ord.activeMilestoneIndex = msIndex + 1;
          }
        }
      }
      ord.verificationStatus = "verified";
      ord.status = "in_progress";
      ord.totalPaid = (ord.totalPaid || 0) + finalAmount;
    });
    if (order.linkedCustomRequestId) {
      db.updateCustomRequest(order.linkedCustomRequestId, (r) => {
        r.status = "Payment Verified";
      });
    }
    db.addAuditLog({
      action: "MILESTONE_PAYMENT_VERIFIED",
      actor: admin.email,
      targetType: "order",
      targetId: order.orderRef,
      details: `Milestone payment of $${finalAmount} verified by ${admin.name}. Notes: ${notes || "Verified against bank statement"}`
    });
    db.addNotification({
      targetEmail: order.email,
      orderRef: order.orderRef,
      type: "payment_verified",
      title: "Payment Verified \u2014 Project In Development",
      message: `Your milestone payment of $${finalAmount} has been verified against our bank records. Engineering work is officially underway!`,
      missingConfigNotice: "Dispatched to Customer Portal."
    });
    res.json({
      success: true,
      message: "Milestone payment verified successfully.",
      order: db.getOrders().find((o) => o.orderRef === order.orderRef)
    });
  }
);
apiRouter.post(
  "/admin/orders/:orderRef/milestones/:milestoneId/reject",
  requireAdmin,
  (req, res) => {
    const { orderRef, milestoneId } = req.params;
    const { proofId, rejectionReason, isCorrectionRequest } = req.body;
    const admin = req.admin;
    if (!rejectionReason || String(rejectionReason).trim() === "") {
      return res.status(400).json({ error: "Please specify the rejection or correction reason." });
    }
    const order = db.getOrders().find((o) => o.orderRef.toUpperCase() === orderRef.toUpperCase());
    if (!order) return res.status(404).json({ error: "Order not found." });
    const newStatus = isCorrectionRequest ? "correction_requested" : "rejected";
    db.updateOrder(order.orderRef, (ord) => {
      const targetProof = ord.proofs.find((p) => p.id === proofId);
      if (targetProof) {
        targetProof.verificationStatus = newStatus;
        targetProof.rejectionReason = String(rejectionReason).trim();
      }
      if (ord.milestones) {
        const ms = ord.milestones.find((m) => m.id === milestoneId);
        if (ms) {
          ms.status = "pending_payment";
        }
      }
      ord.verificationStatus = newStatus;
      ord.status = "awaiting_payment";
    });
    if (order.linkedCustomRequestId) {
      db.updateCustomRequest(order.linkedCustomRequestId, (r) => {
        r.status = isCorrectionRequest ? "More Information Required" : "Awaiting Payment";
      });
    }
    db.addAuditLog({
      action: isCorrectionRequest ? "MILESTONE_PROOF_CORRECTION_REQUESTED" : "MILESTONE_PROOF_REJECTED",
      actor: admin.email,
      targetType: "order",
      targetId: order.orderRef,
      details: `Milestone proof ${proofId} set to "${newStatus}" by ${admin.name}. Reason: "${rejectionReason}"`
    });
    res.json({
      success: true,
      message: isCorrectionRequest ? "Correction requested." : "Milestone proof rejected.",
      order: db.getOrders().find((o) => o.orderRef === order.orderRef)
    });
  }
);
apiRouter.get("/notifications", (req, res) => {
  const email = req.query.email?.trim().toLowerCase();
  const adminToken = req.headers["x-admin-token"];
  const isAdmin = !!verifyAdminSession(adminToken);
  let notifs = db.getNotifications();
  if (!isAdmin && email) {
    notifs = notifs.filter((n) => n.targetEmail.toLowerCase() === email);
  }
  res.json({ notifications: notifs.slice(0, 30) });
});
apiRouter.put("/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  db.markNotificationAsRead(id);
  res.json({ success: true });
});
apiRouter.post("/admin/packages", requireAdmin, (req, res) => {
  const {
    id,
    name,
    tagline,
    price,
    tier,
    isStartingAt,
    isFeatured,
    isEnterprise,
    category,
    pagesDescription,
    revisions,
    deliveryTime,
    idealClient,
    description,
    includedFeatures,
    excludedFeatures,
    enterpriseOverview
  } = req.body;
  const admin = req.admin;
  if (!name || price === void 0) {
    return res.status(400).json({ error: "Package name and price are required." });
  }
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "Price must be a positive USD amount." });
  }
  const packageId = id || `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const packages = db.getPackages();
  const newPkg = {
    id: packageId,
    name: String(name).trim(),
    tagline: String(tagline || "").trim(),
    price: parsedPrice,
    tier: tier || (parsedPrice < 1e3 ? "affordable" : parsedPrice <= 1e5 ? "growing" : "enterprise"),
    isStartingAt: !!isStartingAt,
    isFeatured: !!isFeatured,
    isEnterprise: !!isEnterprise || parsedPrice >= 1e5,
    category: String(category || "Web Development").trim(),
    pagesDescription: String(pagesDescription || "Custom architecture").trim(),
    revisions: String(revisions || "3 revision rounds").trim(),
    deliveryTime: String(deliveryTime || "2\u20134 weeks").trim(),
    idealClient: idealClient ? String(idealClient).trim() : void 0,
    description: String(description || tagline || "").trim(),
    includedFeatures: Array.isArray(includedFeatures) ? includedFeatures : ["Custom Responsive Layout"],
    excludedFeatures: Array.isArray(excludedFeatures) ? excludedFeatures : [],
    active: true,
    displayOrder: packages.length + 1,
    enterpriseOverview: enterpriseOverview || void 0
  };
  packages.push(newPkg);
  db.setPackages(packages);
  db.addAuditLog({
    action: "PACKAGE_CREATED",
    actor: admin.email,
    targetType: "package",
    targetId: packageId,
    details: `New package "${newPkg.name}" added at $${newPkg.price} USD.`
  });
  res.status(201).json({ success: true, package: newPkg });
});
apiRouter.put("/admin/packages/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const admin = req.admin;
  const packages = db.getPackages();
  const pkgIndex = packages.findIndex((p) => p.id === id);
  if (pkgIndex === -1) return res.status(404).json({ error: "Package not found in catalog." });
  if (updateData.price !== void 0) {
    const p = parseFloat(updateData.price);
    if (isNaN(p) || p <= 0) {
      return res.status(400).json({ error: "Package price must be a positive USD amount." });
    }
    updateData.price = p;
  }
  packages[pkgIndex] = { ...packages[pkgIndex], ...updateData };
  db.setPackages(packages);
  db.addAuditLog({
    action: "PACKAGE_UPDATED",
    actor: admin.email,
    targetType: "package",
    targetId: id,
    details: `Package "${packages[pkgIndex].name}" updated. Price: $${packages[pkgIndex].price} USD. Active: ${packages[pkgIndex].active}.`
  });
  res.json({ success: true, package: packages[pkgIndex] });
});
apiRouter.delete("/admin/packages/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const admin = req.admin;
  const packages = db.getPackages();
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) return res.status(404).json({ error: "Package not found." });
  const filtered = packages.filter((p) => p.id !== id);
  db.setPackages(filtered);
  db.addAuditLog({
    action: "PACKAGE_DELETED",
    actor: admin.email,
    targetType: "package",
    targetId: id,
    details: `Package "${pkg.name}" ($${pkg.price}) removed from catalog.`
  });
  res.json({ success: true, message: `Package ${id} removed.` });
});

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
async function startServer() {
  const app = express2();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  app.use(express2.json({ limit: "10mb" }));
  app.use(express2.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/api", apiRouter);
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path3.resolve(__dirname, "dist");
    app.use(express2.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path3.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GlobalWeb Studio Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
