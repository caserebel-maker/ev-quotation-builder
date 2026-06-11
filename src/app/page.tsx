"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Printer, 
  Send, 
  FileText, 
  Check, 
  Zap, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CreditCard,
  AlertCircle
} from "lucide-react";

// Types
interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
}

// Preset Templates matching MEA/PEA standards for EV Charger Circuit (วงจรที่ 2)
const TEMPLATES = {
  singlePhase: {
    name: "วงจรที่ 2 - ไฟ 1 เฟส (7.4 kW)",
    description: "ชุดติดตั้งมาตรฐานสำหรับบ้าน 1 เฟส ทั่วไปตามเกณฑ์การไฟฟ้านครหลวง/ภูมิภาค",
    items: [
      { id: "1", description: "เซอร์กิตเบรกเกอร์เมน 2P 40A พร้อมกล่องใส่ฝาครอบควบคุมปลอดภัย (Consumer Unit/Enclosure)", quantity: 1, unit: "ชุด", price: 1200 },
      { id: "2", description: "อุปกรณ์ป้องกันไฟรั่ว RCD Type B 2P 40A (ตัดกระแสไฟรั่ว DC 6mA ตามมาตรฐานความปลอดภัย)", quantity: 1, unit: "ชุด", price: 3500 },
      { id: "3", description: "สายไฟเมนหลัก THW 1x10 sq.mm. (สำหรับสาย Line และ Neutral) เดินร้อยท่อ", quantity: 20, unit: "เมตร", price: 110 },
      { id: "4", description: "สายดินทองแดง THW 1x6 sq.mm. เดินร้อยท่อเข้าหลักดิน", quantity: 10, unit: "เมตร", price: 40 },
      { id: "5", description: "แท่งหลักดินทองแดง (Ground Rod) ขนาด 5/8 นิ้ว ยาว 2.4 เมตร พร้อมกล่องตรวจสอบ (Ground Box)", quantity: 1, unit: "ชุด", price: 800 },
      { id: "6", description: "ท่อร้อยสายไฟแบบหนาสำหรับภายนอก/ภายใน ข้อต่อ และฟิตติ้งยึดผนังเรียบร้อย", quantity: 1, unit: "งาน", price: 1500 },
      { id: "7", description: "ค่าแรงเดินสายไฟ ติดตั้งอุปกรณ์ประกอบทางไฟฟ้า และทดสอบวัดค่าความปลอดภัยระบบดิน", quantity: 1, unit: "งาน", price: 3500 }
    ],
    warrantyInfo: "1 ปี (รับประกันงานติดตั้งและระบบไฟฟ้าวงจรที่ 2)",
    notes: "ราคานี้เป็นราคาประเมินเบื้องต้นในการเดินสายไม่เกิน 20 เมตร / ไม่รวมตัวเครื่องชาร์จ EV (ลูกค้าเป็นผู้จัดหา) / รวมการทดสอบตามมาตรฐาน MEA/PEA"
  },
  threePhase: {
    name: "วงจรที่ 2 - ไฟ 3 เฟส (22 kW)",
    description: "ชุดติดตั้งสำหรับบ้าน 3 เฟส รองรับเครื่องชาร์จขนาด 11kW และ 22kW ตามเกณฑ์ไฟฟ้า",
    items: [
      { id: "1", description: "เซอร์กิตเบรกเกอร์เมน 3P/4P 40A พร้อมกล่องฝาครอบปิดมิดชิด (Consumer Unit/Enclosure)", quantity: 1, unit: "ชุด", price: 2500 },
      { id: "2", description: "อุปกรณ์ป้องกันไฟรั่ว RCD Type B 4P 40A (ตัดกระแสไฟรั่วสำหรับระบบไฟ 3 เฟส)", quantity: 1, unit: "ชุด", price: 5500 },
      { id: "3", description: "สายไฟเมนหลัก THW 1x10 sq.mm. (L1, L2, L3, N) เดินร้อยท่อรวม 80 เมตร", quantity: 80, unit: "เมตร", price: 110 },
      { id: "4", description: "สายดินทองแดง THW 1x10 sq.mm. เดินร้อยท่อเข้าหลักดิน", quantity: 10, unit: "เมตร", price: 65 },
      { id: "5", description: "แท่งหลักดินทองแดง (Ground Rod) ขนาด 5/8 นิ้ว ยาว 2.4 เมตร พร้อมกล่องตรวจสอบ (Ground Box)", quantity: 1, unit: "ชุด", price: 800 },
      { id: "6", description: "ท่อร้อยสายไฟ PVC ชนิดหนาพิเศษ ท่อเหล็ก EMT อุปกรณ์ยึด และข้อต่อกันน้ำ", quantity: 1, unit: "งาน", price: 2500 },
      { id: "7", description: "ค่าแรงติดตั้งตู้ควบคุม เดินสายไฟระบบ 3 เฟส เข้าหัวสาย และตรวจวัดค่าความต้านทานดินด้วยอุปกรณ์มาตรฐาน", quantity: 1, unit: "งาน", price: 5500 }
    ],
    warrantyInfo: "1 ปี (รับประกันงานติดตั้งและระบบไฟฟ้าวงจรที่ 2)",
    notes: "ราคานี้เป็นงานเดินสายเมนไฟ 3 เฟส ระยะทางสายไฟจริงไม่เกิน 20 เมตรต่อเส้น / ไม่รวมตัวเครื่องชาร์จ EV / รวมค่าบริการประสานงานตรวจสอบกับการไฟฟ้า"
  }
};

// Thai Baht conversion logic
function arabToThaiBaht(num: number): string {
  if (isNaN(num) || num === null) return "";
  
  const rounded = Math.round(num * 100) / 100;
  const parts = rounded.toString().split(".");
  
  const bahtStr = parts[0];
  const satangStr = parts[1] || "";
  
  let bahtText = "";
  
  if (parseInt(bahtStr, 10) === 0) {
    bahtText = "ศูนย์บาท";
  } else {
    bahtText = convertSection(bahtStr) + "บาท";
  }
  
  let satangText = "";
  if (satangStr !== "" && parseInt(satangStr, 10) !== 0) {
    const paddedSatang = satangStr.padEnd(2, "0").substring(0, 2);
    satangText = convertSection(paddedSatang) + "สตางค์";
  } else {
    satangText = "ถ้วน";
  }
  
  return bahtText + satangText;
}

function convertSection(numStr: string): string {
  const digits = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const positions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
  
  let result = "";
  const len = numStr.length;
  
  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr.charAt(i), 10);
    const pos = len - 1 - i;
    const relativePos = pos % 6;
    
    if (digit !== 0) {
      let digitText = digits[digit];
      
      if (relativePos === 1) {
        if (digit === 1) {
          digitText = "";
        } else if (digit === 2) {
          digitText = "ยี่";
        }
      }
      
      if (relativePos === 0 && len > 1) {
        const prevDigitChar = numStr.charAt(i - 1);
        if (i > 0 && prevDigitChar !== "0") {
          digitText = "เอ็ด";
        } else if (i > 0 && prevDigitChar === "0") {
          let hasBefore = false;
          const blockStart = i - relativePos;
          for (let k = blockStart; k < i; k++) {
            if (numStr.charAt(k) !== "0") {
              hasBefore = true;
              break;
            }
          }
          if (hasBefore) {
            digitText = "เอ็ด";
          }
        }
      }
      
      result += digitText + positions[relativePos];
    }
    
    if (pos > 0 && pos % 6 === 0) {
      result += "ล้าน";
    }
  }
  
  return result;
}

export default function QuotationBuilder() {
  // Main form states
  const [techName, setTechName] = useState("สมชาย งานดี (ช่างไฟฟ้ามืออาชีพ)");
  const [techCompany, setTechCompany] = useState("ช่างไฟ ดีดี เซอร์วิส");
  const [techPhone, setTechPhone] = useState("081-234-5678");
  const [techEmail, setTechEmail] = useState("somchai.electric@gmail.com");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  // Auto-generate a quotation number
  const [quotationNumber, setQuotationNumber] = useState("");
  const [date, setDate] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [vatType, setVatType] = useState<"none" | "include" | "exclude">("none");
  const [vatRate, setVatRate] = useState<number>(7);

  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("แบ่งชำระเป็น 2 งวด (มัดจำ 50% ก่อนเริ่มงาน และชำระส่วนที่เหลือ 50% หลังงานแล้วเสร็จ)");
  const [bankName, setBankName] = useState("กสิกรไทย");
  const [bankAccountName, setBankAccountName] = useState("นายสมชาย งานดี");
  const [bankAccountNumber, setBankAccountNumber] = useState("012-3-45678-9");
  const [warrantyInfo, setWarrantyInfo] = useState("1 ปีเต็ม (รับประกันการติดตั้งระบบทางไฟฟ้า)");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: ""
  });
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit"); // mobile tab toggle

  // Set default dates and document number on mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().substring(0, 10);
    
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    const formattedValidDate = nextMonth.toISOString().substring(0, 10);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const yy = today.getFullYear().toString().substring(2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const qtNum = `QT-${yy}${mm}${dd}-${randomSuffix}`;

    setDate(formattedDate);
    setValidUntil(formattedValidDate);
    setQuotationNumber(qtNum);

    // Load Single Phase template as initial state
    loadTemplate("singlePhase");
  }, []);

  // Format date helper for Thai Display
  const formatThaiDate = (dateString: string) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    return dateObj.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  
  let vatAmount = 0;
  let grandTotal = subtotal;

  if (vatType === "exclude") {
    vatAmount = (subtotal * vatRate) / 100;
    grandTotal = subtotal + vatAmount;
  } else if (vatType === "include") {
    vatAmount = subtotal - (subtotal / (1 + (vatRate / 100)));
    // grandTotal remains equal to subtotal
    // but subtotal for display needs to be pre-VAT, so we adjust subtotal
  }

  const displaySubtotal = vatType === "include" ? subtotal - vatAmount : subtotal;
  const displayGrandTotal = grandTotal;
  const thaiBahtText = arabToThaiBaht(displayGrandTotal);

  // Template Loader
  const loadTemplate = (type: "singlePhase" | "threePhase") => {
    const template = TEMPLATES[type];
    // Copy template items
    const newItems = template.items.map(item => ({ ...item }));
    setItems(newItems);
    setWarrantyInfo(template.warrantyInfo);
    setNotes(template.notes);
  };

  // Item Modifiers
  const handleItemChange = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        let parsedVal = value;
        if (field === "quantity") parsedVal = parseFloat(value) || 0;
        if (field === "price") parsedVal = parseFloat(value) || 0;
        return { ...item, [field]: parsedVal };
      }
      return item;
    }));
  };

  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unit: "รายการ",
      price: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Submit and send email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setSubmitStatus({
        type: "error",
        message: "กรุณากรอกชื่อลูกค้า เพื่อสร้างใบเสนอราคา"
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const payload = {
        quotationNumber,
        date: formatThaiDate(date),
        validUntil: formatThaiDate(validUntil),
        techName,
        techCompany,
        techPhone,
        techEmail,
        clientName,
        clientPhone,
        clientAddress,
        items,
        vatType,
        vatRate,
        subtotal: displaySubtotal,
        vatAmount,
        grandTotal: displayGrandTotal,
        thaiBahtText,
        notes,
        paymentTerms,
        bankName,
        bankAccountName,
        bankAccountNumber,
        warrantyInfo,
      };

      const response = await fetch("/api/send-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "ล้มเหลวในการส่งข้อมูล");
      }

      setSubmitStatus({
        type: "success",
        message: "ส่งใบเสนอราคาเรียบร้อยแล้ว! ระบบส่งข้อมูลไปยังอีเมล tumyen@gmail.com เรียบร้อย"
      });
    } catch (err: any) {
      console.error(err);
      setSubmitStatus({
        type: "error",
        message: err.message || "เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col no-print">
      {/* Top Premium Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-rose-600 p-2 rounded-xl text-slate-950 shadow-lg shadow-amber-500/20">
            <Zap className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-200 bg-clip-text text-transparent">
              EV Charger Circuit Builder
            </h1>
            <p className="text-xs text-slate-400">ระบบสร้างและจัดส่งใบเสนอราคาติดตั้งวงจรที่ 2</p>
          </div>
        </div>

        {/* Action controls for Desktop */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 transition duration-200 text-sm font-semibold"
          >
            <Printer className="h-4 w-4" />
            <span>พิมพ์ / บันทึก PDF</span>
          </button>
          
          <button
            onClick={handleSendEmail}
            disabled={isSubmitting}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 disabled:opacity-50 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition duration-200 text-sm active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="animate-spin inline-block h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4 fill-current" />
            )}
            <span>ส่งใบเสนอราคาเข้าอีเมล</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Dashboard Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* Mobile Tab Toggle */}
        <div className="lg:hidden col-span-1 flex border-b border-slate-800 bg-slate-900 sticky top-[73px] z-40">
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition duration-200 ${
              activeTab === "edit" ? "border-amber-500 text-amber-500 bg-slate-800/30" : "border-transparent text-slate-400"
            }`}
          >
            กรอกข้อมูลผู้รับเหมา/ใบงาน
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition duration-200 ${
              activeTab === "preview" ? "border-amber-500 text-amber-500 bg-slate-800/30" : "border-transparent text-slate-400"
            }`}
          >
            ดูตัวอย่างเอกสาร (A4)
          </button>
        </div>

        {/* Section 1: Form Inputs & Settings (7 Columns) */}
        <div className={`lg:col-span-6 xl:col-span-7 p-6 overflow-y-auto lg:max-h-[calc(100vh-77px)] space-y-6 ${activeTab === "edit" ? "block" : "hidden lg:block"}`}>
          
          {/* Status Messages */}
          {submitStatus.type && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 animate-fadeIn ${
              submitStatus.type === "success" 
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300" 
                : "bg-rose-950/40 border-rose-800 text-rose-300"
            }`}>
              {submitStatus.type === "success" ? (
                <Check className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {submitStatus.type === "success" ? "ดำเนินการสำเร็จ" : "เกิดข้อผิดพลาด"}
                </p>
                <p className="text-xs mt-1 leading-relaxed">{submitStatus.message}</p>
              </div>
            </div>
          )}

          {/* Quick Template Picker Card */}
          <div className="glass p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full" />
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4" />
              ทางลัด: เลือกแม่แบบสำหรับชาร์จ EV
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              ช่างไฟสามารถกดเลือกปุ่มด้านล่างเพื่อโหลดรายการอุปกรณทางเทคนิคและสายไฟสำหรับวงจรที่ 2 มาตรฐานการไฟฟ้าได้ทันทีโดยไม่ต้องพิมพ์เอง
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => loadTemplate("singlePhase")}
                className="p-3 text-left rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-amber-500/50 transition duration-200 cursor-pointer active:scale-98"
              >
                <h3 className="font-bold text-sm text-slate-200 flex items-center justify-between">
                  <span>1 เฟส 7.4 kW</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">ทั่วไป</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  ขนาดสาย 10 sq.mm., RCD Type B, แท่งหลักดินแยกเฉพาะสำหรับ EV
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => loadTemplate("threePhase")}
                className="p-3 text-left rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-rose-500/50 transition duration-200 cursor-pointer active:scale-98"
              >
                <h3 className="font-bold text-sm text-slate-200 flex items-center justify-between">
                  <span>3 เฟส 22 kW</span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded">บ้านขนาดใหญ่</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  ขนาดสาย THW 10 sq.mm. 4 เส้น, RCD Type B 4P ปลอดภัยสูง
                </p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-6">
            
            {/* Step 1: Provider / Technician Information */}
            <div className="glass p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <h2 className="font-bold text-sm text-slate-300">ข้อมูลช่างไฟ / ผู้รับเหมาติดตั้ง</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="techName" className="block text-xs text-slate-400 mb-1">ชื่อผู้ติดต่อ / ช่าง</label>
                  <input
                    type="text"
                    id="techName"
                    value={techName}
                    onChange={(e) => setTechName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="techCompany" className="block text-xs text-slate-400 mb-1">บริษัท / ร้าน (ถ้ามี)</label>
                  <input
                    type="text"
                    id="techCompany"
                    value={techCompany}
                    onChange={(e) => setTechCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="techPhone" className="block text-xs text-slate-400 mb-1 font-sans">เบอร์โทรศัพท์ช่าง</label>
                  <input
                    type="text"
                    id="techPhone"
                    value={techPhone}
                    onChange={(e) => setTechPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="techEmail" className="block text-xs text-slate-400 mb-1 font-sans">อีเมลติดต่อช่าง</label>
                  <input
                    type="email"
                    id="techEmail"
                    value={techEmail}
                    onChange={(e) => setTechEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Client Information */}
            <div className="glass p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <User className="h-4 w-4 text-slate-400" />
                <h2 className="font-bold text-sm text-slate-300">ข้อมูลผู้ว่าจ้าง / ลูกค้า</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="clientName" className="block text-xs text-slate-400 mb-1">ชื่อของลูกค้า (ผู้ว่าจ้าง)</label>
                  <input
                    type="text"
                    id="clientName"
                    placeholder="เช่น คุณสมบัติ รักดี"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="clientPhone" className="block text-xs text-slate-400 mb-1">เบอร์โทรศัพท์ลูกค้า</label>
                  <input
                    type="text"
                    id="clientPhone"
                    placeholder="เช่น 089-xxx-xxxx"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="clientAddress" className="block text-xs text-slate-400 mb-1">สถานที่นัดติดตั้ง (ที่อยู่)</label>
                  <input
                    type="text"
                    id="clientAddress"
                    placeholder="เช่น บ้านเลขที่ 123/4 หมู่บ้านสุขสบาย กรุงเทพฯ"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Document Metadata */}
            <div className="glass p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <h2 className="font-bold text-sm text-slate-300">ข้อมูลใบงานและวันที่</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="quotationNumber" className="block text-xs text-slate-400 mb-1">เลขที่ใบเสนอราคา</label>
                  <input
                    type="text"
                    id="quotationNumber"
                    value={quotationNumber}
                    onChange={(e) => setQuotationNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-xs text-slate-400 mb-1">วันที่ออกเอกสาร</label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="validUntil" className="block text-xs text-slate-400 mb-1">ราคาเสนอมีผลถึงวันที่</label>
                  <input
                    type="date"
                    id="validUntil"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Items List */}
            <div className="glass p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <h2 className="font-bold text-sm text-slate-300">รายการงานและวัสดุอุปกรณ์</h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer text-amber-400 active:scale-95"
                >
                  <Plus className="h-3 w-3" />
                  <span>เพิ่มรายการ</span>
                </button>
              </div>

              {/* Dynamic Table */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 relative group">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold">ลำดับที่ {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                        title="ลบรายการ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 sm:col-span-6">
                        <label className="block text-[10px] text-slate-500 mb-1">รายละเอียดสินค้า/งาน</label>
                        <input
                          type="text"
                          value={item.description}
                          placeholder="เช่น อุปกรณ์ป้องกันไฟรั่ว RCD..."
                          onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 min-h-[36px]"
                          required
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-1">จำนวน</label>
                        <input
                          type="number"
                          value={item.quantity === 0 ? "" : item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 min-h-[36px]"
                          required
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-1">หน่วย</label>
                        <input
                          type="text"
                          value={item.unit}
                          placeholder="เมตร/ชุด"
                          onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 min-h-[36px]"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-1">ราคา/หน่วย</label>
                        <input
                          type="number"
                          value={item.price === 0 ? "" : item.price}
                          onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 min-h-[36px]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-slate-500">
                    ยังไม่มีรายการใดๆ กดปุ่ม "เพิ่มรายการ" หรือเลือกแม่แบบด่วนด้านบน
                  </div>
                )}
              </div>

              {/* VAT & Tax Settings */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">การคิดภาษีมูลค่าเพิ่ม (VAT)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVatType("none")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition ${
                        vatType === "none" 
                          ? "bg-amber-500/10 border-amber-500 text-amber-400" 
                          : "border-slate-700 bg-slate-800/40 text-slate-400"
                      }`}
                    >
                      ไม่มี VAT (0%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVatType("exclude")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition ${
                        vatType === "exclude" 
                          ? "bg-amber-500/10 border-amber-500 text-amber-400" 
                          : "border-slate-700 bg-slate-800/40 text-slate-400"
                      }`}
                    >
                      แยกภาษี (Exclude VAT 7%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVatType("include")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition ${
                        vatType === "include" 
                          ? "bg-amber-500/10 border-amber-500 text-amber-400" 
                          : "border-slate-700 bg-slate-800/40 text-slate-400"
                      }`}
                    >
                      รวมในราคาแล้ว (Include VAT 7%)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Terms, Warranty & Bank Details */}
            <div className="glass p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <h2 className="font-bold text-sm text-slate-300">เงื่อนไขการชำระเงินและการรับประกัน</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="warrantyInfo" className="block text-xs text-slate-400 mb-1">ข้อมูลการรับประกัน</label>
                  <input
                    type="text"
                    id="warrantyInfo"
                    value={warrantyInfo}
                    onChange={(e) => setWarrantyInfo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="paymentTerms" className="block text-xs text-slate-400 mb-1">เงื่อนไขจ่ายเงิน</label>
                  <input
                    type="text"
                    id="paymentTerms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 min-h-[44px]"
                  />
                </div>
                
                {/* Bank details for deposit */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-800/50">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <h3 className="text-xs font-bold text-slate-400">ข้อมูลบัญชีธนาคารสำหรับรับเงิน</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="bankName" className="block text-[10px] text-slate-400 mb-1">ธนาคาร</label>
                      <input
                        type="text"
                        id="bankName"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 min-h-[36px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="bankAccountName" className="block text-[10px] text-slate-400 mb-1">ชื่อบัญชี</label>
                      <input
                        type="text"
                        id="bankAccountName"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 min-h-[36px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="bankAccountNumber" className="block text-[10px] text-slate-400 mb-1 font-sans">เลขบัญชี</label>
                      <input
                        type="text"
                        id="bankAccountNumber"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 min-h-[36px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="block text-xs text-slate-400 mb-1">หมายเหตุเพิ่มเติม</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="เช่น ไม่รวมงานเจาะผนังพิเศษ หรือขุดเจาะถนนยางมะตอย..."
                  />
                </div>
              </div>
            </div>

            {/* Mobile Submit Actions in form */}
            <div className="lg:hidden flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 disabled:opacity-50 text-slate-950 font-bold shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-4 w-4 fill-current" />
                )}
                <span>ส่งใบเสนอราคาไปยัง tumyen@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>พิมพ์ใบเสนอราคา / เซฟ PDF</span>
              </button>
            </div>

          </form>
        </div>

        {/* Section 2: Real-time Interactive A4 Paper Preview (5 Columns) */}
        <div className={`lg:col-span-6 xl:col-span-5 bg-slate-950/60 lg:border-l border-slate-800 p-6 overflow-y-auto lg:max-h-[calc(100vh-77px)] flex justify-center ${activeTab === "preview" ? "block" : "hidden lg:flex"}`}>
          
          {/* Printable A4 Styled Sheet */}
          <div className="print-area w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-8 flex flex-col justify-between font-serif relative border border-slate-200">
            
            <div>
              {/* Quotation Header Section */}
              <div className="flex justify-between items-start gap-4 border-b-2 border-amber-600 pb-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-amber-900 font-sans" style={{ color: "#561e23" }}>
                    {techCompany || "ใบเสนอราคา"}
                  </h2>
                  <div className="text-xs text-slate-600 mt-2 space-y-0.5 font-sans leading-relaxed">
                    <p><strong>ผู้ติดต่อ:</strong> {techName || "-"}</p>
                    <p><strong>โทรศัพท์:</strong> {techPhone || "-"}</p>
                    {techEmail && <p><strong>อีเมล:</strong> {techEmail}</p>}
                  </div>
                </div>
                
                <div className="text-right">
                  <h1 className="text-xl font-bold text-slate-800 tracking-wider font-sans">ใบเสนอราคา</h1>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-sans">QUOTATION</span>
                  <div className="text-xs text-slate-700 mt-4 space-y-1 font-sans">
                    <p><strong>เลขที่:</strong> {quotationNumber || "-"}</p>
                    <p><strong>วันที่:</strong> {formatThaiDate(date)}</p>
                    {validUntil && <p><strong>มีผลถึง:</strong> {formatThaiDate(validUntil)}</p>}
                  </div>
                </div>
              </div>

              {/* Customer / Project details block */}
              <div className="grid grid-cols-2 gap-6 my-6 text-xs leading-relaxed font-sans">
                <div className="bg-slate-50 p-4 border border-slate-200 rounded">
                  <h3 className="font-bold text-amber-900 border-b border-dashed border-slate-300 pb-1 mb-2" style={{ color: "#561e23" }}>ลูกค้าผู้ติดต่อ</h3>
                  <p><strong>ชื่อลูกค้า:</strong> {clientName || "_______________________"}</p>
                  <p><strong>เบอร์โทร:</strong> {clientPhone || "-"}</p>
                  <p><strong>ที่อยู่ติดตั้ง:</strong> {clientAddress || "-"}</p>
                </div>
                
                <div className="bg-slate-50 p-4 border border-slate-200 rounded">
                  <h3 className="font-bold text-amber-900 border-b border-dashed border-slate-300 pb-1 mb-2" style={{ color: "#561e23" }}>รายละเอียดงาน</h3>
                  <p>งานเดินวงจรไฟฟ้าหลักวงจรที่ 2 สำหรับติดตั้งเครื่องชาร์จรถยนต์ไฟฟ้า EV รองรับกระแสไฟฟ้าต่อเนื่องสูงสุดตามเกณฑ์มาตรฐานความปลอดภัยของการไฟฟ้านครหลวงและส่วนภูมิภาค</p>
                </div>
              </div>

              {/* Materials & Labor Table */}
              <div className="my-6">
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-t border-b border-slate-300 text-[11px] font-bold">
                      <th className="py-2.5 px-2 text-center w-12 border-r border-slate-200">ลำดับ</th>
                      <th className="py-2.5 px-3 text-left border-r border-slate-200">รายการรายละเอียดระบบงานติดตั้ง</th>
                      <th className="py-2.5 px-2 text-right w-16 border-r border-slate-200">จำนวน</th>
                      <th className="py-2.5 px-2 text-center w-16 border-r border-slate-200">หน่วย</th>
                      <th className="py-2.5 px-2 text-right w-24 border-r border-slate-200">ราคา/หน่วย</th>
                      <th className="py-2.5 px-2 text-right w-28">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-100 align-top">
                        <td className="py-2.5 px-2 text-center text-slate-500 border-r border-slate-100">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-100 font-semibold">{item.description || "______________________"}</td>
                        <td className="py-2.5 px-2 text-right border-r border-slate-100">{item.quantity.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-center border-r border-slate-100">{item.unit || "รายการ"}</td>
                        <td className="py-2.5 px-2 text-right border-r border-slate-100">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-800">{(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}

                    {/* Fill blank space lines if fewer than 5 items */}
                    {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                      <tr key={`blank-${i}`} className="border-b border-slate-100 select-none">
                        <td className="py-3.5 px-2 border-r border-slate-100">&nbsp;</td>
                        <td className="py-3.5 px-3 border-r border-slate-100">&nbsp;</td>
                        <td className="py-3.5 px-2 border-r border-slate-100">&nbsp;</td>
                        <td className="py-3.5 px-2 border-r border-slate-100">&nbsp;</td>
                        <td className="py-3.5 px-2 border-r border-slate-100">&nbsp;</td>
                        <td className="py-3.5 px-2">&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total calculations block */}
              <div className="flex justify-between items-start gap-4 mt-8 font-sans">
                <div className="w-1/2 bg-amber-50/50 border border-amber-200/60 p-3.5 rounded text-xs leading-relaxed text-amber-900" style={{ color: "#854d0e", borderColor: "#f4d28b", backgroundColor: "#fff7eb" }}>
                  <p className="font-bold">จำนวนเงินตัวอักษร (Grand Total in Words):</p>
                  <p className="mt-1 font-semibold text-[13px]">{thaiBahtText || "ศูนย์บาทถ้วน"}</p>
                </div>
                
                <div className="w-1/2 text-xs">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="py-1 text-slate-500 text-left">รวมค่าแรงและอุปกรณ์ทั้งหมด:</td>
                        <td className="py-1 text-right font-semibold text-slate-700">
                          {displaySubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      
                      {vatAmount > 0 && (
                        <tr>
                          <td className="py-1 text-slate-500 text-left">
                            {vatType === "exclude" ? "ภาษีมูลค่าเพิ่ม 7% (แยก):" : "ภาษีมูลค่าเพิ่ม 7% (ในตัว):"}
                          </td>
                          <td className="py-1 text-right font-semibold text-rose-600">
                            {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                      
                      <tr className="border-t-2 border-double border-slate-400">
                        <td className="py-2 font-bold text-[13px] text-amber-950 text-left" style={{ color: "#561e23" }}>ยอดเงินสุทธิทั้งสิ้น (บาท):</td>
                        <td className="py-2 font-bold text-[15px] text-right" style={{ color: "#561e23" }}>
                          {displayGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Print Footer terms */}
            <div className="border-t border-slate-300 pt-6 mt-6 font-sans text-[11px] text-slate-600 leading-relaxed">
              <h4 className="font-bold text-amber-950 mb-1.5" style={{ color: "#561e23" }}>เงื่อนไขการรับประกันและบริการ</h4>
              {warrantyInfo && <p><strong>การรับประกัน:</strong> รับประกันงานเดินระบบไฟฟ้าเป็นเวลา {warrantyInfo}</p>}
              {paymentTerms && <p><strong>เงื่อนไขชำระเงิน:</strong> {paymentTerms}</p>}
              
              {bankName && bankAccountNumber && (
                <div className="mt-2 bg-slate-50 border border-slate-200 rounded p-2 text-[10px]">
                  <strong>ข้อมูลบัญชีธนาคารสำหรับโอนเงิน:</strong> ธนาคาร {bankName} &bull; ชื่อบัญชี {bankAccountName || "-"} &bull; เลขที่บัญชี {bankAccountNumber}
                </div>
              )}
              
              {notes && <p className="mt-2"><strong>หมายเหตุ:</strong> {notes}</p>}
              
              <div className="flex justify-between items-end mt-12 pt-6 border-t border-dashed border-slate-200">
                <div className="text-center w-1/3">
                  <p className="border-b border-slate-400 w-3/4 mx-auto pb-1 text-slate-300">&nbsp;</p>
                  <p className="mt-2 text-[10px]">ผู้รับเอกสาร / อนุมัติการว่าจ้าง</p>
                  <p className="text-[9px] text-slate-400">วันที่ ______/______/______</p>
                </div>
                
                <div className="text-center w-1/3">
                  <p className="border-b border-slate-400 w-3/4 mx-auto pb-1 font-bold font-sans text-slate-900">{techName}</p>
                  <p className="mt-2 text-[10px]">ผู้เสนอราคา / ช่างผู้เข้าติดตั้ง</p>
                  <p className="text-[9px] text-slate-400">วันที่ {formatThaiDate(date)}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
