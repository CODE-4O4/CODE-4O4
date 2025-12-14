import { NextResponse } from "next/server";
import { sendAcceptanceEmail } from "@/lib/email";

export const runtime = "nodejs";

const EMAILS = [
  "atul.sahu025@gmail.com",
  "rathoddhiraj310@gmail.com",
  "rajsamriddhi60@gmail.com",
  "layshah0737@gmail.com",
  "mahaveerjain1098765@gmail.com",
  "aryanpatel4306@gmail.com",
  "kartikmanmode12@gmail.com",
  "sgsingh9732@gmail.com",
  "2102508762@svyasa-sas.edu.in",
  "vineeshss005@gmail.com",
  "2102508756@svyasa-sas.edu.in",
  "jaidevbasandrai@gmail.com",
  "Saurabhyuvi14@gmail.com",
  "chsaisrija2007@gmail.com",
  "2122508901@svyasa-sas.edu.in",
  "pavithra210906@gmail.com",
  "dhanushrigp@gmail.com",
  "meghamadhurya123@gmail.com",
  "mallemputipujitha2007@gmail.com",
  "lekha.maruthi2007@gmail.com",
  "ashhhuthhy@gmail.com",
  "bhavishyap1406@gmail.com",
  "sakshisrinivaspeddarpeth@gmail.com",
  "zaibakhanzaiba9@gmail.com",
  "dacv2305@gmail.com",
  "aishwanth.dev@gmail.com",
  "govind.dhondale@gmail.com",
  "skandhanks10@gmail.com",
  "Vishwajeeth.rao.2021@gmail.com",
  "rudreshrashi@gmail.com",
  "pavithraa536@gmail.com",
  "poornachandrag98@gmail.com",
  "knoxsharma9741@gmail.com",
  "Prateekpoddar6106@gmail.com",
  "himanshusonawne2006@gmail.com",
  "varnikashri007@gmail.com",
  "tharaksreeram@gmail.com",
  "nandithamelmalgi@gmail.com",
  "megs200717@gmail.com",
  "meesachoshantt@gmail.com"
];

export async function GET(request: Request) {
  try {
    // Authentication check - only admins can trigger bulk emails
    const cookieHeader = request.headers.get("cookie");
    let isAdmin = false;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const userCookie = cookies.find(c => c.startsWith('code404-user='));
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          isAdmin = user && (user.role === 'admin' || user.role === 'mentor');
        } catch {  }
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    console.log(`🚀 Starting bulk acceptance email send to ${EMAILS.length} recipients...`);
    
    const results = [];
    for (const email of EMAILS) {
      if (!email || !email.includes('@')) continue;
      
      const result = await sendAcceptanceEmail(email.trim());
      results.push({ email, ...result });
      
      // Delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1000));
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Completed! Sent ${successCount}/${EMAILS.length} emails.`);

    return NextResponse.json({
      ok: true,
      total: EMAILS.length,
      successCount,
      results
    });
  } catch (error) {
    console.error("❌ Bulk send error:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
