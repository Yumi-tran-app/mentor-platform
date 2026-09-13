#!/usr/bin/env python3
"""Tạo 2 ảnh minh hoạ cho bài Tuyển Mentee & Tuyển Mentor — Tre Việt Mentoring."""
from PIL import Image, ImageDraw, ImageFont
import os

W = 1200
H_MENTEE = 700
H_MENTOR = 700

# Brand Tre Việt Mentoring (khớp landing page)
GREEN_DARK = "#134E4A"   # xanh rêu đậm (nền)
TEAL = "#15B5B0"         # teal
TEAL_BRIGHT = "#2DD4BF"
CREAM = "#F5F2EC"
WHITE = "#FFFFFF"
GOLD = "#F2A93B"         # nhấn amber (dùng tiết chế)
MUTED = "#D7E5E2"        # chữ phụ trên nền tối

FONT_DIR = "/usr/share/fonts"
def find_font(names):
    for root, _, files in os.walk(FONT_DIR):
        for f in files:
            if f.lower() in names:
                return os.path.join(root, f)
    return None

# Ưu tiên font Noto Sans CJK (hỗ trợ đầy đủ tiếng Việt), fallback DejaVu
BOLD = find_font({"notosanscjk-bold.ttc"}) or find_font({"notosanscjk-regular.ttc"}) or find_font({"dejavusans-bold.ttf"})
REG  = find_font({"notosanscjk-regular.ttc"}) or find_font({"dejavusans.ttf"})
print("BOLD:", BOLD)
print("REG:", REG)

def font(sz, bold=True):
    return ImageFont.truetype(BOLD if bold else REG, sz)

def rounded(draw, xy, r, fill):
    try:
        draw.rounded_rectangle(xy, radius=r, fill=fill)
    except TypeError:
        draw.rectangle(xy, fill=fill)

def base(h):
    img = Image.new("RGB", (W, h), GREEN_DARK)
    d = ImageDraw.Draw(img, "RGBA")
    # lớp trang trí: vòng tròn mờ teal
    d.ellipse([W-260, -160, W+120, 220], fill=(21,181,176, 40))
    d.ellipse([-180, h-260, 120, h+40], fill=(21,181,176, 28))
    d.ellipse([W-320, h-120, W-60, h+140], fill=(21,181,176, 20))
    return img, d

def pill(d, text, cx, y, bg=TEAL, fg=WHITE, sz=30):
    f = font(sz, True)
    w = d.textlength(text, font=f)
    pad = 22
    box = [cx - (w+pad*2)/2, y, cx + (w+pad*2)/2, y + sz + 24]
    rounded(d, box, (sz+24)//2, fill=bg)
    d.text((cx, y + 12), text, font=f, fill=fg, anchor="ma")
    return box[3] + 18

def logo(d):
    # block TVM nhỏ + tên
    f = font(26, True)
    d.rounded_rectangle([56, 48, 100, 92], radius=10, fill=(255,255,255,40))
    d.text((78, 70), "TVM", font=font(20, True), fill=WHITE, anchor="mm")
    d.text((112, 70), "Tre Việt Mentoring", font=f, fill=WHITE, anchor="lm")

def make_mentee():
    h = H_MENTEE
    img, d = base(h)
    logo(d)
    y = 108
    y = pill(d, "TUYỂN MENTEE · MÙA 1", W//2, y, bg=TEAL, fg=WHITE, sz=27)
    # tiêu đề chính
    d.multiline_text(
        (W//2, y), "Từ lý thuyết giảng đường\nđến nghệ thuật\nlàm việc với con người",
        font=font(46, True), fill=WHITE, anchor="ma", align="center", spacing=8)
    y += 200
    # dòng phụ (truyền cảm hứng) - chia 2 dòng cân đối, choán đều chiều ngang
    sub = "Dành riêng cho sinh viên Nhân sự & Tâm lý:\nNơi những trăn trở nghề nghiệp được chia sẻ cùng người đi trước"
    d.multiline_text((W//2, y), sub, font=font(29, False), fill=MUTED,
                     anchor="ma", align="center", spacing=8)
    y += 122
    # 2 điểm chính (canh giữa cụm bullet + text)
    items = ["Bạn sẽ có 9 tháng mài giũa thêm kỹ năng",
             "Sở hữu chứng nhận hoàn thành chương trình"]
    f_it = font(25, False)
    for it in items:
        tw = d.textlength(it, font=f_it)
        total = 22 + tw
        start_x = (W - total) / 2
        cy = y
        d.ellipse([start_x, cy-21, start_x+12, cy-9], fill=TEAL_BRIGHT)
        d.text((start_x+22, cy-15), it, font=f_it, fill=WHITE, anchor="lm")
        y += 50
    # nút CTA (màu đặc) - đặt sát đáy, tách khỏi nội dung
    btn = "Tìm Mentor Của Bạn"
    fb = font(30, True)
    bw = d.textlength(btn, font=fb)
    box = [W//2 - bw/2 - 34, h-104, W//2 + bw/2 + 34, h-40]
    rounded(d, box, 32, fill=GOLD)
    d.text((W//2, h-72), btn, font=fb, fill=GREEN_DARK, anchor="mm")
    return img

def make_mentor():
    h = H_MENTOR
    img, d = base(h)
    logo(d)
    y = 128
    y = pill(d, "TUYỂN MENTOR · MÙA 1", W//2, y, bg=TEAL, fg=WHITE, sz=28)
    # tiêu đề chính (gọn 1 dòng)
    d.multiline_text(
        (W//2, y), "Kiến tạo di sản nghề nghiệp",
        font=font(54, True), fill=WHITE, anchor="ma", align="center")
    y += 138
    # dòng phụ (lời mời) - 2 dòng cân đối
    sub = "Lời mời dành riêng cho các anh chị đang làm việc\ntrong ngành Tâm lý & Nhân sự: dẫn dắt thế hệ phát triển và gắn kết con người trong tương lai."
    d.multiline_text((W//2, y), sub, font=font(27, False), fill=MUTED,
                     anchor="ma", align="center", spacing=8)
    y += 116
    # điểm chính (canh giữa cụm bullet + text), nhịp dòng đều với lời mời
    items = ["Rèn luyện kỹ năng đồng hành và chia sẻ giá trị chuyên môn",
             "Kết nối mạng lưới chuyên gia cùng ngành"]
    f_it = font(26, False)
    for it in items:
        tw = d.textlength(it, font=f_it)
        total = 22 + tw
        start_x = (W - total) / 2
        cy = y
        d.ellipse([start_x, cy-22, start_x+13, cy-9], fill=TEAL_BRIGHT)
        d.text((start_x+23, cy-16), it, font=f_it, fill=WHITE, anchor="lm")
        y += 58
    # nút CTA
    btn = "Trở thành Người đồng hành"
    fb = font(30, True)
    bw = d.textlength(btn, font=fb)
    box = [W//2 - bw/2 - 34, h-100, W//2 + bw/2 + 34, h-40]
    rounded(d, box, 32, fill=GOLD)
    d.text((W//2, h-70), btn, font=fb, fill=GREEN_DARK, anchor="mm")
    return img

out_dir = os.path.join(os.path.dirname(__file__), "assets")
os.makedirs(out_dir, exist_ok=True)
p1 = os.path.join(out_dir, "tuyen-mentee.png")
p2 = os.path.join(out_dir, "tuyen-mentor.png")
make_mentee().save(p1)
make_mentor().save(p2)
print("SAVED:", p1)
print("SAVED:", p2)
