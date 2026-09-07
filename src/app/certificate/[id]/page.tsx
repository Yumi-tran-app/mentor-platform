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

  return (
    <div style={{ minHeight: "100vh", background: "#0D2B45", padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 1050,
          maxWidth: "100%",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,.35)",
          background: "#F6F1E9",
          position: "relative",
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
        <div style={{ padding: "64px 48px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, letterSpacing: 4, textTransform: "uppercase", color: "#F2A93B", fontWeight: 700 }}>
            Certificate of Completion
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#3B2A24", letterSpacing: 1 }}>
            {cert.orgName}
          </p>

          <div style={{ margin: "40px 0 8px", fontSize: 18, color: "#5B564A" }}>
            Trân trọng chứng nhận
          </div>
          <h1 style={{ margin: 0, fontSize: 52, fontWeight: 800, color: "#0D2B45", fontFamily: "Georgia, serif" }}>
            {cert.recipientName}
          </h1>
          <div
            style={{
              display: "inline-block",
              margin: "28px auto 0",
              padding: "6px 22px",
              background: "#FF7A59",
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
            đã hoàn thành xuất sắc Chương trình đào tạo &amp; kiểm tra năng lực
            đồng hành, đủ điều kiện tham gia dẫn dắt trong chương trình
            mentoring cộng đồng.
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 64, gap: 24 }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ height: 1, background: "#C9C0B0", marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, color: "#5B564A" }}>NGÀY CẤP · {dateStr}</p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ height: 1, background: "#C9C0B0", marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, color: "#5B564A" }}>MRC · {cert.certificateNo}</p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ height: 1, background: "#C9C0B0", marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, color: "#5B564A" }}>BAN TỔ CHỨC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
