# Bản đồ nguyên tố — HaoLe 10.6

Ứng dụng web tĩnh bằng HTML, CSS và JavaScript thuần. Trên máy tính, mở `index.html`; trên điện thoại, mở `mobile.html` — đây là bản một tệp đã gộp CSS, JavaScript và dữ liệu 118 nguyên tố, không cần máy chủ hay cài ứng dụng. Có thể gửi tệp `mobile.html` sang điện thoại qua AirDrop, ứng dụng nhắn tin hoặc cáp USB, rồi mở bằng trình duyệt. Ảnh mẫu vật và phông chữ tải từ Internet; khi ngoại tuyến, dữ liệu và mô hình nguyên tử vẫn hoạt động, còn ảnh chuyển sang mô hình dự phòng nếu không tải được.

## Tệp

- `index.html` — cấu trúc trang, nội dung tiếng Việt và nguồn tham khảo.
- `styles.css` — giao diện responsive, màu theo họ nguyên tố và sơ đồ bố cục.
- `app.js` — dựng bảng, lọc/tìm kiếm, hồ sơ nguyên tố, mô hình lớp electron và orbital.
- `data.js` — dữ liệu tĩnh cho 118 nguyên tố.
- `mobile.html` — bản gọn một tệp để chuyển và mở trên điện thoại.

Chọn một ô nguyên tố để mở hồ sơ chi tiết trong cửa sổ nổi bo tròn. Nền sẽ được làm mờ; electron chuyển động chậm theo mô hình minh họa. Ảnh mẫu vật được thu gọn, xử lý nền trắng và đặt cạnh cấu hình electron. Hồ sơ có ảnh mẫu vật cho 95 nguyên tố, 8 hình minh họa được ghi nhãn rõ, và mô hình 3D dựng cho 15 nguyên tố chưa có ảnh phù hợp. Mỗi ảnh có thông tin ghi công và liên kết nguồn/giấy phép ngay bên dưới. Đóng hồ sơ bằng nút ×, nhấn `Esc` hoặc bấm ra ngoài cửa sổ.

## Nội dung và cách hiểu

- Số nhóm theo cách đánh số IUPAC từ 1 đến 18; số chu kỳ là hàng ngang. La và Ac được đặt ở nhóm 3, còn các nguyên tố f còn lại hiển thị ở hai hàng riêng.
- Tên tiếng Việt theo TCVN 5530:2010 với các nguyên tố đã có trong tiêu chuẩn; các nguyên tố được công nhận sau đó dùng tên Việt hóa thông dụng. Tên tiếng Anh và một số cách viết quen thuộc vẫn được dùng làm từ khóa tìm kiếm.
- “Electron lớp ngoài cùng” là số electron trên lớp có số lượng tử chính `n` lớn nhất. Với kim loại chuyển tiếp, electron ở phân lớp d cũng có thể tham gia liên kết; vì vậy số electron lớp ngoài cùng không phải lúc nào cũng bằng số electron hóa trị.
- Sơ đồ vòng là mô hình Bohr minh họa; electron chuyển động để tạo hiệu ứng trực quan, không phải quỹ đạo vật lý đúng tỉ lệ hoặc cố định. Hình orbital chỉ minh họa dạng tổng quát của phân lớp s/p/d/f.
- Ảnh mẫu vật không đại diện cho kích thước thật của nguyên tử. Với nguyên tố phóng xạ, cực hiếm hoặc không có ảnh mẫu phù hợp, ứng dụng dùng hình minh họa hoặc mô hình dựng và ghi rõ loại hình.
- Số nơtron được ước tính bằng số khối gần nhất trừ số proton. Số thực tế tùy đồng vị.
- Nhiệt độ nóng chảy và sôi được đổi từ kelvin sang độ C khi hiển thị; giá trị kelvin gốc vẫn có trong phần ghi chú. Dấu gạch ngang nghĩa là nguồn không có giá trị.

## Nguồn dữ liệu

- Thuộc tính nguyên tố: [PubChem Periodic Table](https://pubchem.ncbi.nlm.nih.gov/periodic-table/) và REST API của PubChem, truy cập ngày 15-10-2026.
- Ảnh và thông tin ghi công: [Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON) (CC BY-SA 3.0); ảnh được ghi tên tác giả/giấy phép theo từng hồ sơ, phần lớn từ Wikimedia Commons và [Images of Elements](https://images-of-elements.com/).
- Tên tiếng Việt: [TCVN 5530:2010](https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5530%3A2010) và [Bách khoa Toàn thư Việt Nam — Danh pháp hóa học](https://bktt.vn/BKTT:Danh_ph%C3%A1p_h%C3%B3a_h%E1%BB%8Dc).
- Quy ước nhóm: [IUPAC Periodic Table of Elements](https://iupac.org/what-we-do/periodic-table-of-elements/). Chu kỳ và vị trí được suy ra từ số hiệu nguyên tử; các giá trị ước lượng được ghi chú trong giao diện.
