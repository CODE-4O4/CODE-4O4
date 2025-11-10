"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminQueue } from "@/lib/data";
import RequestCard from "@/components/admin/request-card";
import { PageContainer } from "@/components/shared/page-container";
import { PageIntro } from "@/components/shared/page-intro";
import { CheckCircle, Users } from "lucide-react";

type ProjectInterest = {
  id: string;
  projectId: string;
  userId: string;
  status: string;
  createdAt?: any;
  projectName?: string;
  userName?: string;
  userEmail?: string;
};

const AdminPage = () => {
  const [projectInterests, setProjectInterests] = useState<ProjectInterest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch project interests from Firestore
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        console.log("🔄 Fetching all project interests...");
        const response = await fetch("/api/project-interests?status=pending");
        const result = await response.json();
        
        if (result.ok && result.data) {
          console.log("✅ Fetched interests:", result.data);
          setProjectInterests(result.data);
        } else {
          console.warn("⚠️  Failed to fetch:", result.message);
        }
      } catch (error) {
        console.error("❌ Error fetching interests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
    
    // Refresh every 5 seconds to show new requests
    const interval = setInterval(fetchInterests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (interestId: string, projectId: string, userId: string) => {
    try {
      const response = await fetch("/api/project-interests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interestId,
          status: "approved",
          projectId,
          userId,
        }),
      });

      const result = await response.json();
      
      if (result.ok) {
        alert("✅ Approved!");
        // Remove from list
        setProjectInterests((prev) => prev.filter((r) => r.id !== interestId));
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Failed to approve");
    }
  };

  const handleHold = async (interestId: string) => {
    alert("⏸️  On hold (will implement status change)");
  };

  return (
  <PageContainer>
    <PageIntro
      badge="ADMIN PORTAL"
      title="Member approvals & reviews"
      description="Track pending join requests, review interest tags, and approve contributors once you've met them."
      actions={
        <Link
          href="/"
          className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/70 transition hover:border-emerald-300/60 hover:text-white"
        >
          ← Back home
        </Link>
      }
    />

    {/* Project Interest Requests Section */}
    <div className="mt-10">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-5 w-5 text-emerald-400" />
        <h2 className="text-xl font-semibold text-white">
          Project Join Requests
        </h2>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">
          {loading ? "..." : `${projectInterests.length} pending`}
        </span>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-black/40 p-8 text-center text-sm text-white/60">
          Loading requests...
        </div>
      ) : projectInterests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {projectInterests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl border border-white/10 bg-black/40 p-6"
              >
                <div className="mb-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">
                    {request.projectName || `Project: ${request.projectId}`}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {request.userName || `User: ${request.userId}`}
                  </h3>
                  <p className="text-sm text-white/60">
                    {request.userEmail || "No email available"}
                  </p>
                </div>

                <div className="mb-4 flex items-center gap-2 text-xs text-white/50">
                  <span>
                    Requested{" "}
                    {request.createdAt
                      ? new Date(
                          request.createdAt.toDate
                            ? request.createdAt.toDate()
                            : request.createdAt
                        ).toLocaleDateString()
                      : "recently"}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-400/20"
                    onClick={() => handleApprove(request.id, request.projectId, request.userId)}
                  >
                    <CheckCircle className="inline h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
                    onClick={() => handleHold(request.id)}
                  >
                    Hold
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/20 p-8 text-center text-sm text-white/60">
          No pending project join requests
        </div>
      )}
    </div>

    {/* Club Membership Requests Section */}
    <div className="mt-12">
      <div className="mb-6 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-sky-400" />
        <h2 className="text-xl font-semibold text-white">
          Club Membership Requests
        </h2>
        <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-400">
          {adminQueue.length} pending
        </span>
      </div>

      {adminQueue.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {adminQueue.map((request) => (
            <div key={request.id}>
              <RequestCard request={request} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/20 p-8 text-center text-sm text-white/60">
          No pending membership requests
        </div>
      )}
    </div>

    <div className="mt-8 rounded-3xl border border-dashed border-white/20 p-5 text-sm text-white/70">
      💡 <strong>Demo Mode:</strong> Approvals are logged but not persisted to database.
      Connect Firebase credentials to enable full functionality.
    </div>
  </PageContainer>
  );
};

export default AdminPage;
