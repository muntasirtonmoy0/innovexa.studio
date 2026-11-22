const CurrencyManager = {
  state: {
    currency: 'USD',
    rate: 1,
    symbol: '$',
    detected: false
  },
  _initPromise: null,

  init() {
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      const cached = sessionStorage.getItem('innovexa_currency_v2');
      if (cached) {
        this.state = JSON.parse(cached);
        window.dispatchEvent(new CustomEvent('currency-ready', { detail: this.state }));
        return this.state;
      }

      try {
        let targetCurrency = null;

        // 1. Primary IP geolocation (ipwho.is - no strict rate limits, CORS friendly)
        try {
          const res1 = await fetch('https://ipwho.is/');
          const data1 = await res1.json();
          if (data1 && data1.success && data1.currency?.code) {
            targetCurrency = data1.currency.code;
          }
        } catch (e) {
          console.warn('Primary geo lookup failed, trying fallback...');
        }

        // 2. Fallback IP geolocation (ipapi.co)
        if (!targetCurrency) {
          const res2 = await fetch('https://ipapi.co/json/');
          const data2 = await res2.json();
          if (data2 && data2.currency) {
            targetCurrency = data2.currency;
          }
        }

        targetCurrency = (targetCurrency || 'USD').toUpperCase();

        if (targetCurrency === 'USD') {
          this.state.detected = true;
          sessionStorage.setItem('innovexa_currency_v2', JSON.stringify(this.state));
          window.dispatchEvent(new CustomEvent('currency-ready', { detail: this.state }));
          return this.state;
        }

        // 3. Fetch live USD exchange rate
        const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const rateData = await rateRes.json();
        const rate = rateData?.rates?.[targetCurrency];

        if (rate) {
          this.state = {
            currency: targetCurrency,
            rate: rate,
            symbol: this.getSymbol(targetCurrency),
            detected: true
          };
          sessionStorage.setItem('innovexa_currency_v2', JSON.stringify(this.state));
        }
      } catch (err) {
        console.warn('Currency detection failed, defaulting to USD:', err);
      }

      window.dispatchEvent(new CustomEvent('currency-ready', { detail: this.state }));
      return this.state;
    })();

    return this._initPromise;
  },

  getSymbol(currencyCode) {
    const commonSymbols = {
      BDT: '৳',
      INR: '₹',
      EUR: '€',
      GBP: '£',
      CAD: 'CA$',
      AUD: 'A$',
      AED: 'AED ',
      SAR: 'SAR '
    };
    if (commonSymbols[currencyCode]) return commonSymbols[currencyCode];

    try {
      return (0).toLocaleString('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).replace(/\d/g, '').trim() + ' ';
    } catch {
      return currencyCode + ' ';
    }
  },

  formatBillingPrice(usdAmount) {
    const amount = Number(usdAmount) || 0;
    const baseUsd = `$${amount.toFixed(2)} USD`;

    if (!this.state.detected || this.state.currency === 'USD') {
      return baseUsd;
    }

    const converted = (amount * this.state.rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${baseUsd} (≈ ${this.state.symbol}${converted} ${this.state.currency})`;
  }
};

// Explicitly attach to window so <script type="module"> can always access it
window.CurrencyManager = CurrencyManager;
CurrencyManager.init();
