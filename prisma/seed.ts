import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed mùa đầu tiên + 3 giá trị cốt lõi + tiêu chí mặc định
  const season = await prisma.season.create({
    data: {
      name: "Mùa 1",
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 270), // +9 tháng
      status: "draft",
    },
  });

  const coreValues = [
    { code: "respect", title: "Tôn trọng & Lắng nghe thật", description: "Không phán xét, đặt mình vào vị trí của người kia trước khi đưa ra ý kiến." },
    { code: "commitment", title: "Cam kết & Trách nhiệm", description: "Giữ đúng lịch hẹn, đồng hành trọn vẹn hành trình đã nhận, không bỏ ngang." },
    { code: "openness", title: "Cởi mở & Trung thực", description: "Chia sẻ thật, sẵn sàng lắng nghe góp ý và học hỏi từ người đồng hành." },
  ];

  for (const [i, v] of coreValues.entries()) {
    await prisma.coreValue.create({
      data: { ...v, seasonId: season.id, sortOrder: i },
    });
  }

  const criteria = [
    { key: "mentor_min_years_experience", value: "8", valueType: "number" as const, description: "Số năm kinh nghiệm tối thiểu" },
    { key: "mentor_min_years_management", value: "3", valueType: "number" as const, description: "Số năm quản lý tối thiểu" },
    { key: "mentor_max_capacity", value: "3", valueType: "number" as const, description: "Số mentee tối đa mỗi mentor" },
    { key: "match_review_sla_business_days", value: "7", valueType: "number" as const, description: "SLA duyệt cặp (ngày làm việc)" },
  ];

  for (const c of criteria) {
    await prisma.seasonCriteria.create({
      data: { ...c, seasonId: season.id },
    });
  }

  console.log("Seed complete. Season:", season.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
