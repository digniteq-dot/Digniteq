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

    if (!formData.clientName || !formData.businessName || !formData.email) {
      setFormError("Please fill out all required fields (Name, Business Name, and Email).");
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
      <div className="min-h-screen bg-white pt-28 pb-24 px-4 md:px-12 font-inter text-black print:p-0 print:m-0">
        <div className="max-w-4xl mx-auto print:max-w-none print:w-full">
          
          {/* Header Controls (Hidden on Print) */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12 pb-6 border-b border-slate-100 gap-4 print:hidden">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Generated Proposal</h1>
              <p className="text-slate-500 text-sm mt-1">Ready for review and printing.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handlePrint}
                className="bg-black hover:bg-slate-800 text-white font-sans text-sm font-semibold px-6 py-2.5 transition-colors"
              >
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
                className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-sans text-sm font-semibold px-6 py-2.5 transition-colors"
              >
                Create New
              </button>
            </div>
          </div>

          {/* Professional Proposal Layout */}
          <div id="proposal-document" className="bg-white px-4 md:px-12 py-8 print:p-0">
            
            {/* Letterhead Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-10">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-black uppercase mb-1">Digniteq</h2>
                <p className="text-slate-600 text-sm">Digital Agency</p>
                <p className="text-slate-500 text-xs mt-1">digniteq.com | contact@digniteq.com</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Proposal Document</span>
                <p className="text-black text-sm font-semibold">Ref: PRO-{submittedProposal._id?.slice(-6).toUpperCase()}</p>
                <p className="text-slate-500 text-xs mt-1">Date: {new Date(submittedProposal.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Client info & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3 border-b border-slate-200 pb-2">Prepared For</span>
                <h3 className="text-xl font-bold text-black mb-1">{submittedProposal.clientName}</h3>
                <p className="text-slate-700 font-medium mb-1">{submittedProposal.businessName}</p>
                <p className="text-slate-500 text-sm">{submittedProposal.email}</p>
                {submittedProposal.phone && <p className="text-slate-500 text-sm">{submittedProposal.phone}</p>}
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3 border-b border-slate-200 pb-2">Project Outline</span>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {submittedProposal.description || "Custom business growth and optimization strategy designed for digital enhancement and lead generation."}
                </p>
              </div>
            </div>

            {/* Project Scope & Pricing Table */}
            <div className="mb-12 print:break-inside-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-4 border-b border-slate-200 pb-2">Scope of Services</span>
              
              <div className="space-y-6">
                {submittedProposal.selectedServices.map((service, index) => (
                  <div key={index} className={`border border-slate-100 rounded-xl p-8 bg-white print:border-slate-300 print:shadow-none ${index === 1 ? 'print:break-before-page' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-base font-bold text-black">{service.serviceType}</h4>
                        <span className="text-sm text-slate-600 font-medium">{service.planName}</span>
                      </div>
                      <span className="text-lg font-bold text-black">{service.price}</span>
                    </div>
                    {service.features && service.features.length > 0 && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 list-disc list-inside">
                        {service.features.map((feat, fIdx) => (
                          <li key={fIdx} className="text-slate-600 text-sm">
                            {feat}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Next steps */}
            <div className="border-t-2 border-black pt-8 flex flex-col md:flex-row justify-between items-start gap-8 print:break-inside-avoid">
              <div className="max-w-md">
                <h4 className="text-black font-bold mb-2">Next Steps & Terms</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This proposal is valid for 14 days from the date of issue. To proceed, please authorize below. Our team will contact you within 24 hours to commence the onboarding process.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-8 py-6 text-right min-w-[280px]">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Total Investment</span>
                <span className="text-3xl font-black text-black">{submittedProposal.totalPrice}</span>
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-20 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 print:break-inside-avoid print:mt-12">
              <div>
                <div className="h-16 border-b border-black mb-2"></div>
                <p className="text-slate-800 text-sm font-bold">Digniteq Representative</p>
                <p className="text-slate-500 text-xs mt-1">Authorized Signature</p>
              </div>
              <div>
                <div className="h-16 border-b border-black mb-2"></div>
                <p className="text-slate-800 text-sm font-bold">{submittedProposal.clientName}</p>
                <p className="text-slate-500 text-xs mt-1">Client Authorization</p>
              </div>
            </div>

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
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Phone Number (Optional)</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
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
