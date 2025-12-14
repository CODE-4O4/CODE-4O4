import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/firebase/admin";
import { sendCredentialsEmail } from "@/lib/email";
import { verifyAdminAuth } from "@/lib/auth-utils";


export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { ok: false, message: auth.error || "Unauthorized" },
        { status: 401 },
      );
    }

    const { memberIds = [], sendToAll = false } = await request.json();

    const db = getDb();
    
    let membersToEmail: Array<{
      id: string;
      name?: string;
      email?: string;
      username?: string;
      password?: string;
      [key: string]: any;
    }> = [];

    if (sendToAll) {
      
      console.log("📧 Fetching all members...");
      const membersSnapshot = await db.collection("members").get();
      membersToEmail = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } else if (memberIds.length > 0) {
      
      console.log(`📧 Fetching ${memberIds.length} specific members...`);
      for (const memberId of memberIds) {
        const memberDoc = await db.collection("members").doc(memberId).get();
        if (memberDoc.exists) {
          membersToEmail.push({
            id: memberDoc.id,
            ...memberDoc.data(),
          });
        }
      }
    } else {
      return NextResponse.json({
        ok: false,
        message: "Please provide memberIds or set sendToAll to true",
      });
    }

    if (membersToEmail.length === 0) {
      return NextResponse.json({
        ok: false,
        message: "No members found to send emails",
      });
    }

    console.log(`📧 Sending credentials to ${membersToEmail.length} members...`);

    const results = {
      total: membersToEmail.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[],
    };

    for (const member of membersToEmail) {
      
      if (!member.email) {
        console.warn(`⚠️  Skipping ${member.name} - no email address`);
        results.skipped++;
        results.details.push({
          name: member.name,
          email: "N/A",
          status: "skipped",
          reason: "No email address",
        });
        continue;
      }

      
      if (!member.username || !member.password) {
        console.warn(`⚠️  Skipping ${member.name} - no credentials found`);
        results.skipped++;
        results.details.push({
          name: member.name,
          email: member.email,
          status: "skipped",
          reason: "No credentials in database",
        });
        continue;
      }

      try {
        console.log(`📤 Sending to ${member.name} (${member.email})...`);
        
        const emailResult = await sendCredentialsEmail({
          to: member.email!,
          name: member.name!,
          username: member.username!,
          password: member.password!,
        });

        if (emailResult.success) {
          console.log(`✅ Email sent to ${member.email}`);
          results.sent++;
          results.details.push({
            name: member.name!,
            email: member.email!,
            username: member.username!,
            status: "sent",
            messageId: emailResult.messageId,
          });
        } else {
          console.error(`❌ Failed to send to ${member.email}: ${emailResult.error}`);
          results.failed++;
          results.details.push({
            name: member.name,
            email: member.email,
            status: "failed",
            error: emailResult.error,
          });
        }

        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error sending to ${member.email}:`, error);
        results.failed++;
        results.details.push({
          name: member.name,
          email: member.email,
          status: "error",
          error: String(error),
        });
      }
    }

    console.log(`\n📊 Email Send Summary:`);
    console.log(`   Total: ${results.total}`);
    console.log(`   Sent: ${results.sent}`);
    console.log(`   Failed: ${results.failed}`);
    console.log(`   Skipped: ${results.skipped}`);

    return NextResponse.json({
      ok: true,
      message: `Sent credentials to ${results.sent} out of ${results.total} members`,
      results,
    });
  } catch (error) {
    console.error("❌ Error sending credentials to existing members:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to send credentials",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
