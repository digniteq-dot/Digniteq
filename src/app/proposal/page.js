"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

export default function ProposalPage() {
  // Client details
  const [formData, setFormData] = useState({
    clientName: "",
    businessName: "",
    email: "",
    phone: "",
    description: "",
  });

  // Available services fetched from pricing API
  const [pricingPlans, setPricingPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState({});
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Status after submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittedProposal, setSubmittedProposal] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function fetchPricing() {
      try {
        const data = await apiFetch("/pricing");
        if (data && data.length > 0) {
          // Group plans by serviceType
          const sorted = data.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          // Map serviceType to display labels
          const serviceMapping = {
            "website-design": "Website Design",
            "branding": "Logo & Branding",
            "smm-strategy": "Social Media Marketing",
            "seo-strategy": "SEO Strategy"
          };

          // Find distinct services
          const grouped = {};
          sorted.forEach(plan => {
            const groupName = serviceMapping[plan.serviceType] || plan.serviceType;
            if (!grouped[groupName]) {
              grouped[groupName] = {
                serviceType: plan.serviceType,
                serviceLabel: groupName,
                plans: []
              };
            }
            grouped[groupName].plans.push(plan);
          });

          setPricingPlans(Object.values(grouped));
        }
      } catch (err) {
        console.error("Failed to fetch pricing plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPricing();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanToggle = (serviceLabel, plan) => {
    setSelectedPlans((prev) => {
      const next = { ...prev };
      if (next[serviceLabel] && next[serviceLabel].planName === plan.planName) {
        // Deselect if clicked again
        delete next[serviceLabel];
      } else {
        next[serviceLabel] = plan;
      }
      return next;
    });
  };

  const handlePlanSelectChange = (serviceLabel, planName, plans) => {
    const selectedPlan = plans.find(p => p.planName === planName);
    if (selectedPlan) {
      setSelectedPlans((prev) => ({
        ...prev,
        [serviceLabel]: selectedPlan
      }));
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    let total = 0;
    Object.values(selectedPlans).forEach((plan) => {
      // Parse numeric price from string e.g. "₹29,999" or "Rs.7,000/mo"
      const cleanPrice = parseInt(plan.price.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(cleanPrice)) {
        total += cleanPrice;
      }
    });
    return total;
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.clientName || !formData.businessName || !formData.email || !formData.phone) {
      setFormError("Please fill out all required fields (Name, Business Name, Email, and Phone).");
      return;
    }

    const selectedList = Object.entries(selectedPlans).map(([serviceLabel, plan]) => ({
      serviceType: serviceLabel,
      planName: plan.planName,
      price: plan.price,
      features: plan.features || []
    }));

    if (selectedList.length === 0) {
      setFormError("Please select at least one service plan to generate a proposal.");
      return;
    }

    setPreviewData({
      ...formData,
      selectedServices: selectedList,
      totalPrice: `₹${calculateTotal().toLocaleString("en-IN")}`,
      _id: "PREVIEW",
      createdAt: new Date().toISOString()
    });
    setPreviewMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        clientName: previewData.clientName,
        businessName: previewData.businessName,
        email: previewData.email,
        phone: previewData.phone,
        description: previewData.description,
        selectedServices: previewData.selectedServices,
        totalPrice: previewData.totalPrice,
        status: "new"
      };

      const res = await apiFetch("/proposal", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setSubmittedProposal(res);
      setPreviewMode(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);
      alert("An error occurred while saving your proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Render Generated Proposal Sheet (Preview or Final)
  const displayProposal = submittedProposal || (previewMode ? previewData : null);

  if (displayProposal) {
    const isFinal = !!submittedProposal;
    return (
      <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0; /* Removes default browser headers/footers */
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-slate-100 transition-all transform scale-100">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2 tracking-tight">Finalize Proposal?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed font-medium">
              This will submit the proposal to the admin dashboard and generate a permanent reference number.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  handleFinalSubmit();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#f8fafc] pt-32 pb-12 px-4 md:px-12 font-inter text-slate-800 print:bg-white print:p-0 print:py-0">
        <div className="max-w-[794px] mx-auto">
          
          {/* Header Controls (Hidden on Print) */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-200 gap-4 print:hidden">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {isFinal ? "Proposal Generated" : "Proposal Preview"}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {isFinal ? "Review the details below. Ready for client presentation." : "Review your proposal before finalizing."}
              </p>
            </div>
            <div className="flex gap-3">
              {!isFinal ? (
                <>
                  <button 
                    onClick={() => setPreviewMode(false)}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                  >
                    Edit Details
                  </button>
                  <button 
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    {isSubmitting ? "Saving..." : "Save Final Proposal"}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print / Save PDF
                  </button>
                  <button 
                    onClick={() => {
                      setSubmittedProposal(null);
                      setPreviewMode(false);
                      setSelectedPlans({});
                      setFormData({
                        clientName: "",
                        businessName: "",
                        email: "",
                        phone: "",
                        description: "",
                      });
                    }}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                  >
                    Create New
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Professional Proposal Layout (The Document) */}
          <div id="proposal-document" className="flex flex-col gap-10 print:gap-0">
            
            {/* PAGE 1: Intro & Overview */}
            <div className="bg-white shadow-xl print:shadow-none border border-slate-200 print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col">
              <div className="h-4 bg-blue-600 w-full print:bg-blue-600 print:block shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>

              <div className="p-10 md:p-14 print:p-12 flex-1">
                {/* Letterhead Header */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-100 pb-10 mb-10 gap-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src="/assets/logo.png" 
                      alt="Digniteq Logo" 
                      className="h-14 w-auto object-contain"
                      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                    />
                  </div>
                  <div className="text-left md:text-right bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Document Type</span>
                    <p className="text-slate-900 font-black text-lg uppercase tracking-tight mb-2">Service Proposal</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:text-right">
                      <span className="text-slate-500">Ref No:</span>
                      <span className="text-slate-900 font-bold">#PRO-{displayProposal._id?.slice(-6).toUpperCase()}</span>
                      <span className="text-slate-500">Date:</span>
                      <span className="text-slate-900 font-bold">{new Date(displayProposal.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Client info & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 bg-slate-50 p-8 rounded-2xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                  <div>
                    <span className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Prepared For
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{displayProposal.clientName}</h3>
                    <p className="text-slate-600 font-bold text-sm uppercase tracking-wider mb-3">{displayProposal.businessName}</p>
                    <div className="space-y-1">
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        {displayProposal.email}
                      </p>
                      {displayProposal.phone && (
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          {displayProposal.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Project Outline
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed bg-white p-4 rounded-xl border border-slate-200 print:border-none print:p-0 print:bg-transparent shadow-sm print:shadow-none">
                      {displayProposal.description || "Custom business growth and optimization strategy designed for digital enhancement and lead generation targeting specific market goals."}
                    </p>
                  </div>
                </div>

                <div className="space-y-10">
                  {/* Intro Note */}
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">A Note from Digniteq</h3>
                    <p className="leading-relaxed mb-3 text-slate-600">
                      We genuinely appreciate the trust you are placing in Digniteq, and we want this proposal to feel like the beginning of a real partnership, not just a transaction.
                    </p>
                    <p className="leading-relaxed mb-3 text-slate-600">
                      We have put this document together after carefully thinking about what you need and how we can best help you get there. Every section is written to give you complete clarity on what we will do, how we will do it, and what it will cost, no hidden surprises, no vague commitments.
                    </p>
                    <p className="leading-relaxed text-slate-600">
                      If something in here does not quite match what you had in mind, please tell us. We are flexible, we listen, and we genuinely want to get this right for you.
                    </p>
                  </section>

                  {/* About Digniteq */}
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">About Digniteq</h3>
                    <p className="leading-relaxed mb-3 text-slate-600">
                      Digniteq is a premium digital agency that works with businesses, from local shops to growing companies, to help them show up better online. We are a small, focused team that takes ownership of what we deliver.
                    </p>
                    <p className="font-semibold mb-2 text-slate-800">We help clients with:</p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                      <li>Custom website design and development</li>
                      <li>E-commerce platforms and online stores</li>
                      <li>Search engine optimisation (SEO)</li>
                      <li>Social media marketing and content</li>
                      <li>Branding and digital strategy</li>
                      <li>Website maintenance and ongoing support</li>
                    </ul>
                  </section>

                </div>
              </div>
            </div>

            {/* PAGE 2: What We Understood */}
            <div className="bg-white shadow-xl print:shadow-none border border-slate-200 print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col mt-10 print:mt-0">
              <div className="h-4 bg-blue-600 w-full print:bg-blue-600 print:block shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
              <div className="px-10 md:px-14 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digniteq — Service Proposal</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 2</span>
              </div>
              <div className="p-10 md:p-14 print:p-12 flex-1">
                <section>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">What We Understood from Your Brief</h3>
                  <p className="leading-relaxed mb-3 text-slate-600">
                    Based on our conversation, here is what we believe you are looking for. Please do correct us if we have missed anything or got something wrong, it is important that we are aligned from the start.
                  </p>
                  {displayProposal.description ? (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 italic text-slate-600 mb-4">
                      "{displayProposal.description}"
                    </div>
                  ) : null}
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-600">
                    <li>A professionally designed website that represents your business well</li>
                    <li>A site that works smoothly on mobile phones, tablets, and desktops</li>
                    <li>Clear pages that explain who you are, what you offer, and how to reach you</li>
                    <li>A contact form so visitors can enquire directly</li>
                    <li>A site that is findable on Google, built with basic SEO in mind</li>
                    <li>Secure, fast, and reliable hosting setup</li>
                  </ul>
                  <p className="leading-relaxed text-slate-600">
                    If there are specific features or pages you have in mind beyond these, we can discuss and adjust the scope accordingly before we begin.
                  </p>
                </section>
              </div>
            </div>

            {/* PAGE 3: Scope of Work */}
            <div className="bg-white shadow-xl print:shadow-none border border-slate-200 print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col mt-10 print:mt-0">
              <div className="h-4 bg-blue-600 w-full print:bg-blue-600 print:block shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
              <div className="px-10 md:px-14 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digniteq — Service Proposal</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 3</span>
              </div>
              <div className="p-10 md:p-14 print:p-12 flex-1">
                {/* Scope of Work */}
                <section>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">What We Will Do - Scope of Work</h3>
                  
                  <div className="space-y-6 mb-10">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">Phase 1: Discovery and Planning</h4>
                      <p className="leading-relaxed text-slate-600">We start by sitting down with you, either in person or on a call, to understand your goals, your audience, and what success looks like for you. We look at your competitors, map out the pages your site will need, and agree on a content structure before any design work begins.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">Phase 2: Demo Website</h4>
                      <p className="leading-relaxed mb-2 text-slate-600">Once we have a clear picture, our developers creates demo of how your website will look. We work with your brand colours, logo, and the kind of feel you want, professional, friendly, bold, minimal, whatever fits your business. You will get to review the designs and give us feedback before we build anything.</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li>Custom UI design for desktop and mobile views</li>
                        <li>Demo shared for your review before development starts</li>
                        <li>Up to 2 rounds of design revisions included</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">Phase 3: Development</h4>
                      <p className="leading-relaxed mb-2 text-slate-600">This is where we build the actual website, clean code, fast loading pages, and a simple backend so you can update content yourself if you ever need to.</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li>Responsive website development (React.js, Javascript, Tailwind CSS, Express.Js, Node.js)</li>
                        <li>CMS integration</li>
                        <li>Contact form with email notification</li>
                        <li>Basic on-page SEO, meta titles, descriptions, image alt text, sitemap</li>
                        <li>Speed optimisation</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">Phase 4: Testing, Launch, and Handover</h4>
                      <p className="leading-relaxed mb-2 text-slate-600">Before anything goes live, we test the site carefully across browsers and devices. Once you are happy, we launch, and then walk you through how everything works so you feel confident managing it.</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li>Cross-browser and cross-device quality testing</li>
                        <li>Pre-launch review with client sign-off</li>
                        <li>Domain and hosting configuration</li>
                        <li>30-minute walkthrough session with your team</li>
                        <li>90-days of post-launch support included</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* PAGE 4: Details & Timelines */}
            <div className="bg-white shadow-xl print:shadow-none border border-slate-200 print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col mt-10 print:mt-0">
              <div className="h-4 bg-blue-600 w-full print:bg-blue-600 print:block shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
              <div className="px-10 md:px-14 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digniteq — Service Proposal</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 4</span>
              </div>
              <div className="p-10 md:p-14 print:p-12 flex-1">
                <div className="space-y-12">
                  {/* What You Will Receive */}
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">What You Will Receive</h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-3 font-bold text-slate-900">#</th>
                            <th className="p-3 font-bold text-slate-900">Deliverable</th>
                            <th className="p-3 font-bold text-slate-900">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                          <tr><td className="p-3">1</td><td className="p-3 font-medium text-slate-800">Demo Website</td><td className="p-3">For Approval</td></tr>
                          <tr><td className="p-3">2</td><td className="p-3 font-medium text-slate-800">Fully developed, responsive website</td><td className="p-3">Live on your domain</td></tr>
                          <tr><td className="p-3">3</td><td className="p-3 font-medium text-slate-800">CMS access with admin training</td><td className="p-3">30-minute walkthrough included</td></tr>
                          <tr><td className="p-3">4</td><td className="p-3 font-medium text-slate-800">On-page SEO setup on all pages</td><td className="p-3">Titles, descriptions, sitemap</td></tr>
                          <tr><td className="p-3">5</td><td className="p-3 font-medium text-slate-800">90 days post-launch support</td><td className="p-3">Bug fixes and minor adjustments</td></tr>
                          <tr><td className="p-3">6</td><td className="p-3 font-medium text-slate-800">Source files and documentation</td><td className="p-3">Handed over at project close</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Project Timeline */}
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Project Timeline</h3>
                    <p className="leading-relaxed mb-4 text-slate-600">
                      We estimate the project will take 4 to 6 weeks from the day we receive your signed agreement and the advance payment. The exact timeline depends on how quickly content is provided and how smooth the feedback rounds are, we will always keep you informed.
                    </p>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg mb-4">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-3 font-bold text-slate-900">#</th>
                            <th className="p-3 font-bold text-slate-900">Phase</th>
                            <th className="p-3 font-bold text-slate-900">Duration</th>
                            <th className="p-3 font-bold text-slate-900">Approx. Week</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                          <tr><td className="p-3">1</td><td className="p-3 font-medium text-slate-800">Discovery and planning</td><td className="p-3">3–4 days</td><td className="p-3">Week 1</td></tr>
                          <tr><td className="p-3">2</td><td className="p-3 font-medium text-slate-800">Design and mockups</td><td className="p-3">5–7 days</td><td className="p-3">Week 1–2</td></tr>
                          <tr><td className="p-3">3</td><td className="p-3 font-medium text-slate-800">Client feedback and revisions</td><td className="p-3">2–3 days</td><td className="p-3">Week 2–3</td></tr>
                          <tr><td className="p-3">4</td><td className="p-3 font-medium text-slate-800">Development and build</td><td className="p-3">7–10 days</td><td className="p-3">Week 3–4</td></tr>
                          <tr><td className="p-3">5</td><td className="p-3 font-medium text-slate-800">Content upload and QA testing</td><td className="p-3">2–3 days</td><td className="p-3">Week 5</td></tr>
                          <tr><td className="p-3">6</td><td className="p-3 font-medium text-slate-800">Launch and client handover</td><td className="p-3">1–2 days</td><td className="p-3">Week 5–6</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm italic text-slate-500">
                      Please note that timelines are subject to timely feedback from client side and readiness of content such as text, images, and logos.
                    </p>
                  </section>

                  {/* Investment */}
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Investment</h3>
                    <p className="leading-relaxed mb-4 text-slate-600">
                      We have worked hard to keep this pricing fair and transparent. Below is a full breakdown of what is included and what each component costs based on your selected services.
                    </p>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-3 font-bold text-slate-900">#</th>
                            <th className="p-3 font-bold text-slate-900">Component</th>
                            <th className="p-3 font-bold text-slate-900 text-right">Amount (INR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayProposal.selectedServices.map((service, idx) => (
                            <tr key={idx}>
                              <td className="p-3 text-slate-600">{idx + 1}</td>
                              <td className="p-3">
                                <div className="font-bold text-slate-800">{service.serviceType}</div>
                                <div className="text-sm text-slate-500">{service.planName}</div>
                              </td>
                              <td className="p-3 font-bold text-right text-slate-800">{service.price}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 border-t-2 border-slate-300">
                            <td colSpan="2" className="p-4 text-right font-black uppercase tracking-widest text-slate-600 text-xs">Total Investment</td>
                            <td className="p-4 font-black text-slate-900 text-xl text-right">{displayProposal.totalPrice}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* PAGE 5: Terms & Signatures */}
            <div className="bg-white shadow-xl print:shadow-none border border-slate-200 print:border-none relative overflow-hidden min-h-[1123px] flex flex-col print:break-after-avoid mt-10 print:mt-0">
              <div className="h-4 bg-blue-600 w-full print:bg-blue-600 print:block shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
              <div className="px-10 md:px-14 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digniteq — Service Proposal</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 5</span>
              </div>
              <div className="p-10 md:p-14 print:p-12 flex-1">
                <div className="space-y-12">
                  {/* Payment Schedule */}
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Payment Schedule</h3>
                    <p className="leading-relaxed mb-3 text-slate-600">We have kept the payment structure simple and fair for both sides:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-600">
                      <li>50% advance on signing of the agreement, this confirms the project and we begin work within 2 business days</li>
                      <li>30% on your approval of the final web design</li>
                      <li>20% on website launch and project handover</li>
                    </ul>
                    <p className="text-sm italic text-slate-500">
                      Domain registration and annual hosting charges are not included in the above and will be billed at actual cost.
                    </p>
                  </section>

                  {/* Terms and Conditions */}
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Terms and Conditions</h3>
                    <p className="leading-relaxed mb-3 text-slate-600">We believe in keeping things straightforward. Here is what both sides are committing to:</p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600">
                      <li>You will provide all required content, text, images, and logos, within 5 business days of project start. Delays in content can push the timeline.</li>
                      <li>Two rounds of design revisions are included. If more are needed, additional revisions are billed at Rs. 500 per round.</li>
                      <li>Any new features or pages added after work has started will be scoped and quoted separately.</li>
                      <li>Digniteq may include the completed website in our portfolio unless you request otherwise in writing.</li>
                      <li>Full ownership of the website transfers to you upon receipt of the final payment.</li>
                      <li>This proposal is valid for 30 days from the date of issue.</li>
                    </ul>
                  </section>

                  {/* How We Move Forward */}
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">How We Move Forward</h3>
                    <p className="leading-relaxed mb-3 text-slate-600">When you are ready to proceed, here is all you need to do:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-600">
                      <li>Let us know if you have any questions about this proposal, we are happy to discuss</li>
                      <li>Sign the agreement and return it to us</li>
                      <li>Complete the 50% advance payment to kick things off</li>
                      <li>We schedule a kickoff call and begin within 2 business days</li>
                    </ul>
                    <p className="leading-relaxed text-slate-600">
                      We are genuinely looking forward to working with you on this. If you would like to talk through anything before signing, you can reach us at <strong className="text-slate-900">contact@digniteq.in</strong>.
                    </p>
                  </section>

                  {/* Agreement and Acceptance */}
                  <section className="mt-8 border-t-2 border-slate-200 pt-8 print:break-inside-avoid">
                    <h3 className="text-2xl font-black text-slate-900 mb-4">Agreement and Acceptance</h3>
                    <p className="leading-relaxed mb-10 text-slate-600">
                      By signing below, both parties agree to the scope, timeline, and pricing as outlined in this proposal.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
                      <div>
                        <div className="h-16 border-b border-slate-300 mb-3 relative"></div>
                        <p className="text-slate-900 text-sm font-black uppercase tracking-tight">Authorised Signatory — Digniteq</p>
                        <p className="text-slate-500 text-xs mt-1">Date: {new Date(displayProposal.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <div className="h-16 border-b border-slate-300 mb-3 relative"></div>
                        <p className="text-slate-900 text-sm font-black uppercase tracking-tight">Client Signature</p>
                        <p className="text-slate-500 text-xs mt-1">Name & Designation: ________________</p>
                        <p className="text-slate-500 text-xs mt-1">Date: ________________</p>
                      </div>
                    </div>

                    <div className="mt-16 text-center">
                      <p className="font-bold text-slate-800 text-lg">Thank you for your time and for considering Digniteq.</p>
                      <p className="text-slate-500">We look forward to building something you are proud of.</p>
                    </div>
                  </section>
                </div>
              </div>
              
              {/* Bottom Brand Banner */}
              <div className="h-4 bg-slate-900 w-full print:bg-slate-900 print:block mt-auto shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
            </div>

          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#030610] pt-32 pb-24 px-6 md:px-12 selection:bg-blue-500/30 font-inter">
      {/* Background aesthetic blobs */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-blue-500/[0.02] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="font-sans-premium text-[8px] font-black tracking-[0.4em] text-blue-500 uppercase mb-3 block">DYNAMIC CLIENT INTAKE</span>
          <h1 className="font-sans-premium text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Generate Your <span className="text-blue-500">Proposal</span>
          </h1>
          <p className="text-white/40 text-xs mt-3 max-w-md mx-auto uppercase tracking-widest">
            Select your desired services below & generate a customized business development proposal in seconds.
          </p>
        </div>

        <form onSubmit={handlePreview} className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Side: Client Info Form */}
          <div className="w-full lg:w-[45%] flex flex-col gap-6">
            <div className="glass-card p-8 rounded-[30px] border border-white/5 flex flex-col gap-6">
              <h3 className="font-sans text-xs font-black uppercase tracking-widest text-blue-400">Client Details</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Client Name *</label>
                <input 
                  type="text" 
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. John Doe"
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Business Name *</label>
                <input 
                  type="text" 
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Acme Corporation"
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. john@acme.com"
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Phone Number *</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. +91 99999 99999"
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Brief Project Scope / Requirements</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us what you want to achieve..."
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                />
              </div>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-5 py-4 rounded-2xl font-bold uppercase tracking-wider">
                ⚠️ {formError}
              </div>
            )}
          </div>

          {/* Right Side: Service Plan Selector */}
          <div className="w-full lg:w-[55%] flex flex-col gap-6">
            <div className="glass-card p-5 md:p-6 rounded-3xl border border-white/5 flex flex-col gap-5">
              <h3 className="font-sans text-[10px] font-black uppercase tracking-widest text-blue-400">Select Services</h3>
              
              {loadingPlans ? (
                <div className="text-white/30 text-xs animate-pulse">Loading service pricing architecture...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pricingPlans.map((serviceGroup) => {
                    const selectedForGroup = selectedPlans[serviceGroup.serviceLabel];
                    return (
                      <div 
                        key={serviceGroup.serviceLabel} 
                        onClick={() => {
                          if (selectedForGroup) {
                            handlePlanToggle(serviceGroup.serviceLabel, selectedForGroup);
                          } else {
                            handlePlanToggle(serviceGroup.serviceLabel, serviceGroup.plans[0]);
                          }
                        }}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-3 relative overflow-hidden group ${
                          selectedForGroup 
                            ? "bg-blue-500/[0.05] border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.08)]" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                        }`}
                      >
                        {/* Selected Indicator Glow */}
                        {selectedForGroup && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none"></div>
                        )}

                        <div className="flex items-start justify-between relative z-10">
                          <span className={`font-sans text-xs font-black uppercase tracking-wider transition-colors ${selectedForGroup ? "text-blue-400" : "text-white group-hover:text-white/90"}`}>
                            {serviceGroup.serviceLabel}
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedForGroup ? "bg-blue-500 border-blue-500" : "border-white/20"}`}>
                            {selectedForGroup && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            )}
                          </div>
                        </div>

                        {/* Plan dropdown if checked */}
                        <div className={`flex flex-col gap-1.5 transition-all duration-300 relative z-10 ${selectedForGroup ? "opacity-100 h-auto mt-1" : "opacity-50 h-0 overflow-hidden"}`} onClick={(e) => e.stopPropagation()}>
                          <label className="text-white/40 text-[8px] font-bold uppercase tracking-widest">Selected Tier</label>
                          <div className="relative">
                            <select
                              disabled={!selectedForGroup}
                              value={selectedForGroup ? selectedForGroup.planName : ""}
                              onChange={(e) => handlePlanSelectChange(serviceGroup.serviceLabel, e.target.value, serviceGroup.plans)}
                              className="w-full bg-[#030610]/80 border border-white/10 rounded-lg px-2.5 py-2 text-[10px] text-white appearance-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer hover:border-white/20 transition-colors"
                            >
                              {!selectedForGroup && <option value="">(Select Service First)</option>}
                              {serviceGroup.plans.map((p) => (
                                <option key={p.planName} value={p.planName} className="bg-[#030610]">
                                  {p.planName} - {p.price}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                          </div>
                        </div>

                        {/* Show plan details if active */}
                        {selectedForGroup && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1.5 animate-reveal">
                            <span className="text-white/50 text-[9px] uppercase tracking-widest">{selectedForGroup.desc}</span>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              {selectedForGroup.features?.slice(0, 4).map((f, i) => (
                                <span key={i} className="text-[8px] text-blue-400 font-bold uppercase tracking-wider">
                                  ✦ {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total Display & Submit */}
            <div className="glass-card p-8 rounded-[30px] border border-white/5 flex items-center justify-between gap-6">
              <div>
                <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest block mb-1">Estimated Total</span>
                <span className="text-2xl font-black text-white tracking-tighter">
                  ₹{calculateTotal().toLocaleString("en-IN")}
                </span>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-luxury bg-white text-black font-sans-premium text-[11px] font-black uppercase tracking-widest px-10 py-4.5 rounded-full shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isSubmitting ? "Generating..." : "Generate Proposal ➔"}
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
