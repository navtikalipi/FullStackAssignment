package com.tnc.domain.marketdata.provider;

import com.tnc.domain.marketdata.dto.PriceQuoteDTO;

import java.util.List;

public interface StockPriceProvider {
    /**
     * Get price quote for a single symbol
     */\n    PriceQuoteDTO getPrice(String symbol);\n\n    /**\n     * Get price quotes for multiple symbols\n     */\n    List<PriceQuoteDTO> getPrices(List<String> symbols);\n}
