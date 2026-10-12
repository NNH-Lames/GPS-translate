export const DEMO_POIS = [
  { id: 'q4-oc-dao', name: 'Quán Ốc Đào Duy Từ', category: 'Ốc', address: 'Đào Duy Từ, Phường 5, Quận 4', rating: 4.8, reviews: 284, price: '50.000đ - 150.000đ', hours: '15:00 - 23:00', phone: '0908123456', tags: ['Ốc hương sốt bơ bắp', 'Sò điệp phô mai'], status: 'online', coordinates: [106.6976, 10.7616] },
  { id: 'q4-banh-mi-tit', name: 'Bánh Mì Kẹp Tít', category: 'Bánh mì', address: 'Đoàn Văn Bơ, Phường 14, Quận 4', rating: 4.6, reviews: 142, price: '20.000đ - 35.000đ', hours: '06:00 - 21:00', phone: '0912345678', tags: ['Pate gia truyền', 'Bánh mì giòn rụm'], status: 'online', coordinates: [106.6981, 10.7586] },
  { id: 'q4-chao-be-quynh', name: 'Cháo Sườn Bé Quỳnh', category: 'Cháo', address: 'Chợ Xóm Chiếu, Quận 4', rating: 4.7, reviews: 98, price: '30.000đ - 50.000đ', hours: '16:00 - 22:00', phone: '0933555777', tags: ['Sườn sụn', 'Trứng bắc thảo'], status: 'offline', coordinates: [106.7024, 10.7595] },
  { id: 'q4-com-tam', name: 'Cơm Tấm Bì Chả', category: 'Cơm tấm', address: 'Hoàng Diệu, Phường 6, Quận 4', rating: 4.5, reviews: 310, price: '35.000đ - 65.000đ', hours: '06:30 - 20:30', phone: '0944666888', tags: ['Sườn nướng mật ong', 'Chả trứng'], status: 'hybrid', coordinates: [106.7041, 10.7602] },
  { id: 'q4-hu-tieu', name: 'Hủ Tiếu Bò Viên', category: 'Hủ tiếu', address: 'Phố Ốc Vĩnh Khánh, Phường 8, Quận 4', rating: 4.9, reviews: 420, price: '40.000đ - 70.000đ', hours: '11:00 - 23:30', phone: '0988999111', tags: ['Bò viên gân', 'Nước lèo hầm xương'], status: 'online', coordinates: [106.7062, 10.7597] },
  { id: 'q4-pha-lau', name: 'Phá Lấu Cô Oanh', category: 'Phá lấu', address: '200 Xóm Chiếu, Phường 14, Quận 4', rating: 4.9, reviews: 580, price: '30.000đ - 45.000đ', hours: '13:00 - 22:00', phone: '0903888222', tags: ['Đặc sản Quận 4', 'Mắm me chua ngọt'], status: 'online', coordinates: [106.7011, 10.7583] },
  { id: 'q4-sup-cua', name: 'Súp Cua Hằng', category: 'Súp cua', address: 'Xóm Chiếu, Quận 4', rating: 4.7, reviews: 260, price: '35.000đ - 65.000đ', hours: '14:00 - 21:00', phone: '0909333444', tags: ['Thịt cua tươi', 'Óc heo'], status: 'hybrid', coordinates: [106.6994, 10.7601] },
];

export function normalizePoi(poi, index = 0) {
  const rawCoordinates = poi.coordinates ?? poi.location?.coordinates ?? poi.geometry?.coordinates;
  const coordinates = Array.isArray(rawCoordinates) && rawCoordinates.length >= 2
    ? [Number(rawCoordinates[0]), Number(rawCoordinates[1])]
    : null;
  if (!coordinates || coordinates.some((value) => !Number.isFinite(value))) return null;

  const status = ['online', 'offline', 'hybrid'].includes(poi.status) ? poi.status : (poi.is_active === false ? 'offline' : 'online');
  return {
    ...poi,
    id: String(poi.id ?? poi._id ?? poi.poi_id ?? `poi-${index}`),
    name: poi.name ?? poi.name_vi ?? 'Địa điểm ẩm thực',
    category: poi.category ?? poi.dish ?? 'Khác',
    address: poi.address ?? poi.location?.address ?? 'Quận 4, TP. Hồ Chí Minh',
    rating: Number(poi.rating ?? 0),
    reviews: Number(poi.reviews ?? poi.review_count ?? 0),
    price: poi.price ?? poi.price_range ?? 'Liên hệ',
    hours: poi.hours ?? poi.opening_hours ?? 'Đang cập nhật',
    phone: poi.phone ?? '',
    tags: Array.isArray(poi.tags) ? poi.tags : [],
    status,
    coordinates,
  };
}
