// Nội dung đào tạo chi tiết cho từng module
// Dùng để hiển thị outline khi người dùng click vào module trong trang Đào tạo.

export type TrainingSlide = {
  title: string;
  bullets: string[];
};

export type TrainingModuleContent = {
  moduleIndex: number;
  title: string;
  description: string;
  summary: string;
  slides: TrainingSlide[];
};

export const TRAINING_CONTENT: TrainingModuleContent[] = [
  {
    moduleIndex: 0,
    title: "Định hướng & giới thiệu chương trình",
    description: "Hiểu rõ lộ trình 9 tháng, vai trò và kỳ vọng của mentor/mentee.",
    summary:
      "Module mở đầu giúp cả hai bên nắm rõ cách chương trình vận hành, cam kết cần có, và vai trò của Điều phối viên (ĐPV).",
    slides: [
      {
        title: "Chương trình mentoring cộng đồng là gì?",
        bullets: [
          "Lộ trình đồng hành 9 tháng có cấu trúc giữa mentor (người dẫn dắt) và mentee (người được đồng hành).",
          "Không phải cố vấn rời rạc — mà là một hành trình có mục tiêu, có điểm chạm, có đo lường.",
          "Được hỗ trợ xuyên suốt bởi Điều phối viên (ĐPV).",
        ],
      },
      {
        title: "Vai trò & kỳ vọng mỗi bên",
        bullets: [
          "Mentor: chia sẻ kinh nghiệm, đặt câu hỏi dẫn dắt, không làm thay việc của mentee.",
          "Mentee: chủ động đặt mục tiêu, chuẩn bị trước buổi gặp, thực hành và phản hồi.",
          "ĐPV: theo dõi tiến độ, gỡ khó khi có tạm dừng hoặc vướng mắc.",
        ],
      },
      {
        title: "3 giá trị cốt lõi",
        bullets: [
          "Tôn trọng & Lắng nghe thật — không phán xét, đặt mình vào vị trí người kia.",
          "Cam kết & Trách nhiệm — giữ lịch hẹn, đồng hành trọn vẹn, không bỏ ngang.",
          "Cởi mở & Trung thực — chia sẻ thật, sẵn sàng nhận góp ý.",
        ],
      },
      {
        title: "Lộ trình 9 tháng",
        bullets: [
          "Tháng 1: Kết nối lần đầu + ký thoả thuận đồng hành.",
          "Tháng 2–8: Gặp định kỳ, ghi chú, phản tư hằng tháng.",
          "Tháng 9: Tổng kết hành trình, phản tư kết thúc.",
        ],
      },
    ],
  },
  {
    moduleIndex: 1,
    title: "Kỹ năng lắng nghe & đặt câu hỏi",
    description: "Nền tảng để buổi đồng hành hiệu quả.",
    summary:
      "Kỹ năng cốt lõi giúp mentor dẫn dắt thay vì áp đặt, và mentee mở lòng chia sẻ đúng trọng tâm.",
    slides: [
      {
        title: "Tại sao lắng nghe quan trọng?",
        bullets: [
          "Lắng nghe thật giúp hiểu đúng vấn đề, không chỉ nghe để đáp.",
          "Người được lắng nghe cảm thấy được tôn trọng và an toàn để chia sẻ.",
          "Phần lớn giải pháp đến từ chính người nói khi được hỏi đúng cách.",
        ],
      },
      {
        title: "Lắng nghe chủ động (Active Listening)",
        bullets: [
          "Duy trì giao tiếp mắt, gật đầu, tóm tắt lại điều vừa nghe.",
          "Dùng câu phản hồi: \"Vậy điều bạn đang lo là...?\"",
          "Không ngắt lời, không vội đưa giải pháp khi chưa hiểu trọn vẹn.",
        ],
      },
      {
        title: "Đặt câu hỏi mở",
        bullets: [
          "Tránh câu hỏi đóng (chỉ trả lời có/không).",
          "Ưu tiên: \"Điều gì khiến bạn nghĩ vậy?\", \"Bạn đã thử những gì?\", \"Kết quả bạn mong muốn là gì?\"",
          "Dùng câu hỏi để giúp mentee tự tìm ra hướng đi.",
        ],
      },
      {
        title: "Những điều cần tránh",
        bullets: [
          "Phán xét, so sánh, áp đặt kinh nghiệm cá nhân quá sớm.",
          "Chuyển chủ đề sang câu chuyện của mình quá nhanh.",
          "Đưa ra lời khuyên khi chưa được hỏi.",
        ],
      },
    ],
  },
  {
    moduleIndex: 2,
    title: "Thiết lập mục tiêu & thoả thuận đồng hành",
    description: "Cách cùng đặt mục tiêu và cam kết ngay từ đầu.",
    summary:
      "Mục tiêu rõ ràng + thoả thuận minh bạch là nền tảng để 9 tháng đi đúng hướng và đo lường được.",
    slides: [
      {
        title: "Vì sao cần mục tiêu rõ ràng?",
        bullets: [
          "Mục tiêu mơ hồ dẫn đến buổi gặp lạc hướng, mất động lực.",
          "Mục tiêu rõ giúp cả hai biết mình đang làm gì và vì sao.",
          "Là thước đo để đánh giá hành trình có hiệu quả không.",
        ],
      },
      {
        title: "Mô hình SMART",
        bullets: [
          "Specific — cụ thể, rõ ràng.",
          "Measurable — đo lường được.",
          "Achievable — khả thi.",
          "Relevant — liên quan đến mục tiêu lớn của mentee.",
          "Time-bound — có mốc thời gian.",
        ],
      },
      {
        title: "Xây dựng thoả thuận đồng hành",
        bullets: [
          "Thống nhất tần suất gặp, hình thức (offline/online), thời lượng.",
          "Quy tắc giao tiếp, bảo mật thông tin.",
          "Cơ chế khi có vấn đề: liên hệ ĐPV, tạm dừng có lộ trình.",
        ],
      },
      {
        title: "Cam kết hai chiều",
        bullets: [
          "Mentor cam kết thời gian, sự chuẩn bị và tính nhất quán.",
          "Mentee cam kết chủ động, thực hành và phản hồi đúng hạn.",
          "Ghi lại thoả thuận để cả hai cùng nhìn lại khi cần.",
        ],
      },
    ],
  },
  {
    moduleIndex: 3,
    title: "Phản tư & phát triển liên tục",
    description: "Cách sử dụng phản tư hằng tháng để cải thiện.",
    summary:
      "Phản tư là trái tim của chương trình — giúp cặp đồng hành nhìn lại, điều chỉnh và trưởng thành hơn mỗi tháng.",
    slides: [
      {
        title: "Phản tư là gì?",
        bullets: [
          "Khoảng dừng có chủ đích mỗi tháng để nhìn lại hành trình.",
          "Không phải đánh giá đúng/sai — mà là nhận diện điều đang diễn ra.",
          "Gồm 4 trạng thái cảm nhận: kết nối tốt, tìm nhịp, chưa ổn, cần hỗ trợ.",
        ],
      },
      {
        title: "Cách thực hiện phản tư hiệu quả",
        bullets: [
          "Trả lời trung thực cảm nhận tháng vừa qua.",
          "Ghi rõ điều đã làm được, điều còn vướng.",
          "Đặt 1 mục tiêu nhỏ cho tháng tiếp theo.",
        ],
      },
      {
        title: "Khi phản tư báo hiệu màu vàng/đỏ",
        bullets: [
          "Màu vàng (chưa ổn) 2 tháng liên tiếp → ĐPV chủ động liên hệ.",
          "Màu đỏ (cần hỗ trợ) → tạo yêu cầu hỗ trợ ngay.",
          "Mục tiêu: can thiệp sớm, không để vấn đề lớn dần.",
        ],
      },
      {
        title: "Vòng lặp phát triển",
        bullets: [
          "Hành động → Phản tư → Nhận ra → Điều chỉnh → Hành động tốt hơn.",
          "Mỗi tháng là một vòng lặp nhỏ tiến dần đến mục tiêu 9 tháng.",
          "Ghi lại vào nhật ký hành trình để thấy được sự trưởng thành.",
        ],
      },
    ],
  },
];
