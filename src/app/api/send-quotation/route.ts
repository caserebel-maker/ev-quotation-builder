import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      techName,
      techPhone,
      clientName,
      clientAddress,
      wireLength,
      breakerSize,
      chargerType,
      equipmentDetails,
      warrantyYears,
      workScope,
      materialCost,
      laborCost,
      totalAmount,
    } = data;

    if (!techName || !clientName || !clientAddress || !equipmentDetails || !workScope || !warrantyYears) {
      return NextResponse.json(
        { error: "ข้อมูลที่จำเป็นไม่ครบถ้วน รวมถึงรายละเอียดอุปกรณ์การรับประกันและขั้นตอนงาน" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY in environment variables");
      return NextResponse.json(
        { error: "ระบบไม่ได้กำหนดค่า RESEND_API_KEY" },
        { status: 500 }
      );
    }

    // Auto-generate details for the formal PDF/Email layout
    const today = new Date();
    const formattedDate = today.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const yy = today.getFullYear().toString().substring(2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const quotationNumber = `QT-${yy}${mm}${dd}-${randomSuffix}`;

    const thaiBahtText = arabToThaiBaht(totalAmount);
    const subject = `ใบเสนอราคาติดตั้งวงจรที่ 2 EV - คุณ ${clientName} (เลขที่: ${quotationNumber})`;

    // Format HTML Line Breaks for Work Scope
    const formattedWorkScope = workScope.replace(/\n/g, "<br>");

    // Generate beautifully styled HTML Quotation Email matching VoltLink Pro theme
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ใบเสนอราคา VoltLink Pro</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f8f9fa;
            color: #191c1d;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 680px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            overflow: hidden;
            border: 1px solid #c3c5d9;
          }
          .header {
            background-color: #003ec7;
            color: #ffffff;
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 24px;
          }
          .details-table {
            width: 100%;
            margin-bottom: 24px;
            border-collapse: collapse;
          }
          .details-table td {
            padding: 12px;
            background-color: #f3f4f5;
            border: 1px solid #c3c5d9;
            width: 50%;
            vertical-align: top;
            font-size: 13px;
            line-height: 1.6;
          }
          .details-table h3 {
            margin-top: 0;
            margin-bottom: 8px;
            color: #003ec7;
            font-size: 14px;
            border-bottom: 1px dashed #c3c5d9;
            padding-bottom: 4px;
          }
          .meta-info {
            font-size: 13px;
            color: #585f67;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid #c3c5d9;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          .items-table th {
            background-color: #f3f4f5;
            color: #191c1d;
            font-weight: 600;
            font-size: 13px;
            padding: 12px 10px;
            border: 1px solid #c3c5d9;
            text-align: left;
          }
          .items-table td {
            padding: 12px 10px;
            border: 1px solid #c3c5d9;
            font-size: 13px;
            line-height: 1.5;
          }
          .total-box {
            background-color: #003ec7;
            color: #ffffff;
            padding: 16px;
            border-radius: 8px;
            text-align: right;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 24px;
          }
          .total-words {
            font-size: 13px;
            font-weight: normal;
            opacity: 0.9;
            margin-top: 4px;
          }
          .footer-note {
            background-color: #e7e8e9;
            border-left: 4px solid #585f67;
            padding: 12px;
            border-radius: 4px;
            font-size: 12px;
            color: #585f67;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VoltLink Pro</h1>
            <p>ใบเสนอราคาติดตั้งระบบไฟฟ้าวงจรที่ 2 สำหรับชาร์จรถ EV</p>
          </div>
          <div class="content">
            <div class="meta-info">
              <table style="width: 100%;">
                <tr>
                  <td><strong>เลขที่ใบเสนอราคา:</strong> ${quotationNumber}</td>
                  <td style="text-align: right;"><strong>วันที่ออกเอกสาร:</strong> ${formattedDate}</td>
                </tr>
              </table>
            </div>

            <!-- Customer & Tech Details -->
            <table class="details-table">
              <tr>
                <td>
                  <h3>ช่างผู้ติดตั้ง (Technician)</h3>
                  <strong>ชื่อช่าง:</strong> ${techName}<br>
                  <strong>เบอร์โทรศัพท์:</strong> ${techPhone}
                </td>
                <td>
                  <h3>ข้อมูลลูกค้า (Customer)</h3>
                  <strong>ชื่อลูกค้า:</strong> ${clientName}<br>
                  <strong>สถานที่ติดตั้ง:</strong> ${clientAddress}
                </td>
              </tr>
            </table>

            <!-- Materials & Scope specifications table -->
            <h3 style="color: #003ec7; font-size: 15px; margin-bottom: 10px; font-weight: bold;">รายละเอียดวัสดุและอุปกรณ์ทางเทคนิค</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">ลำดับ</th>
                  <th>รายการงาน / คุณลักษณะอุปกรณ์</th>
                  <th style="width: 80px; text-align: center;">จำนวน</th>
                  <th style="width: 120px; text-align: right;">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="text-align: center;">1</td>
                  <td>
                    <strong>ค่าอุปกรณ์และอะไหล่มาตรฐานงานติดตั้งวงจรที่ 2</strong><br>
                    <span style="font-size: 12px; color: #585f67;">
                      - เครื่องชาร์จประเภท: ${chargerType}<br>
                      - ขนาดสายไฟหลัก: สายทองแดง THW 1x10 sq.mm. เดินร้อยท่อแบบหนา<br>
                      - ระยะเดินสายรวม: ${wireLength} เมตร<br>
                      - เซอร์กิตเบรกเกอร์เมน (MCB): ขนาด ${breakerSize} พร้อมตู้ครอบควบคุมเรียบร้อย<br>
                      - <strong>สเปกอุปกรณ์และวัสดุที่ใช้:</strong> ${equipmentDetails}
                    </span>
                  </td>
                  <td style="text-align: center;">1 งาน</td>
                  <td style="text-align: right; font-weight: bold;">${materialCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</td>
                </tr>
                <tr>
                  <td style="text-align: center;">2</td>
                  <td>
                    <strong>ค่าแรงดำเนินการติดตั้งและขั้นตอนการทำงาน</strong><br>
                    <span style="font-size: 12px; color: #585f67;">
                      <strong>ขั้นตอนและขอบเขตการทำงานโดยละเอียด:</strong><br>
                      ${formattedWorkScope}
                    </span>
                  </td>
                  <td style="text-align: center;">1 งาน</td>
                  <td style="text-align: right; font-weight: bold;">${laborCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</td>
                </tr>
              </tbody>
            </table>

            <!-- Total Price Box -->
            <div class="total-box">
              ยอดสุทธิรวมทั้งสิ้น: ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท
              <div class="total-words">(${thaiBahtText})</div>
            </div>

            <!-- Footer Details -->
            <div style="font-size: 13px; margin-bottom: 24px; line-height: 1.6;">
              <strong>การรับประกันงานติดตั้ง:</strong> รับประกันผลงานติดตั้งและระบบไฟฟ้าเป็นระยะเวลา ${warrantyYears}
            </div>

            <!-- Footer notification -->
            <div class="footer-note">
              <strong>ข้อชี้แจงมาตรฐานความปลอดภัย:</strong><br>
              ใบเสนอราคานี้จัดทำขึ้นผ่านระบบ VoltLink Pro และได้ส่งสำเนาเข้าสู่ฐานข้อมูลกลางที่ <strong>tumyen@gmail.com</strong> เรียบร้อยแล้ว เพื่อส่งมอบต่อให้วิศวกรไฟฟ้าในการตรวจสอบคุณภาพและระดับความปลอดภัยตามเกณฑ์มาตรฐานทางวิศวกรรมต่อไป
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send using Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "VoltLink Pro <onboarding@resend.dev>",
        to: ["tumyen@gmail.com"],
        subject: subject,
        html: emailHtml,
      }),
    });

    const resJson = await response.json();

    if (!response.ok) {
      console.error("Resend API Error:", resJson);
      return NextResponse.json(
        { error: resJson.message || "ล้มเหลวในการส่งอีเมลผ่าน Resend" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, messageId: resJson.id });
  } catch (err: any) {
    console.error("send-quotation endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
