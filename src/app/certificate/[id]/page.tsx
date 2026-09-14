import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CertificateViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getOrCreateCurrentUser();

  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { season: true },
  });
  if (!cert) notFound();

  // Chỉ chủ sở hữu (hoặc staff) được xem
  const isStaff = user && (user.role === "admin" || user.role === "dpv");
  const isOwner = user && user.id === cert.userId;
  if (!isStaff && !isOwner) notFound();

  const dateStr = new Date(cert.issuedAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const roleLabel = cert.role === "mentor" ? "Mentor" : "Mentee";
  const isMentoring = cert.type === "mentoring";
  const headingText = isMentoring
    ? "Certificate of Mentoring Completion"
    : "Certificate of Training Completion";
  const isMentor = cert.role === "mentor";
  const descText = isMentoring
    ? "đã hoàn thành trọn vẹn hành trình đồng hành mentoring, thể hiện sự cam kết, trách nhiệm và trưởng thành trong suốt chương trình."
    : isMentor
      ? "đã hoàn thành xuất sắc Chương trình đào tạo & kiểm tra năng lực đồng hành, đủ điều kiện tham gia dẫn dắt trong chương trình mentoring cộng đồng."
      : "đã hoàn thành xuất sắc Chương trình đào tạo & kiểm tra năng lực đồng hành, đủ điều kiện tham gia chương trình mentoring cộng đồng.";

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print {
          .cert-backdrop { background: #fff !important; padding: 0 !important; min-height: 100vh; }
          .cert-back-link { display: none !important; }
          .cert-card { width: 297mm !important; min-height: 210mm; border-radius: 0 !important; box-shadow: none !important; }
        }
      `}</style>
      <div className="cert-backdrop" style={{ minHeight: "100vh", background: "#134E4A", padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <Link
        href="/dashboard"
        className="cert-back-link"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "#F6F1E9",
          fontSize: 15,
          fontWeight: 600,
          textDecoration: "none",
          padding: "10px 22px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.35)",
        }}
      >
        ← Quay lại Tổng quan
      </Link>
      <div
        className="cert-card"
        style={{
          width: 1123,
          minHeight: 794,
          maxWidth: "100%",
          background: "#F6F1E9",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,.35)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Viền trang trí */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            border: "3px solid #1BA7A6",
            borderRadius: 12,
            pointerEvents: "none",
          }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 72px 72px", textAlign: "center" }}>
          <img
            src="/images/logo-green-transparent.png"
            alt={cert.orgName}
            style={{ display: "block", margin: "0 auto 20px", height: 72, width: "auto" }}
          />
          <p style={{ margin: 0, fontSize: 14, letterSpacing: 4, textTransform: "uppercase", color: "#F2A93B", fontWeight: 700 }}>
            {headingText}
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#3B2A24", letterSpacing: 1 }}>
            {cert.orgName}
          </p>

          <div style={{ margin: "40px 0 8px", fontSize: 18, color: "#5B564A" }}>
            Trân trọng chứng nhận
          </div>
          <h1 style={{ margin: 0, fontSize: 52, fontWeight: 800, color: "#134E4A", fontFamily: "Georgia, serif" }}>
            {cert.recipientName}
          </h1>
          <div
            style={{
              display: "inline-block",
              margin: "28px auto 0",
              padding: "6px 22px",
              background: "#D97706",
              color: "#fff",
              borderRadius: 999,
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: 15,
            }}
          >
            {roleLabel}
          </div>

          <p style={{ margin: "36px auto 0", maxWidth: 620, fontSize: 15, lineHeight: 1.7, color: "#3B2A24" }}>
            {descText}
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 72, gap: 24 }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ height: 1, background: "#C9C0B0", marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, color: "#5B564A" }}>NGÀY CẤP · {dateStr}</p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ height: 1, background: "#C9C0B0", marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, color: "#5B564A" }}>MRC · {cert.certificateNo}</p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ height: 64 }} />
              <div style={{ height: 1, background: "#C9C0B0", marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, color: "#5B564A" }}>BAN TỔ CHỨC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
