// Bộ câu hỏi kiểm tra cho MENTEE — thể hiện cam kết với chương trình.
// Soạn từ 3 module đào tạo bắt buộc của mentee.
// 10 câu trắc nghiệm + 1 câu tự luận.

import type { TestQuestion } from "./training-test-content";

export const MENTEE_TEST_TITLE = "Bài kiểm tra mentee — Cam kết đồng hành";

export const MENTEE_PASS_SCORE = 70;

export const MENTEE_TEST_QUESTIONS: TestQuestion[] = [
  {
    type: "multiple_choice",
    prompt: "Vai trò của mentee trong mối quan hệ mentoring là gì?",
    options: [
      { label: "Chỉ chờ mentor đưa ra mọi giải pháp", isCorrect: false },
      { label: "Chủ động đặt mục tiêu, chuẩn bị trước buổi gặp, thực hành và phản hồi", isCorrect: true },
      { label: "Giao toàn bộ trách nhiệm cho mentor", isCorrect: false },
      { label: "Chỉ tham gia khi có thời gian rảnh", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt: "Trước buổi gặp đầu tiên, mentee nên chuẩn bị điều gì?",
    options: [
      { label: "Không cần chuẩn bị gì, để mọi thứ tự nhiên", isCorrect: false },
      { label: "Suy nghĩ điều muốn đạt được trong 9 tháng và chuẩn bị 2-3 câu hỏi", isCorrect: true },
      { label: "Chờ mentor hỏi mới trả lời", isCorrect: false },
      { label: "Chỉ mang theo bảng lương hiện tại để hỏi", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt: "Câu hỏi nào sau đây là câu hỏi TỐT để nhận được hướng dẫn?",
    options: [
      { label: "\"Em nên làm gì?\" (không rõ bối cảnh)", isCorrect: false },
      { label: "\"Em đang phân vân giữa hai lựa chọn A và B, anh/chị thấy thế nào?\"", isCorrect: true },
      { label: "\"Anh/chị làm giúp em được không?\"", isCorrect: false },
      { label: "\"Em không biết gì cả, chỉ em hết đi\"", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt: "Mentor là người như thế nào đối với mentee?",
    options: [
      { label: "Người làm thay công việc của mentee", isCorrect: false },
      { label: "Người dẫn dắt, định hướng và chia sẻ kinh nghiệm, không làm thay", isCorrect: true },
      { label: "Người ra quyết định thay cho mọi việc", isCorrect: false },
      { label: "Người chỉ giải quyết vấn đề tài chính", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt: "Khi muốn hỏi để hiểu tư duy của mentor, bạn nên hỏi theo cách nào?",
    options: [
      { label: "\"Khi gặp tình huống này, anh/chị cân nhắc điều gì?\"", isCorrect: true },
      { label: "\"Cho em câu trả lời đúng đi\"", isCorrect: false },
      { label: "\"Anh/chị từng thất bại bao giờ chưa?\"", isCorrect: false },
      { label: "\"Em không cần giải thích, chỉ cần kết quả\"", isCorrect: false },
    ],
    correctIndex: 0,
  },
  {
    type: "multiple_choice",
    prompt: "Điều nào thể hiện sự tôn trọng thời gian của mentor?",
    options: [
      { label: "Nhắn tin bất cứ khi nào có chuyện, kể cả ngoài giờ", isCorrect: false },
      { label: "Đến đúng giờ, chuẩn bị trước, báo trước nếu cần huỷ hoặc dời lịch", isCorrect: true },
      { label: "Thường xuyên dời lịch mà không báo", isCorrect: false },
      { label: "Kéo dài buổi gặp hơn thời gian đã thống nhất", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt: "Sau khi nhận định hướng từ mentor, mentee nên làm gì?",
    options: [
      { label: "Thực hành rồi cập nhật lại kết quả", isCorrect: true },
      { label: "Bỏ qua vì quá khó", isCorrect: false },
      { label: "Chờ mentor nhắc mới làm", isCorrect: false },
      { label: "Ghi lại rồi không đụng đến", isCorrect: false },
    ],
    correctIndex: 0,
  },
  {
    type: "multiple_choice",
    prompt: "Khi gặp vướng mắc lớn trong mối quan hệ, mentee nên làm gì?",
    options: [
      { label: "Im lặng chịu đựng", isCorrect: false },
      { label: "Trao đổi thẳng thắn nhưng tôn trọng, và liên hệ ĐPV nếu cần", isCorrect: true },
      { label: "Bỏ ngang không nói gì", isCorrect: false },
      { label: "Chia sẻ vấn đề lên mạng xã hội", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt: "Lộ trình đồng hành mentoring kéo dài bao lâu?",
    options: [
      { label: "3 tháng", isCorrect: false },
      { label: "9 tháng", isCorrect: true },
      { label: "6 tháng", isCorrect: false },
      { label: "12 tháng", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt: "Ba giá trị cốt lõi của chương trình là gì?",
    options: [
      { label: "Tôn trọng & Lắng nghe · Cam kết & Trách nhiệm · Cởi mở & Trung thực", isCorrect: true },
      { label: "Tốc độ · Kết quả · Lợi nhuận", isCorrect: false },
      { label: "Độc lập · Tự chủ · Ít trao đổi", isCorrect: false },
      { label: "Cạnh tranh · So sánh · Áp lực", isCorrect: false },
    ],
    correctIndex: 0,
  },
  {
    type: "essay",
    prompt:
      "Trong 9 tháng đồng hành tới, điều bạn mong muốn đạt được nhất là gì? Hãy nêu mục tiêu cụ thể và lý do bạn cam kết theo đuổi nó (2–4 câu).",
    sampleAnswer:
      "Tôi mong muốn định hướng rõ ràng hơn con đường sự nghiệp và xây dựng được thói quen phản tư hằng tháng. Tôi cam kết vì đây là cơ hội hiếm để học hỏi từ người đi trước, và tôi mong muốn trưởng thành thực sự chứ không chỉ nhận lời khuyên.",
  },
];
