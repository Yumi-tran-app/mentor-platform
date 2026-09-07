// Bộ câu hỏi kiểm tra (bài test) cho mentor trước khi được nhận mentee.
// Soạn từ nội dung 4 module đào tạo bắt buộc của mentor.
// Gồm 10 câu trắc nghiệm (mỗi câu nhiều đáp án, duy nhất 1 đúng) + 1 câu tự luận.

export type MCQOption = { label: string; isCorrect: boolean };

export type TestQuestion = {
  type: "multiple_choice" | "essay";
  prompt: string;
  options?: MCQOption[]; // trắc nghiệm
  correctIndex?: number; // index đáp án đúng (để chấm tự động)
  sampleAnswer?: string; // tự luận: gợi ý chấm
};

export const MENTOR_TEST_TITLE = "Bài kiểm tra mentor — Kiểm tra & chứng nhận";

export const MENTOR_PASS_SCORE = 70; // % đạt tối thiểu

export const MENTOR_TEST_QUESTIONS: TestQuestion[] = [
  {
    type: "multiple_choice",
    prompt:
      "Vai trò đúng nhất của một mentor trong chương trình mentoring cộng đồng là gì?",
    options: [
      { label: "Làm thay công việc của mentee để đảm bảo kết quả nhanh", isCorrect: false },
      { label: "Chia sẻ kinh nghiệm, đặt câu hỏi dẫn dắt, không làm thay việc mentee", isCorrect: true },
      { label: "Ra quyết định thay mentee trong mọi tình huống", isCorrect: false },
      { label: "Chỉ gặp mentee khi mentee chủ động liên hệ", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt:
      "Lộ trình đồng hành của chương trình kéo dài bao lâu?",
    options: [
      { label: "3 tháng", isCorrect: false },
      { label: "6 tháng", isCorrect: false },
      { label: "9 tháng", isCorrect: true },
      { label: "12 tháng", isCorrect: false },
    ],
    correctIndex: 2,
  },
  {
    type: "multiple_choice",
    prompt:
      "Ba giá trị cốt lõi của chương trình là gì?",
    options: [
      { label: "Tôn trọng & Lắng nghe thật · Cam kết & Trách nhiệm · Cởi mở & Trung thực", isCorrect: true },
      { label: "Tốc độ · Hiệu quả · Lợi nhuận", isCorrect: false },
      { label: "Kỷ luật · Cạnh tranh · Kết quả", isCorrect: false },
      { label: "Độc lập · Tự chủ · Ít giao tiếp", isCorrect: false },
    ],
    correctIndex: 0,
  },
  {
    type: "multiple_choice",
    prompt:
      "Điều nào sau đây mô tả ĐÚNG về 'lắng nghe thật' (active listening)?",
    options: [
      { label: "Nghe để chuẩn bị phản bác nhanh", isCorrect: false },
      { label: "Gật đầu, tóm tắt lại điều vừa nghe, không ngắt lời khi chưa hiểu trọn vẹn", isCorrect: true },
      { label: "Đưa ra giải pháp ngay khi nghe thấy vấn đề", isCorrect: false },
      { label: "So sánh câu chuyện của mentee với người khác", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt:
      "Khi đặt câu hỏi cho mentee, mentor nên ưu tiên loại câu hỏi nào?",
    options: [
      { label: "Câu hỏi đóng (trả lời Có/Không)", isCorrect: false },
      { label: "Câu hỏi mở giúp mentee tự tìm ra hướng đi", isCorrect: true },
      { label: "Câu hỏi gợi ý đáp án sẵn", isCorrect: false },
      { label: "Câu hỏi dồn dập nhiều ý cùng lúc", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt:
      "Mục tiêu hiệu quả trong mentoring nên theo mô hình nào?",
    options: [
      { label: "SWOT", isCorrect: false },
      { label: "SMART (Specific - Measurable - Achievable - Relevant - Time-bound)", isCorrect: true },
      { label: "PDCA", isCorrect: false },
      { label: "PESTEL", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt:
      "Thoả thuận đồng hành giữa mentor và mentee nên bao gồm điều gì?",
    options: [
      { label: "Tần suất gặp, hình thức, quy tắc giao tiếp và cơ chế khi có vấn đề", isCorrect: true },
      { label: "Chỉ duy nhất mục tiêu doanh thu của mentee", isCorrect: false },
      { label: "Không cần thống nhất gì, gặp khi nào tiện", isCorrect: false },
      { label: "Chỉ cần mentor cam kết, mentee không cần", isCorrect: false },
    ],
    correctIndex: 0,
  },
  {
    type: "multiple_choice",
    prompt:
      "Khi gặp vướng mắc lớn trong mối quan hệ, cả hai nên làm gì?",
    options: [
      { label: "Tự giải quyết, không thông báo ai", isCorrect: false },
      { label: "Liên hệ Điều phối viên (ĐPV) để được hỗ trợ", isCorrect: true },
      { label: "Lập tức kết thúc không trao đổi", isCorrect: false },
      { label: "Đưa vấn đề lên mạng xã hội", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt:
      "Phản tư hằng tháng là gì?",
    options: [
      { label: "Đánh giá đúng/sai về năng lực của mentee", isCorrect: false },
      { label: "Khoảng dừng có chủ đích để nhìn lại hành trình, nhận diện điều đang diễn ra", isCorrect: true },
      { label: "Bắt buộc phải nộp báo cáo dài cho ĐPV", isCorrect: false },
      { label: "Chỉ dành cho mentee, mentor không tham gia", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "multiple_choice",
    prompt:
      "Khi phản tư của mentee liên tục báo hiệu 'chưa ổn' (màu vàng) 2 tháng liên tiếp, điều gì nên xảy ra?",
    options: [
      { label: "Bỏ qua vì chỉ là cảm xúc nhất thời", isCorrect: false },
      { label: "ĐPV chủ động liên hệ để can thiệp sớm", isCorrect: true },
      { label: "Tự động kết thúc match", isCorrect: false },
      { label: "Chờ mentee tự vượt qua", isCorrect: false },
    ],
    correctIndex: 1,
  },
  {
    type: "essay",
    prompt:
      "Bạn gặp một mentee đang phân vân giữa hai lựa chọn nghề nghiệp và xin bạn 'cho một câu trả lời đúng'. Hãy mô tả cách bạn sẽ dẫn dắt buổi trò chuyện (2–4 câu) để giúp mentee tự đưa ra quyết định, thay vì đưa ra lời khuyên áp đặt.",
    sampleAnswer:
      "Tôi sẽ đặt các câu hỏi mở để hiểu bối cảnh và điều mentee đã thử, ví dụ: 'Điều gì khiến bạn phân vân giữa hai lựa chọn này?', 'Bạn đã thử những gì?', 'Kết quả bạn thực sự mong muốn là gì?'. Sau đó lắng nghe không phán xét, tóm tắt lại, và dùng câu hỏi để giúp mentee tự nhìn ra hướng đi của chính mình.",
  },
];

// Gợi ý tiêu chí chấm câu tự luận (cho ĐPV/admin duyệt)
export const ESSAY_RUBRIC = [
  "Có lắng nghe trước khi đưa ra định hướng",
  "Dùng câu hỏi mở để gợi mở, không áp đặt đáp án",
  "Giúp mentee tự đưa ra quyết định",
];
