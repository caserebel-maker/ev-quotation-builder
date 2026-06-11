import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate request data
    const {
      quotationNumber,
      date,
      validUntil,
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
      subtotal,
      vatAmount,
      grandTotal,
      thaiBahtText,
      notes,
      paymentTerms,
      bankName,
      bankAccountName,
      bankAccountNumber,
      warrantyInfo,
    } = data;

    if (!clientName || !items || items.length === 0) {
      return NextResponse.json(
        { error: "ข้อมูลลูกค้าหรือข้อมูลรายการไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    // Read API key from environment
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY in environment variables");
      return NextResponse.json(
        { error: "ระบบไม่ได้กำหนดค่า RESEND_API_KEY กรุณาตรวจสอบไฟล์คอนฟิก" },
        { status: 500 }
      );
    }

    // Format items as HTML rows for email
    const itemsHtml = items
      .map(
        (item: any, idx: number) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; text-align: center; font-size: 14px; color: #475569;">${idx + 1}</td>
        <td style="padding: 12px 8px; text-align: left; font-size: 14px; color: #1e293b;">
          <strong>${item.description}</strong>
        </td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; color: #475569;">${item.quantity.toLocaleString()}</td>
        <td style="padding: 12px 8px; text-align: center; font-size: 14px; color: #475569;">${item.unit || "รายการ"}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; color: #475569;">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: bold; color: #0f172a;">${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `
      )
      .join("");

    // Format VAT label
    let vatLabel = "ภาษีมูลค่าเพิ่ม 7%";
    if (vatType === "exclude") {
      vatLabel = `ภาษีมูลค่าเพิ่ม ${vatRate}% (แยกต่างหาก)`;
    } else if (vatType === "include") {
      vatLabel = `ภาษีมูลค่าเพิ่ม ${vatRate}% (รวมแล้ว)`;
    } else {
      vatLabel = "ภาษีมูลค่าเพิ่ม 0%";
    }

    // Format the email subject
    const subject = `ใบเสนอราคาติดตั้งวงจรที่ 2 EV - คุณ ${clientName} (เลขที่: ${quotationNumber})`;

    // Generate responsive HTML Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ใบเสนอราคา</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Noto Sans Thai';
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 680px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #561e23 0%, #8b263e 100%);
            color: #ffffff;
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 24px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
          }
          .card {
            background-color: #f1f5f9;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .card h3 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #561e23;
            font-size: 15px;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 6px;
          }
          .card p {
            margin: 4px 0;
            font-size: 13px;
            line-height: 1.5;
          }
          .table-container {
            margin-top: 20px;
            margin-bottom: 24px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 600;
            font-size: 13px;
            padding: 12px 8px;
            border-bottom: 2px solid #e2e8f0;
          }
          .summary-table {
            margin-left: auto;
            width: 50%;
            margin-top: 20px;
          }
          .summary-table td {
            padding: 6px 8px;
            font-size: 14px;
          }
          .total-text-box {
            background-color: #fff7eb;
            border: 1px solid #f4d28b;
            color: #854d0e;
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
            text-align: center;
          }
          .footer-section {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            font-size: 13px;
            line-height: 1.6;
          }
          .footer-section h4 {
            color: #561e23;
            margin-top: 0;
            margin-bottom: 8px;
          }
          .footer-section p {
            margin: 4px 0;
          }
          .bank-info {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-top: 10px;
          }
          .signature-section {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px dashed #e2e8f0;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ใบเสนอราคา (Quotation)</h1>
            <p>งานติดตั้งระบบไฟฟ้าวงจรที่ 2 สำหรับชาร์จรถยนต์ไฟฟ้า EV</p>
          </div>
          <div class="content">
            <!-- Details Grid -->
            <div style="margin-bottom: 20px; display: table; width: 100%;">
              <div style="display: table-cell; width: 50%; padding-right: 10px; vertical-align: top;">
                <div class="card" style="min-height: 120px;">
                  <h3>ผู้เสนอราคา (Technician / Provider)</h3>
                  <p><strong>ชื่อผู้ติดต่อ:</strong> ${techName || "-"}</p>
                  ${techCompany ? `<p><strong>บริษัท/ห้างหุ้นส่วน:</strong> ${techCompany}</p>` : ""}
                  <p><strong>เบอร์โทรศัพท์:</strong> ${techPhone || "-"}</p>
                  ${techEmail ? `<p><strong>อีเมล:</strong> ${techEmail}</p>` : ""}
                </div>
              </div>
              <div style="display: table-cell; width: 50%; padding-left: 10px; vertical-align: top;">
                <div class="card" style="min-height: 120px;">
                  <h3>ข้อมูลลูกค้า / สถานที่ติดตั้ง</h3>
                  <p><strong>ชื่อลูกค้า:</strong> ${clientName}</p>
                  <p><strong>เบอร์โทรศัพท์:</strong> ${clientPhone || "-"}</p>
                  <p><strong>สถานที่ติดตั้ง:</strong> ${clientAddress || "-"}</p>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 20px; font-size: 13px; color: #475569;">
              <span style="margin-right: 20px;"><strong>เลขที่เอกสาร:</strong> ${quotationNumber}</span>
              <span style="margin-right: 20px;"><strong>วันที่ออกเอกสาร:</strong> ${date}</span>
              <span><strong>ราคาเสนอมีผลถึง:</strong> ${validUntil || "-"}</span>
            </div>

            <!-- Items Table -->
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 40px; text-align: center;">ลำดับ</th>
                    <th style="text-align: left;">รายการงาน / วัสดุอุปกรณ์</th>
                    <th style="width: 60px; text-align: right;">จำนวน</th>
                    <th style="width: 60px; text-align: center;">หน่วย</th>
                    <th style="width: 100px; text-align: right;">ราคา/หน่วย</th>
                    <th style="width: 110px; text-align: right;">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Summary -->
            <div style="display: table; width: 100%; margin-bottom: 20px;">
              <div style="display: table-cell; width: 50%; vertical-align: bottom;">
                <!-- Thai text total in box -->
                <div class="total-text-box">
                  จำนวนเงินตัวอักษร: ${thaiBahtText}
                </div>
              </div>
              <div style="display: table-cell; width: 50%; vertical-align: top;">
                <table class="summary-table" style="width: 100%;">
                  <tr>
                    <td style="text-align: left; color: #475569;">รวมเงินก่อนภาษี:</td>
                    <td style="text-align: right; font-weight: 500;">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</td>
                  </tr>
                  ${
                    vatAmount > 0
                      ? `
                  <tr>
                    <td style="text-align: left; color: #475569;">${vatLabel}:</td>
                    <td style="text-align: right; font-weight: 500; color: #ef4444;">${vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</td>
                  </tr>
                  `
                      : ""
                  }
                  <tr style="border-top: 1.5px double #cbd5e1;">
                    <td style="text-align: left; font-weight: bold; color: #561e23; padding-top: 10px;">ยอดเงินสุทธิ:</td>
                    <td style="text-align: right; font-weight: bold; color: #561e23; font-size: 16px; padding-top: 10px;">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Footer terms -->
            <div class="footer-section">
              <h4>เงื่อนไขและรายละเอียดการติดตั้ง</h4>
              ${warrantyInfo ? `<p><strong>การรับประกัน:</strong> รับประกันผลงานติดตั้งเป็นระยะเวลา ${warrantyInfo}</p>` : ""}
              ${paymentTerms ? `<p><strong>เงื่อนไขการชำระเงิน:</strong> ${paymentTerms}</p>` : ""}
              
              ${
                bankName && bankAccountNumber
                  ? `
              <div class="bank-info">
                <strong>ข้อมูลการโอนเงินเพื่อชำระค่ามัดจำ/ค่าบริการ:</strong><br/>
                ธนาคาร: ${bankName} <br/>
                ชื่อบัญชี: ${bankAccountName || "-"} <br/>
                เลขที่บัญชี: ${bankAccountNumber}
              </div>
              `
                  : ""
              }
              
              ${notes ? `<p style="margin-top: 10px;"><strong>หมายเหตุเพิ่มเติม:</strong> ${notes}</p>` : ""}
            </div>

            <div class="signature-section">
              <p>ขอขอบพระคุณที่ให้ความไว้วางใจในการเสนอราคาครั้งนี้</p>
              <p style="margin-top: 15px; font-weight: 600;">ผู้เสนอราคา: _______________________________</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email using the Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "EV Quotation Generator <onboarding@resend.dev>",
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
