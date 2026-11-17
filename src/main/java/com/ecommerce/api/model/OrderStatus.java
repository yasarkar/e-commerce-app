package com.ecommerce.api.model;

public enum OrderStatus {
    PENDING,        //BEKLENİYOR - Sipariş alındı, onay bekliyor
    PROCESSING,     //İŞLENİYOR - Onaylandı ve hazırlık başladı
    SHIPPED,        //GÖNDERİLDİ - Depodan çıktı
    DELIVERED,      //TESLİM EDİLDİ - Müşteriye ulaştı
    CANCELLED       //İPTAL - Sipariş iptal edildi
}