# Toast / Notification Sistemi

Kullanıcı işlemlerine görsel geri bildirim sağlayan, minimalist ve can sıkmayan bir bildirim sistemi.

## Tasarım Felsefesi

> [!IMPORTANT]
> **Temel kural: Her işlem için toast göstermiyoruz.** Yalnızca kullanıcının "sonucu bilmesi gereken" önemli ve seyrek işlemler için toast kullanılacak. Sık ve ardışık işlemlerde (sepete ekleme, favori toggle) toast göstermek UX kalitesini düşürür.

### ✅ Toast Gösterilecek İşlemler (Seyrek & Önemli)

| İşlem | Tip | Mesaj |
|-------|-----|-------|
| Sipariş oluşturuldu | `success` | Siparişiniz başarıyla oluşturuldu! |
| Sipariş iptal edildi | `warning` | Siparişiniz iptal edildi |
| Kupon geçersiz/süresi dolmuş | `error` | Bu kuponun geçerlilik süresi dolmuş |
| Kupon uygulandı | `success` | %20 indirim uygulandı! |
| Yorum eklendi | `success` | Yorumunuz başarıyla eklendi |
| Yorum güncellendi | `success` | Yorumunuz güncellendi |
| Yorum silindi | `info` | Yorumunuz silindi |
| Giriş başarılı | `success` | Hoş geldiniz, {ad}! |
| Çıkış yapıldı | `info` | Oturumunuz sonlandırıldı |
| Kayıt başarılı | `success` | Hesabınız oluşturuldu |
| Admin: Ürün/Kategori/Kupon CRUD | `success` | Ürün başarıyla oluşturuldu |
| API hata (genel) | `error` | Bir hata oluştu. Lütfen tekrar deneyin |
| Stok yetersiz (sepet hata) | `error` | Yetersiz stok: ... |

### ❌ Toast Gösterilmeyecek İşlemler (Sık & Ardışık)

| İşlem | Neden Gösterilmez |
|-------|--------------------|
| Sepete ürün eklendi | Zaten sepet drawer'ı açılıyor — görsel geri bildirim mevcut |
| Favorilere eklendi/çıkarıldı | Kalp ikonunun dolması yeterli görsel geri bildirim |
| Sepetten ürün çıkarıldı | Drawer içinde anında güncelleniyor |
| Miktar değiştirildi | Anlık güncelleme zaten görünüyor |

---

## Proposed Changes

### Toast Altyapısı

#### [NEW] [ToastContext.tsx](file:///c:/e-commerce/frontend/src/context/ToastContext.tsx)
Global toast state yönetimi:
```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;  // ms, varsayılan: 4000
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}
```

**Özellikler:**
- Benzersiz `id` ile her toast yönetilir (`crypto.randomUUID()`)
- Varsayılan süre: **4 saniye** (error için **5 saniye**)
- Aynı anda **en fazla 3 toast** gösterilir (kuyruğa alınmaz, en eskisi düşer)
- Otomatik kapanma (`setTimeout`) + manuel kapatma (X butonu)

#### [NEW] [ToastContainer.tsx](file:///c:/e-commerce/frontend/src/components/toast/ToastContainer.tsx)
Ekranın **sağ üst köşesinde** konumlanmış, `fixed` pozisyonlu konteyner:
- Her toast kartı için giriş/çıkış animasyonu (`slide-in-right` + `fade-out`)
- Z-index modal'ların üstünde (`z-[9999]`)
- Responsive: Mobilde tam genişlikte ortalanmış

#### [NEW] [ToastItem.tsx](file:///c:/e-commerce/frontend/src/components/toast/ToastItem.tsx)
Tek bir toast kartı bileşeni:
- **success**: Yeşil sol kenar + ✓ ikon
- **error**: Kırmızı sol kenar + ✗ ikon
- **warning**: Amber sol kenar + ⚠ ikon
- **info**: Mavi sol kenar + ℹ ikon
- Sağ üstte X (kapatma) butonu
- Alt kısımda ince ilerleme çubuğu (kalan süreyi gösterir)
- Hover'da otomatik kapanma duraklar

---

### Entegrasyon Noktaları

#### [MODIFY] [App.tsx](file:///c:/e-commerce/frontend/src/App.tsx)
- `ToastProvider` en dış sarmalayıcı olarak eklenir (tüm context'lerin dışına)
- `ToastContainer` BrowserRouter içine eklenir

```diff
+ <ToastProvider>
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            ...
+           <ToastContainer />
            <CartDrawer />
            <WishlistDrawer />
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
+ </ToastProvider>
```

#### [MODIFY] [CartContext.tsx](file:///c:/e-commerce/frontend/src/context/CartContext.tsx)
Mevcut `alert()` çağrıları **kaldırılır** — hata durumları sessiz kalır veya isteğe bağlı toast:
```diff
- alert('Ürün sepete eklenirken bir hata oluştu.');
+ // Hata sessizce loglanır, kullanıcıya drawer içinde zaten gösterilir
```

> [!NOTE]
> Sepet hataları için toast kullanmıyoruz çünkü kullanıcı zaten drawer açıkken hata durumunu fark eder. Tek istisna: giriş yapmadan sepete ekleme denemesi — bu durumda yönlendirme zaten yapılıyor.

#### [MODIFY] [Checkout.tsx](file:///c:/e-commerce/frontend/src/pages/Checkout.tsx)
Sipariş oluşturma sonrası:
```diff
  await fetchCart();
+ showToast('success', 'Siparişiniz başarıyla oluşturuldu! 🎉');
  navigate(`/order-success/${response.data.id}`);
```

Sipariş hatası:
```diff
- setErrorMessage(errorData.message || '...');
+ setErrorMessage(errorData.message || '...');
+ showToast('error', errorData.message || 'Sipariş oluşturulurken bir hata oluştu.');
```

#### [MODIFY] [CouponInput.tsx](file:///c:/e-commerce/frontend/src/components/coupon/CouponInput.tsx)
Kupon geçersiz:
```diff
+ showToast('error', errorData?.message || 'Kupon doğrulanırken bir hata oluştu.');
```

Kupon başarılı (opsiyonel — zaten yeşil kutu gösteriliyor):
```diff
+ showToast('success', response.data.message);  // "%20 indirim uygulandı!"
```

#### [MODIFY] [ReviewSection.tsx](file:///c:/e-commerce/frontend/src/components/review/ReviewSection.tsx)
```diff
  // handleCreate başarılı:
+ showToast('success', 'Yorumunuz başarıyla eklendi');

  // handleUpdate başarılı:
+ showToast('success', 'Yorumunuz güncellendi');

  // handleDelete başarılı:
+ showToast('info', 'Yorumunuz silindi');
```

#### [MODIFY] [Login.tsx](file:///c:/e-commerce/frontend/src/pages/Login.tsx)
```diff
  // Başarılı giriş sonrası:
+ showToast('success', `Hoş geldiniz, ${response.user.firstName}!`);
```

#### [MODIFY] [Register.tsx](file:///c:/e-commerce/frontend/src/pages/Register.tsx)
```diff
  // Başarılı kayıt sonrası:
+ showToast('success', 'Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');
```

#### [MODIFY] [Profile.tsx](file:///c:/e-commerce/frontend/src/pages/Profile.tsx)
Sipariş iptal sonrası:
```diff
+ showToast('warning', 'Siparişiniz iptal edildi');
```

#### [MODIFY] Admin sayfaları (AdminProducts, AdminCategories, AdminCoupons, AdminOrders)
CRUD işlemleri sonrası:
```diff
+ showToast('success', 'Ürün başarıyla oluşturuldu');
+ showToast('success', 'Kupon güncellendi');
+ showToast('warning', 'Ürün silindi');
```

---

## Dosya Özeti

| Dosya | İşlem | Açıklama |
|-------|-------|----------|
| `ToastContext.tsx` | YENİ | Global toast state + `showToast` fonksiyonu |
| `ToastContainer.tsx` | YENİ | Sabit konumlu toast listesi konteyner |
| `ToastItem.tsx` | YENİ | Tek toast kartı (animasyonlu, renkli) |
| `App.tsx` | GÜNCELLEME | ToastProvider + ToastContainer ekleme |
| `CartContext.tsx` | GÜNCELLEME | `alert()` çağrılarını kaldırma |
| `Checkout.tsx` | GÜNCELLEME | Sipariş başarı/hata toast'ları |
| `CouponInput.tsx` | GÜNCELLEME | Kupon geçersiz toast'ı |
| `ReviewSection.tsx` | GÜNCELLEME | Yorum CRUD toast'ları |
| `Login.tsx` | GÜNCELLEME | Giriş başarı toast'ı |
| `Register.tsx` | GÜNCELLEME | Kayıt başarı toast'ı |
| `Profile.tsx` | GÜNCELLEME | Sipariş iptal toast'ı |
| Admin sayfaları | GÜNCELLEME | CRUD işlem toast'ları |

## Open Questions

> [!NOTE]
> **Toast pozisyonu**: Sağ üst köşe (`top-right`) en yaygın kullanılan ve en az UX çakışması olan konumdur. Farklı bir konum tercih ediyor musunuz? (sağ alt, sol alt, üst orta vb.)

## Verification Plan

### Manual Verification
1. Toast görünümü: 4 tip (success, error, warning, info) test edilir
2. Otomatik kapanma: 4 saniye sonra kaybolması
3. Manuel kapanma: X butonuyla kapatma
4. Animasyonlar: Giriş (slide-in) ve çıkış (fade-out)
5. Hover: Mouse üzerinde iken süre duraklama
6. Max 3 toast: 4+ toast tetiklendiğinde en eskisinin düşmesi
7. Entegrasyon: Kupon hata, sipariş başarı, yorum ekleme senaryoları
8. Mobil: Responsive davranış
