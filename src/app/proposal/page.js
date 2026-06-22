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
      if (next[serviceLabel] && next[serviceLabel].planName === plan.planName) {
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

  const calculateTotal = () => {
    let total = 0;
    Object.values(selectedPlans).forEach((plan) => {
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

    if (!formData.clientName || !formData.businessName) {
      setFormError("Please provide at least Client Name and Business Name.");
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
      setFormError("Please select at least one service plan.");
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0,10).replace(/-/g, "");
    const rand = String(Math.floor(Math.random() * 9000) + 1000);
    setPreviewData({
      ...formData,
      selectedServices: selectedList,
      totalPrice: `₹${calculateTotal().toLocaleString("en-IN")}`,
      proposalId: `DGTQ-${dateStr}-${rand}`,
      createdAt: now.toISOString()
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
        email: previewData.email || 'N/A',
        phone: previewData.phone || 'N/A',
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
      alert("An error occurred while saving your proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayProposal = submittedProposal || (previewMode ? previewData : null);

  if (displayProposal) {
    const isFinal = !!submittedProposal;
    return (
      <>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm 15mm; }
          body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; }
          .proposal-pages-wrapper { transform: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .proposal-scale-container { overflow: visible !important; height: auto !important; width: 100% !important; }
          .proposal-page { page-break-after: always; page-break-inside: avoid; height: auto !important; min-height: 0 !important; }
          .proposal-page:last-child { page-break-after: avoid; }
        }
        @media screen {
          .proposal-pages-wrapper {
            transform: scale(0.62);
            transform-origin: top center;
            width: 794px;
            margin: 0 auto;
          }
          .proposal-scale-container {
            overflow: hidden;
          }
        }
        .cursive-signature { font-family: 'Brush Script MT', 'Dancing Script', cursive; font-size: 28px; color: #1a1a1a; }
        .proposal-page { font-family: 'Inter', system-ui, sans-serif; }
        .gold-accent { color: #c9a84c; }
        .gold-border { border-color: #c9a84c; }
        .gold-bg { background-color: #c9a84c; }
        .gold-bg-light { background-color: #c9a84c10; }
        .navy-bg { background-color: #0f1a2e; }
        .navy-dark { background-color: #0b1424; }
        .navy-text { color: #0f1a2e; }
        .page-header-text { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #94a3b8; }
      `}</style>
      
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Finalize Proposal?</h3>
            <p className="text-slate-500 text-center text-sm mb-8">This will submit the proposal and generate a permanent reference ID.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-white border-2 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl">Cancel</button>
              <button onClick={() => { setShowConfirmModal(false); handleFinalSubmit(); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl">Confirm & Send</button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#f8fafc] pt-32 pb-12 px-4 md:px-12 font-inter text-slate-800 print:bg-white print:p-0">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200 print:hidden">
            <div>
              <h1 className="text-2xl font-black uppercase text-slate-900">{isFinal ? "Proposal Generated" : "Proposal Preview"}</h1>
            </div>
            <div className="flex gap-3">
              {!isFinal ? (
                <>
                  <button onClick={() => setPreviewMode(false)} className="bg-white border text-slate-700 font-bold px-6 py-2.5 rounded-lg">Edit</button>
                  <button onClick={() => setShowConfirmModal(true)} className="bg-green-600 text-white font-bold px-6 py-2.5 rounded-lg">Save Final Proposal</button>
                </>
              ) : (
                <>
                  <button onClick={handlePrint} className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg">Print / Save PDF</button>
                  <button onClick={() => window.location.reload()} className="bg-white border text-slate-700 font-bold px-6 py-2.5 rounded-lg">Create New</button>
                </>
              )}
            </div>
          </div>

          <div className="proposal-scale-container">
            <div className="proposal-pages-wrapper">
              <div className="flex flex-col gap-10 print:gap-0">
            
            {/* PAGE 1: Cover Page */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col">
              <div className="flex-1 flex flex-col px-20 py-16 relative bg-white">
                {/* Gold accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 gold-bg"></div>
                
                {/* Top section: Logo + Company */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-16 h-[2px] gold-bg mb-6"></div>
                    <img src="/assets/logo.png" alt="DIGNITEQ" className="h-16 w-auto mb-4" />
                    <h1 className="text-[46px] font-black text-slate-900 tracking-tight leading-none mb-2" style={{fontFamily: "'Bodoni Moda', serif"}}>DIGNITEQ</h1>
                    <p className="gold-accent font-semibold text-xs uppercase tracking-[6px]">Digital Solutions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[4px] mb-1">Proposal</p>
                    <div className="flex justify-end">
                      <div className="w-10 h-[2px] gold-bg"></div>
                    </div>
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Bottom section: Client info */}
                <div className="border-t border-slate-100 pt-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[4px] mb-3">Prepared For</p>
                      <h2 className="text-[36px] font-black text-slate-900 mb-1 leading-tight" style={{fontFamily: "'Bodoni Moda', serif"}}>{displayProposal.clientName}</h2>
                      <p className="text-slate-500 text-sm font-medium uppercase tracking-[3px]">{displayProposal.businessName}</p>
                    </div>
                    <div className="text-right pb-2">
                      <div className="flex items-center gap-6 text-[9px] text-slate-400 font-bold uppercase tracking-[2px]">
                        <span>ID: <span className="text-slate-700">{displayProposal.proposalId || "DGTQ-PREVIEW"}</span></span>
                        <span className="w-[1px] h-3 bg-slate-200"></span>
                        <span>{new Date(displayProposal.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PAGE 2: Company Details */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">About DIGNITEQ</span>
                </div>
                <span className="page-header-text">01 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-3" style={{fontFamily: "'Bodoni Moda', serif"}}>01. Company Overview</h2>
              <p className="text-slate-400 text-[13px] font-medium mb-10 max-w-xl">A strategic digital partner committed to your growth</p>

              {/* About text in a refined layout */}
              <div className="flex gap-12 mb-10">
                <div className="flex-1">
                  <p className="text-slate-600 leading-[1.8] mb-5 text-[14px]">
                    DIGNITEQ is a premier digital solutions agency dedicated to empowering businesses with strategic, creative, and result-driven digital services. We specialize in helping small businesses, startups, and established brands build a commanding online presence that drives measurable growth.
                  </p>
                  <p className="text-slate-600 leading-[1.8] text-[14px]">
                    Our comprehensive suite of services encompasses Website Development, Search Engine Optimization, Social Media Marketing, Branding &amp; Identity, and Paid Advertising. Every solution we deliver is meticulously crafted to align with your unique business objectives and market positioning.
                  </p>
                </div>
                <div className="w-72 shrink-0">
                  {/* Mission box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[3px] mb-3">Our Mission</p>
                    <p className="text-slate-700 text-[13px] leading-relaxed">To democratize access to premium digital solutions, empowering businesses of all sizes to thrive in the digital economy through quality, transparency, and innovation.</p>
                  </div>
                  {/* Vision box */}
                  <div className="border border-slate-200 rounded-lg p-6">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[3px] mb-3">Our Vision</p>
                    <p className="text-slate-600 text-[13px] leading-relaxed">To be the most trusted digital growth partner, recognized globally for transforming businesses through strategic and affordable digital excellence.</p>
                  </div>
                </div>
              </div>

              {/* Core Values / Stats */}
              <div className="grid grid-cols-4 gap-5 mb-6">
                {[
                  { num: "50+", label: "Projects Delivered" },
                  { num: "4.9", label: "Client Rating", suffix: "★" },
                  { num: "100%", label: "Satisfaction" },
                  { num: "3+", label: "Years Experience" }
                ].map((stat, i) => (
                  <div key={i} className="text-center py-5 rounded-lg bg-[#f8fafc] border border-slate-100">
                    <p className="text-[28px] font-black gold-accent leading-none mb-2" style={{fontFamily: "'Bodoni Moda', serif"}}>
                      {stat.num}{stat.suffix || ""}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[2px]">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Services highlight */}
              <div className="pt-5 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-[2px]">Core Services</span>
                  <div className="flex-1 h-[1px] bg-slate-100"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Website Development", "SEO & Local SEO", "Social Media Marketing", "Branding & Identity", "Google Ads & Meta Ads", "Lead Generation", "GMB Optimization", "E-Commerce Solutions"].map((s, i) => (
                    <span key={i} className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* PAGE 3: What We Understand */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">Understanding Your Needs</span>
                </div>
                <span className="page-header-text">02 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-8" style={{fontFamily: "'Bodoni Moda', serif"}}>02. Understanding Your Requirements</h2>
              
              <div className="max-w-2xl">
                <p className="text-slate-600 leading-relaxed mb-6 text-[15px]">
                  Every business possesses a unique identity, with distinct goals, challenges, and opportunities. We recognize that a one-size-fits-all approach is inadequate in today&apos;s competitive landscape.
                </p>
                <p className="text-slate-600 leading-relaxed mb-6 text-[15px]">
                  Your objective is to establish a compelling digital presence — one that amplifies visibility, fosters customer trust, and unlocks new avenues for growth. We understand that you seek a partner who can deliver measurable results without compromising on quality or exceeding your budget.
                </p>
                <p className="text-slate-600 leading-relaxed mb-8 text-[15px]">
                  At DIGNITEQ, we invest the time to thoroughly comprehend your business, your market, and your vision. This foundational understanding enables us to architect solutions that are precisely aligned with your aspirations.
                </p>

                {displayProposal.description && (
                  <div className="relative pl-8 border-l-[3px] gold-border py-4">
                    <div className="absolute -left-[9px] top-6 w-4 h-4 gold-bg rounded-full"></div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mb-2">Client Brief</p>
                    <p className="text-slate-700 leading-relaxed text-[15px] font-medium italic">&quot;{displayProposal.description}&quot;</p>
                  </div>
                )}
              </div>
            </div>

            {/* PAGE 4: How We Work */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">Our Process</span>
                </div>
                <span className="page-header-text">03 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-10" style={{fontFamily: "'Bodoni Moda', serif"}}>03. Our Working Process</h2>
              
              <p className="text-slate-600 leading-relaxed mb-10 text-[15px] max-w-2xl">
                Our methodology is built on transparency, structured execution, and a relentless focus on delivering exceptional outcomes.
              </p>

              <div className="flex-1 flex flex-col justify-center gap-0">
                {[
                  { num: "01", title: "Discovery & Consultation", desc: "We engage in a deep-dive discussion to understand your business goals, target audience, and project requirements, ensuring complete clarity from the outset." },
                  { num: "02", title: "Research & Strategy", desc: "We analyze your industry landscape and competitive positioning to formulate a data-driven strategy aligned with your business objectives." },
                  { num: "03", title: "Design & Development", desc: "Our team executes with precision, crafting solutions that reflect the highest standards of quality, aesthetics, and functionality." },
                  { num: "04", title: "Review & Refinement", desc: "We present the work for your evaluation and incorporate feedback through structured revision cycles until the outcome exceeds expectations." },
                  { num: "05", title: "Delivery & Launch", desc: "Upon your final approval, we deploy the completed project or activate the selected services with meticulous attention to every detail." },
                  { num: "06", title: "Ongoing Support", desc: "We remain committed beyond delivery, providing continued support and optimization to ensure sustained success and long-term value." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 py-5 border-b border-slate-100 last:border-b-0">
                    <div className="w-10 shrink-0 pt-0.5">
                      <span className="text-sm font-black gold-accent" style={{fontFamily: "'Bodoni Moda', serif"}}>{step.num}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base navy-text mb-1">{step.title}</h4>
                      <p className="text-slate-500 text-[13px] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PAGE 5: Project Timeline */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">Timeline</span>
                </div>
                <span className="page-header-text">04 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-10" style={{fontFamily: "'Bodoni Moda', serif"}}>04. Project Timeline</h2>
              
              <p className="text-slate-600 leading-relaxed mb-10 text-[15px] max-w-2xl">
                We recognize that time is a critical business asset. Our workflow is engineered to deliver results efficiently while upholding uncompromising quality standards. Below is the estimated project schedule:
              </p>

              <div className="relative ml-6 space-y-0 flex-1 flex flex-col justify-center">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-0 bottom-0 w-[2px] gold-bg-light"></div>
                
                {[
                  { phase: "Discovery Session", days: "1 Day", desc: "Initial consultation and requirement gathering" },
                  { phase: "Research & Planning", days: "1–2 Days", desc: "Market analysis and strategic roadmap" },
                  { phase: "Design & Development", days: "2–5 Days", desc: "Core execution and creative development" },
                  { phase: "Review & Revisions", days: "1–2 Days", desc: "Client feedback and refinement cycles" },
                  { phase: "Final Delivery", days: "1 Day", desc: "Deployment and project handover" }
                ].map((item, i) => (
                  <div key={i} className="relative pl-10 py-5">
                    <div className={`absolute w-[18px] h-[18px] rounded-full -left-[9px] top-[22px] border-[3px] ${i === 0 ? 'gold-bg border-gold-accent' : 'bg-white gold-border'}`}></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base navy-text">{item.phase}</h4>
                        <p className="text-slate-400 text-[12px]">{item.desc}</p>
                      </div>
                      <span className="text-[11px] font-bold gold-accent uppercase tracking-[2px]">{item.days}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <p className="text-[11px] text-slate-400 italic">
                  <span className="gold-accent font-bold not-italic">Note:</span> Timeline estimates may vary based on the selected services, project complexity, and client responsiveness.
                </p>
              </div>
            </div>

            {/* PAGE 6: Investment */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">Investment</span>
                </div>
                <span className="page-header-text">05 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-10" style={{fontFamily: "'Bodoni Moda', serif"}}>05. Investment Overview</h2>
              
              <p className="text-slate-600 leading-relaxed mb-8 text-[15px]">
                A detailed breakdown of the proposed investment for the selected services. All pricing is transparent and inclusive of the scope described.
              </p>

              {/* Pricing Table */}
              <table className="w-full text-left border-collapse mb-8">
                <thead>
                  <tr className="border-b-2 gold-border">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Service</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Plan & Details</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Investment</th>
                  </tr>
                </thead>
                <tbody>
                  {displayProposal.selectedServices.map((service, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-5 pr-4">
                        <span className="font-bold navy-text text-[15px]">{service.serviceType}</span>
                      </td>
                      <td className="py-5 pr-4">
                        <span className="text-slate-500 text-[13px]">{service.planName || service.details}</span>
                        {service.features && service.features.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {service.features.map((f, fi) => (
                              <li key={fi} className="text-[11px] text-slate-500 flex items-start gap-2">
                                <span className="gold-accent mt-0.5 shrink-0">✓</span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <span className="font-bold navy-text text-[15px]">{service.price}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="navy-bg rounded-lg px-8 py-6 flex justify-between items-center mb-8">
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[3px]">Total Investment</p>
                </div>
                <div className="font-black text-[30px] gold-accent" style={{fontFamily: "'Bodoni Moda', serif"}}>{displayProposal.totalPrice}</div>
              </div>

              {/* What's included */}
              <div className="bg-slate-50 rounded-lg px-8 py-6 border border-slate-100">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-4">What&apos;s Included</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                  {["Professional Service Delivery", "Dedicated Account Manager", "Timely Milestone Execution", "Quality Assurance Protocol", "Post-Delivery Support", "Transparent Communication"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-600 text-[13px]">
                      <span className="gold-accent text-base">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PAGE 7: Payment Schedule */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">Payment Terms</span>
                </div>
                <span className="page-header-text">06 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-10" style={{fontFamily: "'Bodoni Moda', serif"}}>06. Payment Schedule</h2>
              
              <p className="text-slate-600 leading-relaxed mb-10 text-[15px] max-w-2xl">
                We offer flexible payment structures designed to accommodate your cash flow while ensuring project momentum. Choose the option that best suits your business:
              </p>

              <div className="grid grid-cols-1 gap-8 flex-1">
                {/* Option 1 */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="navy-bg px-8 py-4">
                    <h3 className="font-bold text-white text-sm uppercase tracking-[3px]">Option A — Standard Payment Plan</h3>
                  </div>
                  <div className="px-8 py-6">
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                      <span className="text-slate-600 text-[15px]">Advance Payment (Project Initiation)</span>
                      <span className="font-bold navy-text text-lg">50%</span>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-slate-600 text-[15px]">Final Payment (Before Delivery)</span>
                      <span className="font-bold navy-text text-lg">50%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-center">
                  <div className="flex-1 h-[1px] bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Or</span>
                  <div className="flex-1 h-[1px] bg-slate-200"></div>
                </div>

                {/* Option 2 */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="gold-bg px-8 py-4">
                    <h3 className="font-bold text-white text-sm uppercase tracking-[3px]">Option B — Milestone Based Plan</h3>
                  </div>
                  <div className="px-8 py-6">
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                      <span className="text-slate-600 text-[15px]">Advance Payment (Project Initiation)</span>
                      <span className="font-bold navy-text text-lg">30%</span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                      <span className="text-slate-600 text-[15px]">Mid-Project Milestone</span>
                      <span className="font-bold navy-text text-lg">40%</span>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-slate-600 text-[15px]">Final Delivery</span>
                      <span className="font-bold navy-text text-lg">30%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <p className="text-[11px] text-slate-400 italic">
                  <span className="gold-accent font-bold not-italic">Note:</span> For larger or more complex engagements, a customized payment schedule can be structured to align with specific project milestones and deliverables.
                </p>
              </div>
            </div>

            {/* PAGE 8: Terms & Conditions */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">Terms</span>
                </div>
                <span className="page-header-text">07 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-10" style={{fontFamily: "'Bodoni Moda', serif"}}>07. Terms & Conditions</h2>
              
              <p className="text-slate-600 leading-relaxed mb-8 text-[15px]">
                The following terms govern the engagement between DIGNITEQ and the Client. By accepting this proposal, both parties agree to abide by these conditions.
              </p>

              <div className="flex-1 space-y-5">
                {[
                  { title: "Payment Terms", desc: "A non-refundable advance payment is required to commence the project. The remaining balance must be settled as per the agreed payment schedule before final delivery." },
                  { title: "Timeline & Dependencies", desc: "Project timelines are contingent upon timely client approvals, feedback, and content submissions. Any delays on the client's part may result in an adjusted delivery schedule." },
                  { title: "Scope of Work", desc: "Any feature requests or modifications that fall outside the agreed scope of work may incur additional charges. A separate change order will be issued for such requests." },
                  { title: "Revisions", desc: "Minor revisions are included as per the selected package. Major changes or additional revision cycles beyond the agreed scope may be subject to extra fees." },
                  { title: "Final Handover", desc: "Upon completion, final deliverables and project assets will be transferred only after full payment has been received and cleared." },
                  { title: "Portfolio Rights", desc: "DIGNITEQ reserves the right to showcase the completed work in its portfolio, case studies, and marketing materials unless a mutual non-disclosure agreement is executed." },
                  { title: "Communication", desc: "All project-related communications, approvals, and change requests transacted via Email, WhatsApp, or the designated project management platform shall be considered binding and valid." }
                ].map((term, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="gold-accent font-black text-lg leading-none">•</span>
                    <div>
                      <h4 className="font-bold navy-text text-[14px] mb-1">{term.title}</h4>
                      <p className="text-slate-500 text-[13px] leading-relaxed">{term.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PAGE 9: Why Choose Us */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">Why Us</span>
                </div>
                <span className="page-header-text">08 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-4" style={{fontFamily: "'Bodoni Moda', serif"}}>08. Why DIGNITEQ?</h2>
              
              <p className="text-slate-600 leading-relaxed mb-10 text-[15px] max-w-2xl">
                We are more than a service provider — we are a strategic growth partner committed to your success. Here is what sets us apart:
              </p>

              <div className="grid grid-cols-2 gap-x-10 gap-y-5 flex-1">
                {[
                  "Award-Winning Digital Agency",
                  "Affordable Premium Solutions",
                  "Small Business Champions",
                  "Modern, Results-Driven Design",
                  "Complete Pricing Transparency",
                  "Dedicated Client Support",
                  "Growth-Optimized Strategies",
                  "Long-Term Partnership Focus"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full gold-bg-light gold-border border flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black gold-accent">✓</span>
                    </div>
                    <span className="text-[14px] font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 py-6 px-8 rounded-lg navy-bg">
                <p className="text-white/90 text-[14px] leading-relaxed text-center font-medium">
                  &quot;Our mission is not merely to deliver services — but to forge enduring partnerships that drive sustainable business growth.&quot;
                </p>
              </div>
            </div>

            {/* PAGE 10: How We Move Forward */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">Next Steps</span>
                </div>
                <span className="page-header-text">09 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-6" style={{fontFamily: "'Bodoni Moda', serif"}}>09. Next Steps</h2>
              
              <p className="text-slate-600 leading-relaxed mb-10 text-[15px] max-w-2xl">
                Initiating our partnership is straightforward. Follow these steps to move forward:
              </p>

              <div className="flex-1 space-y-0">
                {[
                  { step: "01", title: "Review & Validate", desc: "Carefully review this proposal to ensure all selected services, pricing, and terms align with your expectations." },
                  { step: "02", title: "Confirm Engagement", desc: "Provide your formal acceptance by signing the Agreement & Acceptance page. You may also reach out for any clarifications." },
                  { step: "03", title: "Complete Advance Payment", desc: "Process the initial payment as per the chosen payment schedule to formally initiate the project." },
                  { step: "04", title: "Kickoff Discussion", desc: "We will schedule a comprehensive kickoff call to align on detailed requirements, timelines, and communication protocols." },
                  { step: "05", title: "Execution & Updates", desc: "Our team begins work, providing regular progress updates and milestone deliverables until successful project completion." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 py-5 border-b border-slate-100 last:border-b-0 items-start">
                    <div className="w-10 h-10 rounded-full gold-bg-light gold-border border flex items-center justify-center shrink-0">
                      <span className="text-xs font-black gold-accent">{item.step}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold navy-text text-[15px] mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-[13px] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PAGE 11: Agreement */}
            <div className="proposal-page bg-white print:border-none relative overflow-hidden print:break-after-page min-h-[1123px] flex flex-col px-16 py-14 mt-10 print:mt-0">
              {/* Page header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] gold-bg"></div>
                  <span className="page-header-text">Agreement</span>
                </div>
                <span className="page-header-text">10 / 11</span>
              </div>

              <h2 className="text-[28px] font-black navy-text mb-8" style={{fontFamily: "'Bodoni Moda', serif"}}>10. Agreement & Acceptance</h2>
              
              <p className="text-slate-600 leading-relaxed mb-10 text-[15px]">
                By executing this agreement, both DIGNITEQ and the undersigned Client acknowledge and accept the scope of work, investment, payment terms, and conditions detailed in the preceding pages of this proposal.
              </p>

              {/* Client Information */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-10">
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-200">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Client Information</h4>
                </div>
                <div className="px-8 py-6">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mb-1">Client Name</p>
                      <p className="font-bold navy-text text-[16px]">{displayProposal.clientName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mb-1">Business / Organization</p>
                      <p className="font-bold navy-text text-[16px]">{displayProposal.businessName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mb-1">Email Address</p>
                      <p className="text-slate-600 text-[14px]">{displayProposal.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mb-1">Phone</p>
                      <p className="text-slate-600 text-[14px]">{displayProposal.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mb-1">Proposal Reference</p>
                      <p className="text-slate-600 text-[14px]">{displayProposal.proposalId || "DGTQ-PREVIEW"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mb-1">Date</p>
                      <p className="text-slate-600 text-[14px]">{new Date(displayProposal.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="border-t border-slate-200 pt-10">
                  <div className="grid grid-cols-2 gap-16">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mb-1">Authorized Signature (Client)</p>
                      <div className="border-b-2 border-slate-300 pb-2 mb-2 mt-6">
                        <span className="cursive-signature block">{displayProposal.clientName}</span>
                      </div>
                      <p className="font-bold navy-text text-[14px]">{displayProposal.clientName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mb-1">Authorized Signature (DIGNITEQ)</p>
                      <div className="border-b-2 border-slate-300 pb-2 mb-2 mt-6">
                        <span className="cursive-signature block">DIGNITEQ</span>
                      </div>
                      <p className="font-bold navy-text text-[14px]">Authorized Representative</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


              </div>{/* end flex col pages */}
            </div>{/* end proposal-pages-wrapper */}
          </div>{/* end proposal-scale-container */}
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#030610] pt-32 pb-24 px-6 md:px-12 selection:bg-blue-500/30 font-inter">
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-12">
        
        <div className="text-center mb-4">
          <h1 className="font-sans-premium text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Generate Your <span className="text-blue-500">Proposal</span>
          </h1>
          <p className="text-white/40 mt-3 max-w-lg mx-auto">
            Select your desired services, fill in your details, and generate a customized proposal.
          </p>
        </div>

        <form onSubmit={handlePreview} className="flex flex-col gap-12">
          
          {/* STEP 1: Service Selection Table */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col gap-6">
            <h3 className="font-sans text-lg font-black uppercase tracking-widest text-white border-b border-white/10 pb-4">Step 1: Select Services</h3>
            
            {loadingPlans ? (
              <div className="text-white/50 text-center py-10 animate-pulse">Loading Services...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="p-4 text-white/50 font-bold text-sm uppercase tracking-widest">Select</th>
                      <th className="p-4 text-white/50 font-bold text-sm uppercase tracking-widest">Service</th>
                      <th className="p-4 text-white/50 font-bold text-sm uppercase tracking-widest">Details</th>
                      <th className="p-4 text-white/50 font-bold text-sm uppercase tracking-widest text-right">Starting Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pricingPlans.map((group) => {
                      const selectedPlan = selectedPlans[group.serviceLabel];
                      const defaultPlan = group.plans[0] || {};
                      
                      return (
                        <tr key={group.serviceLabel} className={`hover:bg-white/[0.02] transition-colors ${selectedPlan ? "bg-blue-500/10" : ""}`}>
                          <td className="p-4">
                            <input 
                              type="checkbox" 
                              checked={!!selectedPlan}
                              onChange={() => handlePlanToggle(group.serviceLabel, defaultPlan)}
                              className="w-5 h-5 rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 font-bold text-white">{group.serviceLabel}</td>
                          <td className="p-4 text-white/70 text-sm">
                            {selectedPlan ? (
                              <select
                                value={selectedPlan.planName}
                                onChange={(e) => handlePlanSelectChange(group.serviceLabel, e.target.value, group.plans)}
                                className="bg-black border border-white/20 rounded px-2 py-1 text-xs text-white max-w-[200px]"
                              >
                                {group.plans.map(p => <option key={p.planName} value={p.planName}>{p.planName} - {p.desc}</option>)}
                              </select>
                            ) : (
                              <span>{defaultPlan.desc || "Select to view options"}</span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-blue-400 text-right">
                            {selectedPlan ? selectedPlan.price : defaultPlan.price}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* STEP 2: Client Details */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col gap-6">
            <h3 className="font-sans text-lg font-black uppercase tracking-widest text-white border-b border-white/10 pb-4">Step 2: Client Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Client Name *</label>
                <input type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Business Name *</label>
                <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50" />
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-white/50 text-xs font-bold uppercase tracking-widest">Brief Project Scope (Optional)</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 resize-none" />
            </div>

            {formError && <div className="text-red-400 text-sm font-bold mt-2">⚠️ {formError}</div>}
          </div>

          {/* Bottom Bar: Total & Generate Button */}
          <div className="bg-blue-600/20 border border-blue-500/30 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-blue-200 text-sm font-bold uppercase tracking-widest block mb-1">Total Investment</span>
              <span className="text-3xl font-black text-white">₹{calculateTotal().toLocaleString("en-IN")}</span>
            </div>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-full shadow-lg transition-transform hover:scale-105 w-full md:w-auto">
              {isSubmitting ? "Generating..." : "Generate Proposal ➔"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
