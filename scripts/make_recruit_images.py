#!/usr/bin/env python3
"""Tạo 2 ảnh minh hoạ cho bài Tuyển Mentee & Tuyển Mentor — Tre Việt Mentoring."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630  # tỉ lệ news card ~ 1.9:1

# Brand Tre Việt Mentoring (khớp landing page)
GREEN_DARK = "#134E4A"   # xanh rêu đậm (nền)
TEAL = "#15B5B0"         # teal
TEAL_BRIGHT = "#2DD4BF"
CREAM = "#F5F2EC"
WHITE = "#FFFFFF"
GOLD = "#F2A93B"         # nhấn amber (dùng tiết chế)
MUTED = "#D7E5E2"        # chữ phụ trên nền tối

FONT_DIR = "/usr/share/fonts/truetype"
def find_font(names):
    for root, _, files in os.walk(FONT_DIR):
        for f in files:
            if f.lower() in names:
                return os.path.join(root, f)
    for root, _, files in os.walk(FONT_DIR):
        for f in files:
            if f.lower().endswith((".ttf", ".otf")):
                # fallback: ưu tiên DejaVu
                if "dejavu" in f.lower():
                    return os.path.join(root, f)
    return None

BOLD = find_font({"dejavusans-bold.ttf", "dejavusans-bold.obf"})
REG  = find_font({"dejavusans.ttf", "dejavusans.obf"})
print("BOLD:", BOLD)
print("REG:", REG)

def font(sz, bold=True):
    return ImageFont.truetype(BOLD if bold else REG, sz)

def rounded(draw, xy, r, fill):
    try:
        draw.rounded_rectangle(xy, radius=r, fill=fill)
    except TypeError:
        draw.rectangle(xy, fill=fill)

def base():
    img = Image.new("RGB", (W, H), GREEN_DARK)
    d = ImageDraw.Draw(img, "RGBA")
    # lớp trang trí: vòng tròn mờ teal
    d.ellipse([W-260, -160, W+120, 220], fill=(21,181,176, 40))
    d.ellipse([-180, H-260, 120, H+40], fill=(21,181,176, 28))
    d.ellipse([W-320, H-120, W-60, H+140], fill=(21,181,176, 20))
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
    img, d = base()
    logo(d)
    y = 128
    y = pill(d, "TUYỂN MENTEE · MÙA 1", W//2, y, bg=TEAL, fg=WHITE, sz=30)
    # tiêu đề chính
    d.multiline_text(
        (W//2, y), "Tìm người dẫn đường\ncho sự nghiệp của bạn",
        font=font(52, True), fill=WHITE, anchor="ma", align="center", spacing=6)
    y += 150
    # dòng phụ
    d.text((W//2, y), "Dành cho sinh viên ngành Tâm lý học & Nhân sự",
           font=font(30, False), fill=MUTED, anchor="ma")
    y += 50
    # 3 điểm chính (xếp dọc để không chồng lấn)
    items = ["Đồng hành 1-1 cùng mentor giàu kinh nghiệm",
             "Lộ trình 9 tháng có cấu trúc",
             "Hạn đăng ký: 05/10/2026"]
    for it in items:
        cy = y
        d.ellipse([W//2-300, cy-18, W//2-288, cy-6], fill=TEAL_BRIGHT)
        d.text((W//2-262, cy-12), it, font=font(25, False), fill=WHITE, anchor="lm")
        y += 44
    y += 4
    # nút CTA (màu đặc)
    btn = "Đăng ký trở thành Mentee"
    fb = font(30, True)
    bw = d.textlength(btn, font=fb)
    box = [W//2 - bw/2 - 30, H-118, W//2 + bw/2 + 30, H-52]
    rounded(d, box, 33, fill=GOLD)
    d.text((W//2, H-85), btn, font=fb, fill=GREEN_DARK, anchor="mm")
    return img

def make_mentor():
    img, d = base()
    logo(d)
    y = 128
    y = pill(d, "TUYỂN MENTOR", W//2, y, bg=TEAL, fg=WHITE, sz=30)
    d.multiline_text(
        (W//2, y), "Dẫn dắt thế hệ kế tiếp\n\"Tre già măng mọc\"",
        font=font(52, True), fill=WHITE, anchor="ma", align="center", spacing=6)
    y += 150
    d.text((W//2, y), "Dành cho chuyên gia Tâm lý & Nhân sự từ 5 năm kinh nghiệm",
           font=font(30, False), fill=MUTED, anchor="ma")
    y += 50
    items = ["Đồng hành 1-1 cùng mentee trong 9 tháng",
             "Trao truyền kinh nghiệm thực chiến",
             "Hạn đăng ký: 05/10/2026"]
    for it in items:
        cy = y
        d.ellipse([W//2-300, cy-18, W//2-288, cy-6], fill=TEAL_BRIGHT)
        d.text((W//2-262, cy-12), it, font=font(25, False), fill=WHITE, anchor="lm")
        y += 44
    y += 4
    btn = "Đăng ký trở thành Mentor"
    fb = font(30, True)
    bw = d.textlength(btn, font=fb)
    box = [W//2 - bw/2 - 30, H-118, W//2 + bw/2 + 30, H-52]
    rounded(d, box, 33, fill=GOLD)
    d.text((W//2, H-85), btn, font=fb, fill=GREEN_DARK, anchor="mm")
    return img

out_dir = os.path.join(os.path.dirname(__file__), "assets")
os.makedirs(out_dir, exist_ok=True)
p1 = os.path.join(out_dir, "tuyen-mentee.png")
p2 = os.path.join(out_dir, "tuyen-mentor.png")
make_mentee().save(p1)
make_mentor().save(p2)
print("SAVED:", p1)
print("SAVED:", p2)
