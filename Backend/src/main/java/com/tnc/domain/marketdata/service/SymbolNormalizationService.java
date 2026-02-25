package com.tnc.domain.marketdata.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SymbolNormalizationService {

    // Map of commonly used names to NSE symbol codes
    private static final Map<String, String> SYMBOL_MAPPING = new HashMap<String, String>() {{
        put("tcs", "TCS");
        put("infosys", "INFY");
        put("infosys", "INFY");
        put("reliance", "RELIANCE");
        put("hdfc bank", "HDFC");
        put("wipro", "WIPRO");
        put("larsen", "LT");
        put("maruti", "MARUTI");
        put("bajaj auto", "BAJAJ-AUTO");
        put("hcl", "HCLTECH");
        put("asian paint", "ASIANPAINT");
        put("itc", "ITC");
        put("sbi", "SBIN");
        put("icici", "ICICIBANK");
        put("hindunilvr", "HINDUNILVR");
        put("axis", "AXISBANK");
    }};\n\n    /**\n     * Normalize symbol to uppercase NSE code\n     */\n    public String normalize(String input) {\n        if (input == null || input.trim().isEmpty()) {\n            return \"\";\n        }\n        String lower = input.toLowerCase().trim();\n        return SYMBOL_MAPPING.getOrDefault(lower, input.toUpperCase());\n    }\n\n    /**\n     * Check if symbol is valid NSE format\n     */\n    public boolean isValidSymbol(String symbol) {\n        if (symbol == null || symbol.trim().isEmpty()) {\n            return false;\n        }\n        // NSE symbols are usually 1-10 characters, alphanumeric with hyphens\n        return symbol.matches(\"^[A-Z0-9-]{1,10}$\");\n    }\n}
