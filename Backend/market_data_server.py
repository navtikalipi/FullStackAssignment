"""
Mock Market Data Server
Run this script to start a local server that provides mock stock prices.
Access at: http://localhost:7666/market
"""

from flask import Flask, jsonify
import random
from datetime import datetime

app = Flask(__name__)

# Mock stock data with random prices
STOCKS = {
    "RELIANCE": {"name": "Reliance Industries", "base_price": 2500},
    "TCS": {"name": "Tata Consultancy Services", "base_price": 3200},
    "INFY": {"name": "Infosys", "base_price": 1400},
    "HDFCBANK": {"name": "HDFC Bank", "base_price": 1600},
    "ICICIBANK": {"name": "ICICI Bank", "base_price": 900},
    "SBIN": {"name": "State Bank of India", "base_price": 600},
    "BHARTIARTL": {"name": "Bharti Airtel", "base_price": 800},
    "HCLTECH": {"name": "HCL Technologies", "base_price": 1100},
    "WIPRO": {"name": "Wipro", "base_price": 450},
    "ADANIPORTS": {"name": "Adani Ports", "base_price": 1200},
    "ASIANPAINT": {"name": "Asian Paints", "base_price": 2800},
    "AXISBANK": {"name": "Axis Bank", "base_price": 950},
    "BAJFINANCE": {"name": "Bajaj Finance", "base_price": 6500},
    "BAJAJFINSV": {"name": "Bajaj Finserv", "base_price": 1500},
    "TITAN": {"name": "Titan Company", "base_price": 3000},
}

def generate_mock_prices():
    """Generate random stock prices with some variation"""
    market_data = {}
    for symbol, data in STOCKS.items():
        # Add random variation between -5% and +5%
        variation = random.uniform(-0.05, 0.05)
        current_price = round(data["base_price"] * (1 + variation), 2)
        
        # Generate previous day's close (slightly different)
        prev_close = round(current_price * random.uniform(0.98, 1.02), 2)
        
        # Calculate change
        change = round(current_price - prev_close, 2)
        change_percent = round((change / prev_close) * 100, 2)
        
        market_data[symbol] = {
            "symbol": symbol,
            "name": data["name"],
            "current_price": current_price,
            "previous_close": prev_close,
            "change": change,
            "change_percent": change_percent,
            "day_high": round(current_price * random.uniform(1.0, 1.03), 2),
            "day_low": round(current_price * random.uniform(0.97, 1.0), 2),
            "volume": random.randint(100000, 10000000),
            "timestamp": datetime.now().isoformat()
        }
    return market_data

@app.route('/market', methods=['GET'])
@app.route('/market/prices', methods=['GET'])
def get_market_data():
    """Get all mock stock prices"""
    return jsonify({
        "success": True,
        "data": generate_mock_prices(),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/market/<symbol>', methods=['GET'])
def get_stock_price(symbol):
    """Get price for a specific stock"""
    symbol = symbol.upper()
    if symbol in STOCKS:
        prices = generate_mock_prices()
        return jsonify({
            "success": True,
            "data": prices[symbol]
        })
    return jsonify({
        "success": False,
        "message": f"Stock symbol {symbol} not found"
    }), 404

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "market-data-mock"})

if __name__ == '__main__':
    print("=" * 50)
    print("Mock Market Data Server")
    print("=" * 50)
    print("Starting server on http://localhost:7666")
    print("Endpoints:")
    print("  - GET /market       - Get all stock prices")
    print("  - GET /market/{symbol} - Get specific stock price")
    print("  - GET /health      - Health check")
    print("=" * 50)
    app.run(host='0.0.0.0', port=7666, debug=True)
