"use client";

import React, { useState } from "react";

export default function Home() {
  // Form states
  const [techName, setTechName] = useState("");
  const [techPhone, setTechPhone] = useState("");
  const [techLineId, setTechLineId] = useState("");
  const [techFacebook, setTechFacebook] = useState("");
  const [clientName, setClientName] = useState("");
  
  // Pre-fill the installation address as requested
  const [clientAddress, setClientAddress] = useState(
    "หมู่บ้าน กฤตยา ซอย 2/1 บางนาตราด บางพลีใหญ่ บางพลี สมุทรปราการ"
  );
  
  const [wireLength, setWireLength] = useState("");
  const [breakerSize, setBreakerSize] = useState("40A");
  const [chargerType, setChargerType] = useState("เครื่องชาร์จของลูกค้าเอง (7.4kW)");
  
  // Separate equipment list into 10 fields
  const [equipments, setEquipments] = useState<string[]>(Array(10).fill(""));
  
  const [warrantyYears, setWarrantyYears] = useState("1 ปี");
  const [workScope, setWorkScope] = useState("");
  const [earliestStartDate, setEarliestStartDate] = useState("");
  
  // Initialize costs as empty strings so the technician fills them in themselves
  const [materialCost, setMaterialCost] = useState<number | "">("");
  const [laborCost, setLaborCost] = useState<number | "">("");

  // Submission UI states
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [testMailUrl, setTestMailUrl] = useState("");

  // Past works images state
  const [pastWorks, setPastWorks] = useState<string[]>([]);

  // Lightbox modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const handlePastWorksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Check total files count (current + incoming)
      if (pastWorks.length + filesArray.length > 5) {
        setErrorMessage("สามารถอัปโหลดรูปภาพผลงานได้สูงสุดไม่เกิน 5 รูปครับ");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Check size limit for each file (3 MB)
      const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
      const oversizedFiles = filesArray.filter(file => file.size > MAX_SIZE);
      if (oversizedFiles.length > 0) {
        setErrorMessage("ขนาดของแต่ละรูปภาพต้องไม่เกิน 3 MB ครับ");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Clear any previous error message if validations pass
      setErrorMessage("");

      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setPastWorks((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePastWork = (index: number) => {
    setPastWorks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalAmount = (Number(materialCost) || 0) + (Number(laborCost) || 0);

  const handleEquipmentChange = (idx: number, value: string) => {
    setEquipments(prev => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty equipment inputs
    const activeEquipments = equipments.filter(eq => eq.trim() !== "");
    
    if (!techName || !techPhone || !clientName || !clientAddress || !workScope || !warrantyYears || !earliestStartDate) {
      setErrorMessage("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน รวมถึงขั้นตอนการทำงานและวันที่พร้อมเริ่มงาน");
      return;
    }
    if (activeEquipments.length === 0) {
      setErrorMessage("กรุณาระบุรายละเอียดอุปกรณ์ที่จะใช้ติดตั้งอย่างน้อย 1 รายการ");
      return;
    }
    if (materialCost === "" || laborCost === "") {
      setErrorMessage("กรุณาระบุค่าอุปกรณ์และค่าแรงติดตั้ง");
      return;
    }

    setIsSending(true);
    setErrorMessage("");
    setTestMailUrl("");

    try {
      const response = await fetch("/api/send-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          techName,
          techPhone,
          techLineId,
          techFacebook,
          clientName,
          clientAddress,
          wireLength: wireLength || "0",
          breakerSize,
          chargerType,
          equipments: activeEquipments,
          warrantyYears,
          workScope,
          earliestStartDate,
          materialCost: Number(materialCost),
          laborCost: Number(laborCost),
          totalAmount,
          pastWorks,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }

      setIsSuccess(true);
      if (resData.previewUrl) {
        setTestMailUrl(resData.previewUrl);
      } else {
        setTestMailUrl("");
      }
      
      // Reset success state after 15 seconds if it has previewUrl, else 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, resData.previewUrl ? 15000 : 3000);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa] border-b border-[#c3c5d9]">
        <div className="flex items-center px-4 md:px-10 h-16 w-full max-w-[1280px] mx-auto justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#003ec7] text-2xl font-normal" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
              electric_bolt
            </span>
            <h1 className="font-headline-sm text-2xl font-bold text-[#003ec7]">ระบบเสนอราคาติดตั้งจุดชาร์จ EV</h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <a className="font-label-md text-sm text-[#003ec7] font-bold" href="#">New Quote</a>
              <a className="font-label-md text-sm text-[#585f67] hover:text-[#003ec7] transition-colors" href="#">History</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="pt-24 px-4 md:px-10 max-w-[1280px] mx-auto">
        {/* Hero Header */}
        <div className="mb-6">
          <h2 className="font-headline-md text-[30px] md:text-[48px] md:leading-[56px] text-[#191c1d] font-bold mb-2">
            ใบเสนอราคาติดตั้งจุดชาร์จรถ EV (วงจรที่ 2)
          </h2>
          <p className="font-body-md text-base text-[#585f67] max-w-2xl">
            ระบบสร้างใบเสนอราคามาตรฐานสำหรับงานติดตั้งระบบไฟฟ้าวงจรที่ 2 (Second Circuit) พร้อมคำนวณค่าใช้จ่ายอัตโนมัติ
          </p>
        </div>

        {/* Important Condition Card */}
        <div className="bg-red-50 border-2 border-red-300 p-5 rounded-lg flex items-start gap-3 mb-6">
          <span className="material-symbols-outlined text-red-600 text-2xl shrink-0" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
            warning
          </span>
          <div>
            <h4 className="font-headline-sm text-base font-bold text-red-700 mb-1">
              เงื่อนไขการรับงานและชำระเงิน (โปรดอ่านและทำความเข้าใจก่อนประเมินราคา)
            </h4>
            <p className="font-body-md text-sm text-red-700 font-bold leading-relaxed">
              ทางผู้ว่าจ้างไม่มีนโยบายการจ่ายค่ามัดจำล่วงหน้าใด ๆ ทั้งสิ้น หากช่างได้เข้าสำรวจหน้างานและประเมินราคารวมสุทธิเรียบร้อยแล้ว สามารถเริ่มดำเนินการติดตั้งได้ทันที โดยจะชำระเงินเต็มจำนวนหลังจากเสร็จสิ้นการติดตั้งและส่งมอบงานผ่านแล้วเท่านั้น หากช่างท่านใดไม่สะดวกในเงื่อนไขการทำงานและชำระเงินรูปแบบนี้ สามารถปฏิเสธไม่รับงานนี้ได้ทันทีโดยไม่มีข้อผูกมัดใด ๆ
            </p>
          </div>
        </div>

        {/* Success notification banner */}
        {isSuccess && (
          <div className="mb-6 p-5 rounded-lg bg-green-50 border-2 border-green-300 text-green-800 flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-base">
              <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
              <span>บันทึกและส่งใบเสนอราคาสำเร็จเรียบร้อยแล้ว!</span>
            </div>
            {testMailUrl ? (
              <div className="bg-white p-4 rounded-lg border border-green-200 mt-1 flex flex-col gap-2.5">
                <p className="font-body-md text-sm text-[#585f67] leading-relaxed">
                  📢 <strong>หมายเหตุ (โหมดทดสอบ):</strong> ระบบไม่พบการตั้งค่าบัญชีอีเมลจริง จึงส่งข้อมูลผ่านผู้ให้บริการจำลอง Ethereal Email เพื่อให้คุณทดสอบพรีวิวดูหน้าตาใบเสนอราคาที่ส่งไปจริงได้ทันที
                </p>
                <a
                  href={testMailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#003ec7] hover:bg-[#003ec7]/90 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-all w-fit shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  คลิกที่นี่เพื่อเปิดดูตัวอย่างอีเมลใบเสนอราคา
                </a>
              </div>
            ) : (
              <p className="font-body-md text-sm text-green-700">
                ระบบได้นำส่งสำเนาใบเสนอราคาไปยังอีเมลปลายทาง <strong>tumyen@gmail.com</strong> เรียบร้อยแล้วครับ
              </p>
            )}
          </div>
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8" id="quoteForm">
          {/* Grid Layout for Sections */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Section 1: ข้อมูลช่าง */}
            <div className="md:col-span-6 bg-white p-6 border border-[#c3c5d9] rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#003ec7]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                  engineering
                </span>
                <h3 className="font-headline-sm text-2xl font-bold text-[#191c1d]">ข้อมูลช่าง</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">ช่างผู้ติดตั้ง</label>
                  <input
                    type="text"
                    value={techName}
                    onChange={(e) => setTechName(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                    placeholder="ระบุชื่อ-นามสกุล ช่าง"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-md text-sm text-[#585f67] mb-1 font-sans">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    value={techPhone}
                    onChange={(e) => setTechPhone(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                    placeholder="0XX-XXX-XXXX"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">LINE ID</label>
                  <input
                    type="text"
                    value={techLineId}
                    onChange={(e) => setTechLineId(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                    placeholder="ระบุ Line ID"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">Facebook</label>
                  <input
                    type="text"
                    value={techFacebook}
                    onChange={(e) => setTechFacebook(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                    placeholder="ระบุ Facebook (เช่น ชื่อโปรไฟล์ หรือเพจ)"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: ข้อมูลลูกค้า */}
            <div className="md:col-span-6 bg-white p-6 border border-[#c3c5d9] rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-[#003ec7]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                    person
                  </span>
                  <h3 className="font-headline-sm text-2xl font-bold text-[#191c1d]">ข้อมูลลูกค้า</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-sm text-[#585f67] mb-1">ชื่อลูกค้า</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                      placeholder="ระบุชื่อลูกค้า / นิติบุคคล"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-sm text-[#585f67] mb-1">สถานที่ติดตั้ง</label>
                    <textarea
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                      placeholder="บ้านเลขที่, แขวง/ตำบล, เขต/อำเภอ..."
                      required
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              {/* รูปภาพและโลเคชันหน้างานจริงของลูกค้า */}
              <div className="pt-6 mt-6 border-t border-[#c3c5d9]/60">
                <span className="block font-label-md text-sm text-[#191c1d] mb-2 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#003ec7] text-lg">house</span>
                  รูปภาพและโลเคชันหน้างานจริง
                </span>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://maps.app.goo.gl/XpSUWmP9L9vHsnUX9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#003ec7] hover:underline font-body-md text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-[#003ec7] text-lg">location_on</span>
                    ดูโลเคชันแผนที่หน้างาน (Google Maps)
                  </a>
                  <div className="grid grid-cols-12 gap-3">
                    <div 
                      className="col-span-8 relative h-44 rounded-lg overflow-hidden border border-[#c3c5d9] cursor-zoom-in group" 
                      onClick={() => {
                        setModalImgSrc("/images/site-photo.png");
                        setModalTitle("รูปภาพหน้างานจริง (บ้านของลูกค้า)");
                        setIsModalOpen(true);
                      }}
                    >
                      <img
                        src="/images/site-photo.png"
                        alt="รูปภาพหน้างานจริง"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-1.5 flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-sm">zoom_in</span>
                      </div>
                    </div>
                    
                    <div 
                      className="col-span-4 relative h-44 rounded-lg overflow-hidden border border-[#c3c5d9] bg-[#f8f9fa] flex items-center justify-center p-2 cursor-zoom-in group"
                      onClick={() => {
                        setModalImgSrc("/images/charger-model.png");
                        setModalTitle("เครื่องชาร์จที่ผู้ว่าจ้างจัดเตรียมไว้ (GWM Wallbox)");
                        setIsModalOpen(true);
                      }}
                    >
                      <img
                        src="/images/charger-model.png"
                        alt="เครื่องชาร์จของลูกค้า"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-black/60 text-[9px] text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">เครื่องชาร์จ GWM</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-[#585f67] bg-[#f3f4f5] p-3 rounded-lg border border-[#c3c5d9]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d32f2f] shrink-0 inline-block"></span>
                      <span><strong>กรอบสีแดง:</strong> ตำแหน่งติดตั้งมิเตอร์ไฟฟ้า</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1976d2] shrink-0 inline-block"></span>
                      <span><strong>กรอบสีฟ้า:</strong> จุดที่จะติดตั้ง Home Charger</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: รายละเอียดการติดตั้ง */}
            <div className="md:col-span-12 bg-white p-6 border border-[#c3c5d9] rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#003ec7]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                  settings_input_component
                </span>
                <h3 className="font-headline-sm text-2xl font-bold text-[#191c1d]">รายละเอียดการติดตั้ง</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Row 1 */}
                <div>
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">ระยะสายไฟ (เมตร)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={wireLength}
                      onChange={(e) => setWireLength(e.target.value)}
                      className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 pr-12 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                      placeholder="0"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-sm text-xs text-[#585f67] font-semibold">ม.</span>
                  </div>
                </div>
                <div>
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">ขนาดเบรกเกอร์ (MCB)</label>
                  <select
                    value={breakerSize}
                    onChange={(e) => setBreakerSize(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="16A">16A</option>
                    <option value="32A">32A</option>
                    <option value="40A">40A</option>
                    <option value="50A">50A</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">ประเภทเครื่องชาร์จ (ลูกค้ามีอุปกรณ์อยู่แล้ว)</label>
                  <select
                    value={chargerType}
                    onChange={(e) => setChargerType(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="เครื่องชาร์จของลูกค้าเอง (7.4kW)">เครื่องชาร์จของลูกค้าเอง (7.4kW)</option>
                    <option value="เครื่องชาร์จของลูกค้าเอง (11kW)">เครื่องชาร์จของลูกค้าเอง (11kW)</option>
                    <option value="เครื่องชาร์จของลูกค้าเอง (22kW)">เครื่องชาร์จของลูกค้าเอง (22kW)</option>
                    <option value="เครื่องชาร์จของลูกค้าเอง (Portable)">เครื่องชาร์จของลูกค้าเอง (Portable)</option>
                  </select>
                </div>
                
                {/* Row 2: Warranty & Scope & Start Date */}
                <div className="md:col-span-3">
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">วันที่สามารถเริ่มงานได้เร็วที่สุด</label>
                  <input
                    type="text"
                    value={earliestStartDate}
                    onChange={(e) => setEarliestStartDate(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                    placeholder="เช่น เริ่มได้ทันที, ภายใน 3 วัน หรือ ระบุวันที่..."
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">การรับประกันงานติดตั้ง</label>
                  <input
                    type="text"
                    value={warrantyYears}
                    onChange={(e) => setWarrantyYears(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                    placeholder="เช่น 1 ปี"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">ขั้นตอนการทำงาน</label>
                  <textarea
                    value={workScope}
                    onChange={(e) => setWorkScope(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                    placeholder="ระบุขั้นตอนการติดตั้ง..."
                    required
                    rows={2}
                  />
                </div>

                {/* Sub-grid for 10 separate Equipment Items */}
                <div className="md:col-span-3 border-t border-[#c3c5d9] pt-6 mt-2">
                  <label className="block font-label-md text-sm text-[#191c1d] mb-3 font-semibold">
                    รายละเอียดอุปกรณ์และสเปกวัสดุที่จะใช้ (ระบุสูงสุด 10 รายการ)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-6">
                    {equipments.map((eq, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="font-label-sm text-xs text-[#585f67] w-6 shrink-0 text-right">{idx + 1}.</span>
                        <input
                          type="text"
                          value={eq}
                          onChange={(e) => handleEquipmentChange(idx, e.target.value)}
                          placeholder={
                            idx === 0 
                              ? "เช่น สายไฟเมน THW 1x10 sq.mm." 
                              : idx === 1 
                                ? "เช่น ท่อร้อยสายไฟ PVC ตราช้าง" 
                                : "เช่น เบรกเกอร์ยี่ห้อ..."
                          }
                          className="w-full bg-[#f3f4f5] border border-[#c3c5d9] px-3 py-2 rounded-lg font-body-md text-xs text-[#191c1d] focus:outline-none focus:border-[#003ec7]"
                          required={idx === 0} // Only make the first item strictly required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Past Works (Portfolio) Section */}
                <div className="md:col-span-3 border-t border-[#c3c5d9] pt-6 mt-4">
                  <label className="block font-label-md text-sm text-[#191c1d] mb-2 font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#003ec7]">photo_library</span>
                    อัปโหลดรูปภาพผลงานที่เคยทำ (Past Works)
                  </label>
                  <p className="font-body-md text-xs text-[#585f67] mb-3">
                    อัปโหลดรูปภาพผลงานติดตั้งที่ผ่านมาของช่างเพื่อแสดงประวัติผลงาน (สูงสุด 5 รูป, รูปละไม่เกิน 3 MB)
                  </p>
                  <div className="flex flex-col gap-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePastWorksChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-semibold
                        file:bg-[#003ec7]/10 file:text-[#003ec7]
                        hover:file:bg-[#003ec7]/20
                        cursor-pointer"
                    />
                    
                    {/* Previews */}
                    {pastWorks.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-2">
                        {pastWorks.map((base64, index) => (
                          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-[#c3c5d9]">
                            <img
                              src={base64}
                              alt={`ผลงานที่ ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePastWork(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                              style={{ width: "24px", height: "24px" }}
                            >
                              <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Section 4: สรุปค่าใช้จ่าย */}
            <div className="md:col-span-12 lg:col-span-8 lg:col-start-3 bg-[#003ec7] text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                  payments
                </span>
              </div>
              <h3 className="font-headline-sm text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                  receipt_long
                </span>
                สรุปค่าใช้จ่าย
              </h3>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="font-body-md text-base">ค่าอุปกรณ์และอะไหล่</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={materialCost}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMaterialCost(val === "" ? "" : parseFloat(val) || 0);
                      }}
                      placeholder="ระบุจำนวนเงิน"
                      className="w-36 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-lg text-right font-bold text-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-white/50 placeholder-white/40"
                      required
                    />
                    <span className="font-label-md text-sm font-semibold">บาท</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="font-body-md text-base">ค่าแรงติดตั้ง</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={laborCost}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLaborCost(val === "" ? "" : parseFloat(val) || 0);
                      }}
                      placeholder="ระบุจำนวนเงิน"
                      className="w-36 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-lg text-right font-bold text-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-white/50 placeholder-white/40"
                      required
                    />
                    <span className="font-label-md text-sm font-semibold">บาท</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-headline-sm text-xl font-bold">รวมเงินสุทธิ</span>
                  <span className="font-headline-md text-[30px] font-semibold" id="total_amount">
                    {totalAmount.toLocaleString()} บาท
                  </span>
                </div>
              </div>
            </div>
            
          </div>

        </form>
      </main>

      {/* Bottom Action Bar / Footer Navigation */}
      <div className="fixed bottom-0 left-0 w-full flex justify-around items-center py-4 px-4 bg-white border-t border-[#c3c5d9] z-50">
        <div className="max-w-[1280px] w-full flex flex-col md:flex-row gap-4 items-center justify-between mx-auto">
          <button 
            type="button" 
            onClick={() => {
              setTechName("");
              setTechPhone("");
              setTechLineId("");
              setTechFacebook("");
              setClientName("");
              setClientAddress("หมู่บ้าน กฤตยา ซอย 2/1 บางนาตราด บางพลีใหญ่ บางพลี สมุทรปราการ");
              setWireLength("");
              setEquipments(Array(10).fill(""));
              setWarrantyYears("1 ปี");
              setWorkScope("");
              setEarliestStartDate("");
              setMaterialCost("");
              setLaborCost("");
              setPastWorks([]);
              setTestMailUrl("");
              setErrorMessage("");
            }}
            className="order-2 md:order-1 flex items-center justify-center text-[#585f67] hover:text-[#191c1d] px-6 py-2 hover:bg-[#d9e0ea] transition-all active:scale-95 rounded-full font-label-md text-sm font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined mr-2 text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
              close
            </span>
            Cancel
          </button>
          
          <button 
            type="submit"
            form="quoteForm"
            disabled={isSending}
            className={`order-1 md:order-2 flex items-center justify-center text-white rounded-full px-8 py-4 shadow-md transition-all active:scale-95 font-label-md text-sm font-bold w-full md:w-auto cursor-pointer ${
              isSuccess 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-[#003ec7] hover:bg-[#003ec7]/90 disabled:opacity-50"
            }`}
          >
            {isSending ? (
              <>
                <span className="material-symbols-outlined animate-spin mr-2 text-xl">progress_activity</span>
                กำลังส่ง...
              </>
            ) : isSuccess ? (
              <>
                <span className="material-symbols-outlined mr-2 text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                  check_circle
                </span>
                ส่งเรียบร้อยแล้ว
              </>
            ) : (
              <>
                <span className="material-symbols-outlined mr-2 text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                  send
                </span>
                บันทึกและส่งใบเสนอราคา
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lightbox Modal for Site Photo & Charger */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center animate-fade-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all cursor-pointer flex items-center justify-center"
              style={{ width: '40px', height: '40px' }}
            >
              <span className="material-symbols-outlined text-white">close</span>
            </button>
            <img
              src={modalImgSrc}
              alt={modalTitle}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/80 font-body-md text-sm mt-4 text-center bg-black/40 px-4 py-2 rounded-full border border-white/10">
              {modalTitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
