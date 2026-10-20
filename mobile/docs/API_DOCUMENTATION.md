# 📑 Tài liệu Danh Sách API - GPS-Translate & Bản Đồ Quận 4

Hệ thống API phục vụ ứng dụng **Bản đồ ẩm thực & Thuyết minh GPS tự động (GPS-Translate)** tại Quận 4, TP. Hồ Chí Minh. Các tệp đã được tạo sẵn trong thư mục `docs/`:

- **Swagger / OpenAPI 3.0**: [openapi.json](file:///d:/2026/T9/CNPT/GPS-translate/mobile/docs/openapi.json)
- **Postman Collection v2.1**: [postman_collection.json](file:///d:/2026/T9/CNPT/GPS-translate/mobile/docs/postman_collection.json)

---

## 🚀 Hướng Dẫn Nhanh Cách Demo

### Cách 1: Demo Bằng Swagger UI / Swagger Editor (Không cần cài đặt)
1. Mở trình duyệt và truy cập: [https://editor.swagger.io/](https://editor.swagger.io/)
2. Trên thanh menu trên cùng, chọn **File** ➡️ **Import File**.
3. Chọn tệp [docs/openapi.json](file:///d:/2026/T9/CNPT/GPS-translate/mobile/docs/openapi.json) trong thư mục dự án.
4. Giao diện Swagger UI tương tác sẽ hiển thị toàn bộ API với các nút **Try it out**, schema dữ liệu, mã phản hồi 200/400/401 và dữ liệu mẫu.

### Cách 2: Demo Bằng Postman
1. Mở ứng dụng **Postman**.
2. Nhấn nút **Import** (góc trên bên trái).
3. Kéo thả hoặc chọn tệp [docs/postman_collection.json](file:///d:/2026/T9/CNPT/GPS-translate/mobile/docs/postman_collection.json).
4. Bạn sẽ thấy thư mục **GPS-Translate & Quan 4 Audio Guide API** xuất hiện trong tab *Collections* với 6 nhóm chức năng và đầy đủ ví dụ (Examples / Mock responses).
5. Có thể cấu hình biến môi trường `baseUrl` (mặc định là `http://localhost:5000/api/v1`).

---

## 📋 Bảng Tổng Hợp Danh Sách API

| STT | Phương thức | Đường dẫn API | Mô tả chức năng | Quyền truy cập |
| :---: | :---: | :--- | :--- | :---: |
| **I** | **Authentication** | | | |
| 1 | `POST` | `/auth/login` | Đăng nhập tài khoản, nhận JWT token | Public |
| 2 | `GET` | `/auth/me` | Lấy thông tin tài khoản đang đăng nhập | Bearer Token |
| **II** | **POI & Bản đồ ẩm thực** | | | |
| 3 | `GET` | `/poi/load-all` | Tải toàn bộ danh sách POI (gọi trực tiếp từ Mobile app) | Public |
| 4 | `GET` | `/poi/{id}` | Lấy chi tiết thông tin một địa điểm ẩm thực | Public |
| 5 | `GET` | `/poi/nearby` | Tìm các địa điểm gần tọa độ GPS người dùng | Public |
| 6 | `POST` | `/poi` | Thêm mới địa điểm ẩm thực | Admin / Token |
| 7 | `PUT` | `/poi/{id}` | Cập nhật thông tin địa điểm ẩm thực | Admin / Token |
| 8 | `DELETE` | `/poi/{id}` | Xóa địa điểm | Admin / Token |
| **III**| **GPS & Geofence (Thuyết minh tự động)** | | | |
| 9 | `POST` | `/gps/geofence-check` | Kiểm tra tọa độ GPS để tự kích hoạt phát âm thanh | Public |
| **IV** | **Dịch thuật đa ngôn ngữ** | | | |
| 10 | `GET` | `/translate/languages` | Danh sách ngôn ngữ hệ thống hỗ trợ (VI, EN, ZH, JA...) | Public |
| 11 | `POST` | `/translate/text` | Dịch nội dung mô tả / biển hiệu / thực đơn món | Public |
| **V** | **Audio Guide & Giọng nói (TTS)** | | | |
| 12 | `GET` | `/audio/poi/{id}` | Stream file âm thanh thuyết minh theo POI & ngôn ngữ | Public |
| 13 | `POST` | `/audio/tts` | Tạo âm thanh thuyết minh từ văn bản (Text-To-Speech) | Public / Token |
| **VI** | **Đánh giá & Yêu thích** | | | |
| 14 | `GET` | `/poi/{id}/reviews` | Lấy danh sách đánh giá của quán | Public |
| 15 | `POST` | `/poi/{id}/reviews` | Gửi bình luận và số sao đánh giá (1 - 5) | Bearer Token |
| 16 | `GET` | `/user/saved-pois` | Lấy danh sách các quán đã bấm lưu yêu thích | Bearer Token |
| 17 | `POST` | `/user/saved-pois` | Thêm quán vào danh sách đã lưu | Bearer Token |
| 18 | `DELETE` | `/user/saved-pois/{id}` | Xóa quán khỏi danh sách đã lưu | Bearer Token |

---

## 🔍 Chi Tiết Các Endpoint Nổi Bật

### 1. Tải toàn bộ POI lên bản đồ (`/poi/load-all`)
- **Khớp trực tiếp với file:** [`mobile/src/services/poiApi.js`](file:///d:/2026/T9/CNPT/GPS-translate/mobile/src/services/poiApi.js)
- **Tham số Query:**
  - `lang`: Ngôn ngữ (ví dụ: `vi`, `en`)
  - `category`: Tùy chọn lọc theo loại món (`Ốc`, `Bánh mì`, `Phá lấu`, `Cháo`...)
  - `status`: `all`, `online`, `offline`, `hybrid`
- **Ví dụ phản hồi JSON:**
```json
{
  "success": true,
  "count": 7,
  "lang": "vi",
  "pois": [
    {
      "id": "q4-oc-dao",
      "name": "Quán Ốc Đào Duy Từ",
      "category": "Ốc",
      "address": "Đào Duy Từ, Phường 5, Quận 4",
      "rating": 4.8,
      "reviews": 284,
      "price": "50.000đ - 150.000đ",
      "hours": "15:00 - 23:00",
      "phone": "0908123456",
      "tags": ["Ốc hương sốt bơ bắp", "Sò điệp phô mai"],
      "status": "online",
      "coordinates": [106.6976, 10.7616],
      "geofence_radius": 35
    }
  ]
}
```

---

### 2. Quét Geofence tự động kích hoạt Audio Guide (`/gps/geofence-check`)
- **Mục đích:** Ứng dụng điện thoại gửi vị trí GPS theo chu kỳ (mỗi khi người dùng di chuyển). Khi du khách bước vào vùng lân cận quán (bán kính ví dụ < 35m), máy chủ báo `should_trigger: true` và gửi URL audio thuyết minh tương ứng.
- **Request Body:**
```json
{
  "latitude": 10.7583,
  "longitude": 106.7011,
  "lang": "vi",
  "last_played_poi_id": null
}
```
- **Response:**
```json
{
  "should_trigger": true,
  "distance_meters": 18.5,
  "triggered_poi": {
    "id": "q4-pha-lau",
    "name": "Phá Lấu Cô Oanh",
    "category": "Phá lấu",
    "address": "200 Xóm Chiếu, Phường 14, Quận 4"
  },
  "audio_stream_url": "/api/v1/audio/poi/q4-pha-lau?lang=vi",
  "auto_play_text": "Bạn đang ở gần Phá Lấu Cô Oanh, địa chỉ 200 Xóm Chiếu..."
}
```

---

### 3. Tìm quán lân cận (`/poi/nearby`)
- **Query Params:**
  - `lng`: Kinh độ hiện tại (ví dụ: `106.7011`)
  - `lat`: Vĩ độ hiện tại (ví dụ: `10.7583`)
  - `radius`: Bán kính mét (ví dụ: `1000`)
- **Response:** Danh sách các quán kèm trường `distance_meters` đã sắp xếp từ gần nhất đến xa nhất.

---

### 4. Dịch thuật thực đơn & nội dung (`/translate/text`)
- **Mục đích:** Dành cho khách du lịch nước ngoài khi xem tên các món ăn đặc sản Việt Nam.
- **Request:**
```json
{
  "text": "Ốc hương sốt bơ bắp kèm bánh mì nóng giòn",
  "source_lang": "vi",
  "target_lang": "en"
}
```
- **Response:**
```json
{
  "original_text": "Ốc hương sốt bơ bắp kèm bánh mì nóng giòn",
  "translated_text": "Sweet snails with corn butter sauce served with crispy hot baguette",
  "source_lang": "vi",
  "target_lang": "en"
}
```
