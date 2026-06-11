"use client";

import React, { useState } from "react";

export default function Home() {
  // Form states
  const [techName, setTechName] = useState("");
  const [techPhone, setTechPhone] = useState("");
  const [clientName, setClientName] = useState("");
  
  // Pre-fill the installation address as requested
  const [clientAddress, setClientAddress] = useState(
    "หมู่บ้าน กฤตยา ซอย 2/1 บางนาตราด บางพลีใหญ่ บางพลี สมุทรปราการ"
  );
  
  const [wireLength, setWireLength] = useState("");
  const [breakerSize, setBreakerSize] = useState("40A");
  const [chargerType, setChargerType] = useState("Wallbox (7.4kW)");
  
  // Separate equipment list into 10 fields
  const [equipments, setEquipments] = useState<string[]>(Array(10).fill(""));
  
  const [warrantyYears, setWarrantyYears] = useState("1 ปี");
  const [workScope, setWorkScope] = useState("");
  
  // Initialize costs as empty strings so the technician fills them in themselves
  const [materialCost, setMaterialCost] = useState<number | "">("");
  const [laborCost, setLaborCost] = useState<number | "">("");

  // Submission UI states
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    
    if (!techName || !techPhone || !clientName || !clientAddress || !workScope || !warrantyYears) {
      setErrorMessage("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน รวมถึงขั้นตอนการทำงาน");
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

    try {
      const response = await fetch("/api/send-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          techName,
          techPhone,
          clientName,
          clientAddress,
          wireLength: wireLength || "0",
          breakerSize,
          chargerType,
          equipments: activeEquipments,
          warrantyYears,
          workScope,
          materialCost: Number(materialCost),
          laborCost: Number(laborCost),
          totalAmount,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }

      setIsSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

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
            <h1 className="font-headline-sm text-2xl font-bold text-[#003ec7]">VoltLink Pro</h1>
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
              </div>
            </div>

            {/* Section 2: ข้อมูลลูกค้า */}
            <div className="md:col-span-6 bg-white p-6 border border-[#c3c5d9] rounded-xl shadow-sm">
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
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">ประเภทอุปกรณ์ชาร์จ</label>
                  <select
                    value={chargerType}
                    onChange={(e) => setChargerType(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="Wallbox (7.4kW)">Wallbox (7.4kW)</option>
                    <option value="Wallbox (11kW)">Wallbox (11kW)</option>
                    <option value="Wallbox (22kW)">Wallbox (22kW)</option>
                    <option value="Portable Charger">Portable Charger</option>
                  </select>
                </div>
                
                {/* Row 2: Warranty */}
                <div>
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">การรับประกันงานติดตั้ง</label>
                  <input
                    type="text"
                    value={warrantyYears}
                    onChange={(e) => setWarrantyYears(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                    placeholder="เช่น 1 ปี, 2 ปี หรือ ไม่มีการรับประกัน"
                    required
                  />
                </div>

                {/* Row 3: Scope of Work details */}
                <div className="md:col-span-2">
                  <label className="block font-label-md text-sm text-[#585f67] mb-1">รายการขั้นตอนการทำงานและขอบเขตงานโดยละเอียด</label>
                  <textarea
                    value={workScope}
                    onChange={(e) => setWorkScope(e.target.value)}
                    className="w-full bg-[#f3f4f5] border border-[#c3c5d9] p-3 rounded-lg font-body-md text-[#191c1d] focus:outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]/10"
                    placeholder="ระบุขั้นตอนอย่างละเอียด เช่น:&#13;&#10;1. เดินสายไฟเมนจากตู้ออกมาตู้ชาร์จ&#13;&#10;2. ติดตั้งตู้คอนซูเมอร์ย่อยพร้อมอุปกรณ์ป้องกันไฟรั่ว&#13;&#10;3. ปักกราวด์ร็อดทองแดง 2.4 ม. และต่อสายดิน..."
                    required
                    rows={2}
                  />
                </div>

                {/* Sub-grid for 10 separate Equipment Items */}
                <div className="md:col-span-3 border-t border-[#c3c5d9] pt-6 mt-2">
                  <label className="block font-label-md text-sm text-[#191c1d] mb-3 font-semibold">
                    รายละเอียดอุปกรณ์และสเปกวัสดุที่จะใช้ (ระบุสูงสุด 10 รายการ)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
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

          {/* Additional Instruction Card */}
          <div className="bg-[#e7e8e9] border border-[#737688] p-4 rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-[#585f67]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
              info
            </span>
            <p className="font-label-md text-sm text-[#585f67] leading-relaxed">
              ใบเสนอราคานี้จะถูกส่งสำเนาไปยังระบบกลาง <strong>tumyen@gmail.com</strong> เพื่อการตรวจสอบมาตรฐานความปลอดภัยโดยวิศวกรไฟฟ้า
            </p>
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
              setClientName("");
              setClientAddress("หมู่บ้าน กฤตยา ซอย 2/1 บางนาตราด บางพลีใหญ่ บางพลี สมุทรปราการ");
              setWireLength("");
              setEquipments(Array(10).fill(""));
              setWarrantyYears("1 ปี");
              setWorkScope("");
              setMaterialCost("");
              setLaborCost("");
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
    </div>
  );
}
