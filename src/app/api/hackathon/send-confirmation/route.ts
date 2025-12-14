import { NextRequest, NextResponse } from "next/server";
import { sendHackathonRegistrationEmail } from "@/lib/email";
import validator from "validator";


const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; 
const RATE_WINDOW = 60 * 60 * 1000; 

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
        if (!checkRateLimit(ip)) {
            console.warn(`⚠️ [API] Rate limit exceeded for IP: ${ip}`);
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const body = await request.json();
        let { email, name, type, teamName, memberCount } = body;

        
        if (!email || !name || !type || !memberCount) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        
        email = validator.normalizeEmail(email) || email;
        if (!validator.isEmail(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email address" },
                { status: 400 }
            );
        }

        
        name = validator.escape(name);
        if (teamName) {
            teamName = validator.escape(teamName);
        }

        
        if (type !== "individual" && type !== "team") {
            return NextResponse.json(
                { success: false, error: "Invalid registration type" },
                { status: 400 }
            );
        }

        
        if (type === "team" && !teamName) {
            return NextResponse.json(
                { success: false, error: "Team name is required for team registrations" },
                { status: 400 }
            );
        }

        console.log(`📧 [API] Sending confirmation email to ${email}...`);

        const result = await sendHackathonRegistrationEmail({
            to: email,
            name,
            type,
            teamName,
            memberCount,
        });

        if (result.success) {
            console.log(`✅ [API] Confirmation email sent successfully to ${email}`);
            return NextResponse.json({
                success: true,
                message: "Confirmation email sent successfully",
                messageId: result.messageId,
            });
        } else {
            console.error(`❌ [API] Failed to send confirmation email to ${email}:`, result.error);
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || "Failed to send confirmation email",
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("❌ [API] Error in send-confirmation endpoint:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}
