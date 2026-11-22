const CurrencyManager = {
  state: {
    currency: 'USD',
    rate: 1,
    symbol: '$',
    detected: false
  },

  async init() {
    const cached = sessionStorage.getItem('innovexa_currency');
    if (cached) {
      this.state = JSON.parse(cached);
      return this.state;
    }

    try {
      // 1. Silent IP-based country & currency detection (no GPS popup needed)
      const geoRes = await fetch('https://ipapi.co/json/');
      const geoData = await geoRes.json();
      const targetCurrency = geoData.currency || 'USD';

      if (targetCurrency === 'USD') {
        this.state.detected = true;
        sessionStorage.setItem('innovexa_currency', JSON.stringify(this.state));
        return this.state;
      }

      // 2. Fetch live USD exchange rate
      const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
      const rateData = await rateRes.json();
      const rate = rateData.rates?.[targetCurrency];

      if (rate) {
        this.state = {
          currency: targetCurrency,
          rate: rate,
          symbol: this.getSymbol(targetCurrency),
          detected: true
        };
        sessionStorage.setItem('innovexa_currency', JSON.stringify(this.state));
      }
    } catch (err) {
      // Ad-blocker or network failure -> silently stays on USD
      console.warn('Currency detection skipped, defaulting to USD.');
    }

    return this.state;
  },

  getSymbol(currencyCode) {
    try {
      return (0).toLocaleString('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).replace(/\d/g, '').trim();
    } catch {
      return currencyCode + ' ';
    }
  },

  formatBillingPrice(usdAmount) {
    const baseUsd = `$${Number(usdAmount).toFixed(2)} USD`;
    if (!this.state.detected || this.state.currency === 'USD') {
      return baseUsd;
    }

    const converted = (Number(usdAmount) * this.state.rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${baseUsd} (≈ ${this.state.symbol}${converted} ${this.state.currency})`;
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => CurrencyManager.init());
