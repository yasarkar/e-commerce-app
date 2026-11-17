package com.ecommerce.api.config;

import org.bson.types.Decimal128;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.math.BigDecimal;
import java.util.Arrays;

/**
MongoDB yapılandırması:
BigDecimal alanlarının MongoDB'de string yerine Decimal128 (sayısal) tipinde
saklanmasını sağlar. Bu sayede fiyat gibi alanlar üzerinde yapılan sıralama
ve karşılaştırma işlemleri sayısal olarak doğru çalışır.
*/
@Configuration
public class MongoConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(Arrays.asList(
                new BigDecimalToDecimal128Converter(),
                new Decimal128ToBigDecimalConverter()
        ));
    }

    
    // BigDecimal → Decimal128: MongoDB'ye yazarken kullanılır.
    private static class BigDecimalToDecimal128Converter implements Converter<BigDecimal, Decimal128> {
        @Override
        public Decimal128 convert(BigDecimal source) {
            return new Decimal128(source);
        }
    }

    
    // Decimal128 → BigDecimal: MongoDB'den okurken kullanılır.
    private static class Decimal128ToBigDecimalConverter implements Converter<Decimal128, BigDecimal> {
        @Override
        public BigDecimal convert(Decimal128 source) {
            return source.bigDecimalValue();
        }
    }
}
