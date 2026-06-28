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
    budget: "",
    address: "",
    leadSource: "",
  });

  // Available services fetched from pricing API
  const [pricingPlans, setPricingPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState({});
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Status after submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [customLeadSource, setCustomLeadSource] = useState("");

  useEffect(() => {
    async function fetchPricing() {
      try {
        const data = await apiFetch("/pricing");
        if (data && data.length > 0) {
          const sorted = data.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          const serviceMapping = {
            "website-design": "Website Development",
            "branding": "Logo Design",
            "smm-strategy": "Social Media Management",
            "seo-strategy": "SEO Optimization"
          };

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
      if (next[serviceLabel]) {
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

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError("");

    if (!formData.clientName || !formData.businessName || !formData.budget || !formData.email || !formData.phone || !formData.leadSource) {
      setFormError("Please fill out all required fields: Name, Business, Email, Phone, Budget, and Lead Source.");
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    if (formData.leadSource === "Other" && !customLeadSource.trim()) {
      setFormError("Please specify where you heard about us in the custom input field.");
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    const cleanPhone = formData.phone.replace(/[^\d]/g, "");
    if (cleanPhone.length !== 10) {
      setFormError("Phone number must be exactly 10 digits.");
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    const selectedList = Object.entries(selectedPlans).map(([serviceLabel, plan]) => ({
      serviceType: serviceLabel,
      planName: plan.planName,
      price: plan.price,
      features: plan.features || [],
      details: plan.desc || "Professional Service"
    }));

    if (selectedList.length === 0) {
      setFormError("Please select at least one service from the configuration grid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        leadSource: formData.leadSource === "Other" ? `Other: ${customLeadSource}` : formData.leadSource,
        selectedServices: selectedList,
        status: "new"
      };

      await apiFetch("/proposal", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);
      setFormError("An error occurred while sending your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    let currencySymbol = "₹";
    Object.values(selectedPlans).forEach(plan => {
      if (plan && plan.price) {
        const numericStr = plan.price.replace(/[^\d]/g, "");
        const val = parseInt(numericStr, 10);
        if (!isNaN(val)) {
          total += val;
        }
        if (plan.price.includes("$")) {
          currencySymbol = "$";
        }
      }
    });
    return total > 0 ? `${currencySymbol}${total.toLocaleString()}` : null;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-transparent relative overflow-hidden flex items-center justify-center font-inter pt-32 pb-20 px-4">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-2xl bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-[2.5rem] text-center shadow-2xl backdrop-blur-2xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-pulse">
            ✓
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight mb-3">
            Request Received
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed text-base max-w-lg mx-auto">
            Thank you, <span className="text-white font-semibold">{formData.clientName}</span>! Your service proposal request for <span className="text-white font-semibold">{formData.businessName}</span> has been transmitted successfully.
          </p>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 mb-8 text-left max-w-md mx-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 border-b border-white/5 pb-2">Selected Services Summary</h4>
            <div className="space-y-2">
              {Object.entries(selectedPlans).map(([service, plan]) => (
                <div key={service} className="flex justify-between text-sm">
                  <span className="text-white/80 font-medium">{service}</span>
                  <span className="text-white/50">{plan.planName} ({plan.price})</span>
                </div>
              ))}
              <div className="border-t border-white/5 pt-2 mt-2 flex justify-between text-sm font-bold text-white">
                <span>Estimated Value:</span>
                <span className="text-blue-400">{calculateTotal() || "Negotiable"}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()} 
            className="group relative inline-flex items-center justify-center px-8 py-3.5 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02]"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden pt-28 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-blue-500/30 font-inter">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 mb-4 inline-block">
            Service Configurator
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white mb-4">
            Let's build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">vision</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg leading-relaxed">
            Configure your dream setup, check rates in real time, and request a detailed proposal in minutes.
          </p>
        </div>

        {formError && (
          <div className="max-w-7xl mx-auto w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-pulse">
            <span className="text-red-400 text-lg">⚠️</span>
            <p className="text-red-400 text-sm font-medium">{formError}</p>
          </div>
        )}

        {/* ROW 1: Services Grid */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-2xl w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3.5 mb-6 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
              1
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Select Services</h3>
          </div>
          
          {loadingPlans ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {pricingPlans.map((group) => {
                const isSelected = !!selectedPlans[group.serviceLabel];
                const defaultPlan = group.plans[0] || {};
                const selectedPlan = selectedPlans[group.serviceLabel];

                return (
                  <div 
                    key={group.serviceLabel}
                    onClick={() => !isSelected && handlePlanToggle(group.serviceLabel, defaultPlan)}
                    className={`relative group p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                      isSelected 
                        ? "bg-blue-500/[0.04] border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]" 
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-indigo-500/[0.02] pointer-events-none" />
                    )}

                    <div className="flex justify-between items-center mb-3 relative z-10">
                      <h4 className={`text-base font-bold transition-colors ${isSelected ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                        {group.serviceLabel}
                      </h4>
                      
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlanToggle(group.serviceLabel, defaultPlan);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0 text-[10px] ${
                          isSelected ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]" : "bg-white/5 text-transparent border border-white/20 group-hover:border-white/40"
                        }`}
                      >
                        ✓
                      </button>
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col justify-end">
                      {isSelected ? (
                        <div className="mt-2 space-y-3" onClick={e => e.stopPropagation()}>
                          <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                            {group.plans.map((p) => {
                              const isTierSelected = selectedPlan.planName === p.planName;
                              return (
                                <button
                                  key={p.planName}
                                  type="button"
                                  onClick={() => handlePlanSelectChange(group.serviceLabel, p.planName, group.plans)}
                                  className={`flex-1 px-1.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all text-center ${
                                    isTierSelected 
                                      ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]" 
                                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                  }`}
                                >
                                  {p.planName.replace(group.serviceLabel, "").trim().split(" ").pop() || p.planName}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5">
                            <span className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Price</span>
                            <span className="text-xs font-extrabold text-blue-400">{selectedPlan.price}</span>
                          </div>
                          <p className="text-white/60 text-[11px] leading-relaxed line-clamp-2" title={selectedPlan.desc}>
                            {selectedPlan.desc}
                          </p>
                        </div>
                      ) : (
                        <p className="text-white/40 text-[11px] leading-relaxed line-clamp-3">
                          {defaultPlan.desc || "Select service to customize options and view details."}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ROW 2: Two Column Grid below Services */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-7xl mx-auto">
          
          {/* LEFT COLUMN: Client Details Form (8 cols) */}
          <div className="lg:col-span-8 bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="flex items-center gap-3.5 mb-6 relative z-10 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/30">
                2
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">Client Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 relative z-10">
              
              {/* Client Name */}
              <div className="flex flex-col gap-1.5 group col-span-1">
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Client Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none group-focus-within:text-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </span>
                  <input 
                    type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} required 
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder-white/20" 
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Business Name */}
              <div className="flex flex-col gap-1.5 group col-span-1">
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Business Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none group-focus-within:text-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </span>
                  <input 
                    type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} required 
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder-white/20" 
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 group col-span-1">
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none group-focus-within:text-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </span>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleInputChange} required
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder-white/20" 
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5 group col-span-1">
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Phone Number * (10 Digits)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none group-focus-within:text-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </span>
                  <input 
                    type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required maxLength={15}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder-white/20" 
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              {/* Estimated Budget */}
              <div className="flex flex-col gap-1.5 group col-span-1">
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Estimated Budget *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none group-focus-within:text-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </span>
                  <input 
                    type="text" name="budget" value={formData.budget} onChange={handleInputChange} required 
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder-white/20" 
                    placeholder="e.g. ₹50,000 or $1,500" 
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5 group col-span-1">
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Address (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none group-focus-within:text-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </span>
                  <input 
                    type="text" name="address" value={formData.address} onChange={handleInputChange} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder-white/20" 
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Lead Source */}
              <div className="flex flex-col gap-1.5 group col-span-1">
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Where did you hear about us? *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none group-focus-within:text-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                    </svg>
                  </span>
                  <select 
                    name="leadSource" value={formData.leadSource} onChange={handleInputChange} required
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white/80 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="text-white/40">Select source...</option>
                    <option value="Google Search" className="bg-[#0f172a] text-white">Google Search</option>
                    <option value="Instagram" className="bg-[#0f172a] text-white">Instagram</option>
                    <option value="LinkedIn" className="bg-[#0f172a] text-white">LinkedIn</option>
                    <option value="Facebook" className="bg-[#0f172a] text-white">Facebook</option>
                    <option value="Friend Referral" className="bg-[#0f172a] text-white">Friend Referral</option>
                    <option value="YouTube" className="bg-[#0f172a] text-white">YouTube</option>
                    <option value="Other" className="bg-[#0f172a] text-white">Other</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Conditional Specify Field */}
              {formData.leadSource === "Other" && (
                <div className="flex flex-col gap-1.5 group col-span-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                    Please Specify Lead Source *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none group-focus-within:text-blue-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </span>
                    <input 
                      type="text" 
                      value={customLeadSource} 
                      onChange={(e) => setCustomLeadSource(e.target.value)} 
                      required 
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder-white/20" 
                      placeholder="e.g. Google Ads, Newsletter, Friend's name"
                    />
                  </div>
                </div>
              )}

              {/* Description (Spans 2 cols) */}
              <div className="flex flex-col gap-1.5 group col-span-1 md:col-span-2">
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Brief Project Scope (Optional)
                </label>
                <textarea 
                  name="description" value={formData.description} onChange={handleInputChange} rows={3} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all placeholder-white/20 resize-none" 
                  placeholder="Describe your design or development goals..."
                />
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Live Estimate (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-2xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] pointer-events-none"></div>
              
              <div className="flex items-center gap-2.5 mb-5 border-b border-white/5 pb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Live Estimate</h3>
              </div>

              {Object.keys(selectedPlans).length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 text-white/30 flex items-center justify-center mb-3">
                    +
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed max-w-[180px]">
                    Configure services in middle grid to view live pricing.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {Object.entries(selectedPlans).map(([service, plan]) => (
                      <div key={service} className="flex flex-col gap-0.5 bg-black/20 p-2.5 rounded-xl border border-white/5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 font-semibold truncate max-w-[150px]">{service}</span>
                          <span className="text-blue-400 font-extrabold flex-shrink-0">{plan.price}</span>
                        </div>
                        <span className="text-white/40 text-[9px] uppercase tracking-wider">{plan.planName}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex flex-col gap-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Est. Subtotal</span>
                      <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                        {calculateTotal() || "Negotiable"}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/30 italic">
                      Final details and custom adjustments calculated post-submission.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-white/5">
                <button 
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting} 
                  className={`group relative w-full inline-flex items-center justify-center px-6 py-3.5 font-bold text-white transition-all duration-300 rounded-xl overflow-hidden shadow-xl text-xs uppercase tracking-widest ${
                    isSubmitting || Object.keys(selectedPlans).length === 0
                      ? "bg-white/5 border border-white/5 text-white/30 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(79,70,229,0.3)] cursor-pointer"
                  }`}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Transmitting...
                      </>
                    ) : (
                      <>
                        Request Proposal
                        <span className="group-hover:translate-x-1 transition-transform">➔</span>
                      </>
                    )}
                  </span>
                </button>
                <p className="text-center text-[9px] text-white/30 mt-3 tracking-wider">
                  Typical response time: &lt; 24 hours.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
