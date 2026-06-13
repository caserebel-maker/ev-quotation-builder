import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";

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
      techLineId,
      techFacebook,
      clientName,
      clientAddress,
      wireLength,
      breakerSize,
      chargerType,
      equipments,
      warrantyYears,
      workScope,
      earliestStartDate,
      materialCost,
      laborCost,
      totalAmount,
      pastWorks,
    } = data;

    if (!techName || !clientName || !clientAddress || !equipments || !Array.isArray(equipments) || equipments.length === 0 || !workScope || !warrantyYears || !earliestStartDate) {
      return NextResponse.json(
        { error: "ข้อมูลที่จำเป็นไม่ครบถ้วน รวมถึงรายละเอียดอุปกรณ์การรับประกัน ขั้นตอนงาน และวันที่เริ่มงาน" },
        { status: 400 }
      );
    }

    // SMTP credentials
    let smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    let smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    let smtpUser = process.env.SMTP_USER;
    let smtpPass = process.env.SMTP_PASS;
    let previewUrl = "";
    let isTestMode = false;

    if (!smtpUser || !smtpPass) {
      console.log("SMTP credentials missing. Creating Ethereal test account...");
      try {
        const testAccount = await nodemailer.createTestAccount();
        smtpHost = "smtp.ethereal.email";
        smtpPort = 587;
        smtpUser = testAccount.user;
        smtpPass = testAccount.pass;
        isTestMode = true;
      } catch (err) {
        console.error("Failed to create Ethereal test account:", err);
        return NextResponse.json(
          { error: "ระบบยังไม่ได้กำหนดค่าบัญชีส่งอีเมล (SMTP) และไม่สามารถสร้าง Ethereal account เพื่อทดสอบได้" },
          { status: 500 }
        );
      }
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

    // Process attachments
    const attachments = [];
    
    // Attach client site photo
    const sitePhotoPath = path.join(process.cwd(), "public", "images", "site-photo.png");
    attachments.push({
      filename: "site-photo.png",
      path: sitePhotoPath,
      cid: "sitePhoto",
    });

    // Process past works
    let pastWorksHtml = "";
    if (pastWorks && Array.isArray(pastWorks) && pastWorks.length > 0) {
      pastWorksHtml += `
        <h3 style="color: #003ec7; font-size: 15px; margin-bottom: 10px; font-weight: bold;">รูปภาพผลงานติดตั้งที่ผ่านมา (Past Works)</h3>
        <div style="background-color: #f3f4f5; border: 1px solid #c3c5d9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
      `;
      
      for (let i = 0; i < pastWorks.length; i += 3) {
        pastWorksHtml += "<tr>";
        for (let j = 0; j < 3; j++) {
          const idx = i + j;
          if (idx < pastWorks.length) {
            const pwBase64 = pastWorks[idx];
            const matches = pwBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              const contentType = matches[1];
              const base64Data = matches[2];
              const extension = contentType.split("/")[1] || "jpg";
              const cid = `pastWork${idx}`;
              
              attachments.push({
                filename: `past-work-${idx}.${extension}`,
                content: Buffer.from(base64Data, "base64"),
                cid: cid,
              });
              
              pastWorksHtml += `
                <td style="padding: 6px; width: 33.33%; vertical-align: top;">
                  <div style="border-radius: 6px; overflow: hidden; border: 1px solid #c3c5d9;">
                    <img src="cid:${cid}" alt="ผลงานที่ ${idx + 1}" style="width: 100%; display: block;" />
                  </div>
                </td>
              `;
            } else {
              pastWorksHtml += `<td style="padding: 6px; width: 33.33%;"></td>`;
            }
          } else {
            pastWorksHtml += `<td style="padding: 6px; width: 33.33%;"></td>`;
          }
        }
        pastWorksHtml += "</tr>";
      }
      
      pastWorksHtml += `
          </table>
        </div>
      `;
    }

    const thaiBahtText = arabToThaiBaht(totalAmount);
    const subject = `ใบเสนอราคาติดตั้งวงจรที่ 2 EV - คุณ ${clientName} (เลขที่: ${quotationNumber})`;

    // Format HTML Line Breaks for Work Scope
    const formattedWorkScope = workScope.replace(/\n/g, "<br>");

    // Format HTML List for Equipments
    const equipmentsHtml = equipments
      .map((eq: string, idx: number) => `<li style="margin-bottom: 4px;">${eq}</li>`)
      .join("");

    // Generate beautifully styled HTML Quotation Email matching theme
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ใบเสนอราคาติดตั้งจุดชาร์จ EV</title>
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
            <h1>ใบเสนอราคาติดตั้งระบบไฟฟ้า EV</h1>
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
                  <strong>เบอร์โทรศัพท์:</strong> ${techPhone}<br>
                  ${techLineId ? `<strong>LINE ID:</strong> ${techLineId}<br>` : ""}
                  ${techFacebook ? `<strong>Facebook:</strong> ${techFacebook}` : ""}
                </td>
                <td>
                  <h3>ข้อมูลลูกค้า (Customer)</h3>
                  <strong>ชื่อลูกค้า:</strong> ${clientName}<br>
                  <strong>สถานที่ติดตั้ง:</strong> ${clientAddress}
                </td>
              </tr>
            </table>

            <!-- Customer Site Photo & Location Map -->
            <h3 style="color: #003ec7; font-size: 15px; margin-bottom: 10px; font-weight: bold;">แผนที่และรูปภาพหน้างานจริงที่บ้านของลูกค้า</h3>
            <div style="background-color: #f3f4f5; border: 1px solid #c3c5d9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <div style="margin-bottom: 12px;">
                <a href="https://maps.app.goo.gl/XpSUWmP9L9vHsnUX9" target="_blank" style="color: #003ec7; text-decoration: underline; font-weight: bold; font-size: 13px;">
                  📍 ดูโลเคชันแผนที่หน้างาน (Google Maps)
                </a>
              </div>
              <div style="max-width: 440px; border-radius: 8px; overflow: hidden; border: 1px solid #c3c5d9; margin-bottom: 12px;">
                <img src="cid:sitePhoto" alt="รูปภาพหน้างานจริง" style="width: 100%; display: block;" />
              </div>
              <div style="font-size: 12px; color: #585f67; line-height: 1.5; padding-top: 8px; border-top: 1px dashed #c3c5d9;">
                🔴 <strong>กรอบสีแดง:</strong> ตำแหน่งติดตั้งมิเตอร์ไฟฟ้า<br>
                🔵 <strong>กรอบสีฟ้า:</strong> จุดที่จะติดตั้ง Home Charger
              </div>
            </div>

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
                      <strong>รายละเอียดอุปกรณ์และสเปกวัสดุเพิ่มเติม:</strong>
                      <ol style="margin-top: 4px; padding-left: 20px;">
                        ${equipmentsHtml}
                      </ol>
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

            <!-- Past Works Gallery -->
            ${pastWorksHtml}

            <!-- Footer Details -->
            <div style="font-size: 13px; margin-bottom: 24px; line-height: 1.6;">
              <strong>วันที่สามารถเริ่มงานได้เร็วที่สุด:</strong> ${earliestStartDate}<br>
              <strong>การรับประกันงานติดตั้ง:</strong> รับประกันผลงานติดตั้งและระบบไฟฟ้าเป็นระยะเวลา ${warrantyYears}
            </div>

            <!-- Footer notification -->
            <div style="background-color: #fde8e8; border-left: 4px solid #e53e3e; padding: 16px; border-radius: 4px; font-size: 13px; color: #9b1c1c; line-height: 1.6; margin-top: 24px; font-weight: bold;">
              ⚠️ เงื่อนไขการรับงานและชำระเงิน (สำคัญ):<br>
              ทางผู้ว่าจ้างไม่มีนโยบายการจ่ายค่ามัดจำล่วงหน้าใด ๆ ทั้งสิ้น หากช่างได้เข้าสำรวจหน้างานและประเมินราคารวมสุทธิเรียบร้อยแล้ว สามารถเริ่มดำเนินการติดตั้งได้ทันที โดยจะชำระเงินเต็มจำนวนหลังจากเสร็จสิ้นการติดตั้งและส่งมอบงานผ่านแล้วเท่านั้น หากช่างท่านใดไม่สะดวกในเงื่อนไขการทำงานและชำระเงินรูปแบบนี้ สามารถปฏิเสธไม่รับงานนี้ได้ทันทีโดยไม่มีข้อผูกมัดใด ๆ
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configure Nodemailer SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // SSL for port 465, TLS/none for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send using Nodemailer
    const info = await transporter.sendMail({
      from: isTestMode 
        ? `"ระบบเสนอราคาติดตั้งจุดชาร์จ EV (Test Mode)" <${smtpUser}>`
        : `"ระบบเสนอราคาติดตั้งจุดชาร์จ EV" <${smtpUser}>`,
      to: "tumyen@gmail.com",
      subject: isTestMode ? `[TEST] ${subject}` : subject,
      html: emailHtml,
      attachments: attachments,
    });

    if (isTestMode) {
      previewUrl = nodemailer.getTestMessageUrl(info) || "";
      console.log("Test email sent. Preview URL:", previewUrl);
    }

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId, 
      previewUrl, 
      isTestMode 
    });
  } catch (err: any) {
    console.error("send-quotation SMTP error:", err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการส่งอีเมลผ่าน SMTP" },
      { status: 500 }
    );
  }
}
