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
  });

  // Available services fetched from pricing API
  const [pricingPlans, setPricingPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState({});
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Status after submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

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
    e.preventDefault();
    setFormError("");

    if (!formData.clientName || !formData.businessName || !formData.budget) {
      setFormError("Please provide Client Name, Business Name, and Budget.");
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
      setFormError("Please select at least one service.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
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
      setFormError("An error occurred while sending your request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-transparent relative overflow-hidden flex items-center justify-center font-inter pt-20">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 glass-card p-10 md:p-16 rounded-[2rem] text-center max-w-xl mx-4 border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">
          <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-[0_0_40px_rgba(74,222,128,0.4)] animate-bounce">
            ✓
          </div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 uppercase tracking-tight mb-4">
            Request Sent
          </h2>
          <p className="text-white/60 mb-10 leading-relaxed text-lg">
            Thank you for reaching out! Our team has received your service request and will be in touch with you shortly to discuss the next steps.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-inter rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden pt-32 pb-24 px-4 sm:px-6 md:px-12 selection:bg-blue-500/30 font-inter">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-12">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">
            Let's build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">vision</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Tell us about your business and select the services you need. We'll craft a customized solution for you.
          </p>
        </div>

        <form onSubmit={handleFinalSubmit} className="grid grid-cols-1 xl:grid-cols-10 gap-8 xl:gap-10 items-start max-w-6xl mx-auto w-full">
          
          {/* LEFT SIDE: Form */}
          <div className="xl:col-span-5 flex flex-col gap-8 order-2 xl:order-1">
            <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 md:p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl flex flex-col">
              {/* Form decorative background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  1
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wider text-white">Your Details</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-x-6 gap-y-5 relative z-10 flex-1">
                
                <div className="flex flex-col gap-2 group sm:col-span-2 xl:col-span-1">
                  <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Client Name *</label>
                  <input 
                    type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} required 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-white/20" 
                    placeholder="John Doe"
                  />
                </div>

                <div className="flex flex-col gap-2 group sm:col-span-2 xl:col-span-1">
                  <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Business Name *</label>
                  <input 
                    type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} required 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-white/20" 
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Email Address</label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleInputChange} 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-white/20" 
                    placeholder="john@example.com"
                  />
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Phone Number</label>
                  <input 
                    type="text" name="phone" value={formData.phone} onChange={handleInputChange} 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-white/20" 
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Estimated Budget *</label>
                  <input 
                    type="text" name="budget" value={formData.budget} onChange={handleInputChange} required 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-white/20" 
                    placeholder="e.g. ₹50,000 or $1,000" 
                  />
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Address (Optional)</label>
                  <input 
                    type="text" name="address" value={formData.address} onChange={handleInputChange} 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-white/20" 
                    placeholder="City, Country"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2 xl:col-span-1 group">
                  <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Brief Project Scope (Optional)</label>
                  <textarea 
                    name="description" value={formData.description} onChange={handleInputChange} rows={3} 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-white/20 resize-none" 
                    placeholder="Tell us what you're looking to achieve..."
                  />
                </div>

              </div>

              {formError && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 relative z-10">
                  <span className="text-red-400">⚠️</span>
                  <p className="text-red-400 text-sm font-medium">{formError}</p>
                </div>
              )}
            </div>
            
            {/* CTA Button moved below form */}
            <div className="flex flex-col items-center xl:items-start gap-4 mt-2">
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 rounded-full w-full text-lg overflow-hidden shadow-2xl ${
                  isSubmitting ? "bg-white/10 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)]"
                }`}
              >
                {!isSubmitting && (
                  <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></span>
                )}
                
                <span className="relative flex items-center gap-3 uppercase tracking-widest text-sm">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>Send Request <span className="group-hover:translate-x-1 transition-transform">➔</span></>
                  )}
                </span>
              </button>
              <p className="text-white/30 text-xs tracking-wider">
                We typically respond within 24 hours.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Services Grid */}
          <div className="xl:col-span-5 flex flex-col gap-8 order-1 xl:order-2">
            <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-5 md:p-7 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-base border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  2
                </div>
                <h3 className="text-xl font-black uppercase tracking-wider text-white">Select Services</h3>
              </div>
              
              {loadingPlans ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pricingPlans.map((group) => {
                    const isSelected = !!selectedPlans[group.serviceLabel];
                    const defaultPlan = group.plans[0] || {};
                    const selectedPlan = selectedPlans[group.serviceLabel];

                    return (
                      <div 
                        key={group.serviceLabel}
                        onClick={() => !isSelected && handlePlanToggle(group.serviceLabel, defaultPlan)}
                        className={`relative group p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col ${
                          isSelected 
                            ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]" 
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50 pointer-events-none" />
                        )}

                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <h4 className={`text-lg font-bold transition-colors ${isSelected ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                            {group.serviceLabel}
                          </h4>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlanToggle(group.serviceLabel, defaultPlan);
                            }}
                            className={`w-5 h-5 rounded flex items-center justify-center transition-all flex-shrink-0 text-xs ${
                              isSelected ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10 text-transparent border border-white/20 group-hover:border-white/40"
                            }`}
                          >
                            ✓
                          </button>
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col">
                          {isSelected ? (
                            <div className="mt-auto animate-in fade-in slide-in-from-top-2 duration-300" onClick={e => e.stopPropagation()}>
                              <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2 block">Select Plan Variant</label>
                              <select
                                value={selectedPlan.planName}
                                onChange={(e) => handlePlanSelectChange(group.serviceLabel, e.target.value, group.plans)}
                                className="w-full bg-black/40 border border-blue-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                              >
                                {group.plans.map(p => (
                                  <option key={p.planName} value={p.planName} className="bg-[#0f172a] text-white">
                                    {p.planName} — {p.desc}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <p className="text-white/50 text-xs mt-2 line-clamp-2">
                              {defaultPlan.desc || "Click to select and view available options for this service."}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-white/30 text-xs mt-8 italic flex items-center gap-2 pt-4 border-t border-white/5">
                <span className="w-1 h-1 rounded-full bg-white/30 block"></span>
                Prices may be negotiable based on your specific requirements.
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
