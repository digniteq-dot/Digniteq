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

  const handleSubmit = async (e) => {
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

    setIsSubmitting(true);

    try {
      const payload = {
        clientName: formData.clientName,
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        selectedServices: selectedList,
        totalPrice: `₹${calculateTotal().toLocaleString("en-IN")}`,
        status: "new"
      };

      const res = await apiFetch("/proposal", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setSubmittedProposal(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);
      setFormError("An error occurred while generating your proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Render Generated Proposal Sheet
  if (submittedProposal) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-12 font-inter text-slate-800 print:bg-white print:p-0 print:py-0">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Controls (Hidden on Print) */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-200 gap-4 print:hidden">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Proposal Generated</h1>
              <p className="text-slate-500 text-sm mt-1">Review the details below. Ready for client presentation.</p>
            </div>
            <div className="flex gap-3">
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
            </div>
          </div>

          {/* Professional Proposal Layout (The Document) */}
          <div id="proposal-document" className="bg-white shadow-2xl print:shadow-none rounded-xl print:rounded-none overflow-hidden border border-slate-200 print:border-none">
            
            {/* Top Brand Banner */}
            <div className="h-4 bg-blue-600 w-full print:bg-blue-600 print:block" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>

            <div className="p-10 md:p-14">
              {/* Letterhead Header */}
              <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-100 pb-10 mb-10 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg print:shadow-none" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    D
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Digniteq</h2>
                    <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-0.5">Premium Digital Agency</p>
                    <p className="text-slate-500 text-xs mt-1 font-medium">digniteq.in &nbsp;&bull;&nbsp; contact@digniteq.in</p>
                  </div>
                </div>
                <div className="text-left md:text-right bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Document Type</span>
                  <p className="text-slate-900 font-black text-lg uppercase tracking-tight mb-2">Service Proposal</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:text-right">
                    <span className="text-slate-500">Ref No:</span>
                    <span className="text-slate-900 font-bold">#PRO-{submittedProposal._id?.slice(-6).toUpperCase()}</span>
                    <span className="text-slate-500">Date:</span>
                    <span className="text-slate-900 font-bold">{new Date(submittedProposal.createdAt).toLocaleDateString()}</span>
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
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{submittedProposal.clientName}</h3>
                  <p className="text-slate-600 font-bold text-sm uppercase tracking-wider mb-3">{submittedProposal.businessName}</p>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      {submittedProposal.email}
                    </p>
                    {submittedProposal.phone && (
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        {submittedProposal.phone}
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
                    {submittedProposal.description || "Custom business growth and optimization strategy designed for digital enhancement and lead generation targeting specific market goals."}
                  </p>
                </div>
              </div>

              {/* Project Scope & Pricing Table */}
              <div className="mb-14 print:break-inside-auto">
                <h3 className="text-xl font-black text-slate-900 mb-6 border-b-2 border-slate-900 pb-3 uppercase tracking-tight">Scope of Work</h3>
                
                <div className="space-y-6">
                  {submittedProposal.selectedServices.map((service, index) => (
                    <div key={index} className={`border border-slate-200 rounded-2xl p-6 bg-white hover:border-blue-300 transition-colors print:border-slate-300 print:shadow-none ${index === 1 ? 'print:break-before-page print:mt-12' : ''}`}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold print:border print:border-blue-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{service.serviceType}</h4>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-2 py-1 bg-blue-50 rounded-md print:border print:border-blue-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{service.planName}</span>
                          </div>
                        </div>
                        <span className="text-2xl font-black text-slate-900">{service.price}</span>
                      </div>
                      
                      {service.features && service.features.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-slate-100 pl-14 print:pl-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Included Deliverables</span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            {service.features.map((feat, fIdx) => (
                              <li key={fIdx} className="text-slate-600 text-sm flex items-start gap-2">
                                <svg className="text-blue-500 mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Next steps */}
              <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 print:break-inside-avoid">
                <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                  <h4 className="text-slate-900 font-black uppercase tracking-tight mb-3">Terms & Next Steps</h4>
                  <ul className="text-slate-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      This proposal is valid for 14 days from the date of issue.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      To proceed, please authorize the document below.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      Our project manager will contact you within 24 hours of approval.
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-600 text-white rounded-2xl p-8 flex flex-col justify-center min-w-[300px] shadow-lg print:border-2 print:border-black print:text-black print:shadow-none print:bg-transparent" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <span className="text-xs font-bold text-blue-200 print:text-slate-500 uppercase tracking-widest block mb-2">Total Estimated Investment</span>
                  <span className="text-4xl font-black">{submittedProposal.totalPrice}</span>
                  <span className="text-xs text-blue-200 print:text-slate-500 mt-2 block">* Taxes may apply as per local regulations</span>
                </div>
              </div>

              {/* Signature Block */}
              <div className="mt-16 pt-10 border-t-2 border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-16 print:break-inside-avoid print:mt-12">
                <div>
                  <div className="h-12 border-b border-slate-300 mb-3 relative">
                    {/* Fake signature for aesthetic */}
                    <span className="absolute bottom-1 left-2 font-['Brush_Script_MT',cursive] text-2xl text-slate-800/60 -rotate-3">Digniteq Team</span>
                  </div>
                  <p className="text-slate-900 text-sm font-black uppercase tracking-tight">Digniteq Representative</p>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">Authorized Signature</p>
                </div>
                <div>
                  <div className="h-12 border-b border-slate-300 mb-3 relative"></div>
                  <p className="text-slate-900 text-sm font-black uppercase tracking-tight">{submittedProposal.clientName}</p>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">Client Authorization</p>
                </div>
              </div>

            </div>
            
            {/* Bottom Brand Banner */}
            <div className="h-2 bg-slate-900 w-full print:bg-slate-900 print:block" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
          </div>
        </div>
      </div>
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

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
          
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
