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
      try {
        const cached = JSON.parse(sessionStorage.getItem('innovexa_currency_v3') || 'null');
        if (cached && cached.detected && cached.currency && cached.rate) {
          this.state = cached;
          window.dispatchEvent(new CustomEvent('currency-ready', { detail: this.state }));
          return this.state;
        }
      } catch {}

      let targetCurrency = null;

      // 1. Primary IP geolocation (ipwho.is)
      try {
        const res1 = await fetch('https://ipwho.is/', { cache: 'no-store' });
        const data1 = await res1.json();
        if (data1 && data1.success && data1.currency?.code) {
          targetCurrency = data1.currency.code;
        }
      } catch (e) {
        console.warn('ipwho.is lookup failed:', e);
      }

      // 2. Secondary IP geolocation (ipapi.co)
      if (!targetCurrency) {
        try {
          const res2 = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
          const data2 = await res2.json();
          if (data2 && data2.currency) {
            targetCurrency = data2.currency;
          }
        } catch (e) {
          console.warn('ipapi.co lookup failed:', e);
        }
      }

      // 3. Timezone fallback if IP APIs are blocked by an ad-blocker/VPN
      if (!targetCurrency) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const tzMap = {
          'Asia/Dhaka': 'BDT',
          'Asia/Kolkata': 'INR',
          'Asia/Calcutta': 'INR',
          'Europe/London': 'GBP',
          'Europe/Lisbon': 'EUR',
          'Asia/Dubai': 'AED',
          'Asia/Riyadh': 'SAR'
        };
        if (tzMap[tz]) targetCurrency = tzMap[tz];
      }

      if (!targetCurrency) {
        // Do NOT cache failed detection so next reload retries
        window.dispatchEvent(new CustomEvent('currency-ready', { detail: this.state }));
        return this.state;
      }

      targetCurrency = targetCurrency.toUpperCase();

      if (targetCurrency === 'USD') {
        this.state = { currency: 'USD', rate: 1, symbol: '$', detected: true };
        sessionStorage.setItem('innovexa_currency_v3', JSON.stringify(this.state));
        window.dispatchEvent(new CustomEvent('currency-ready', { detail: this.state }));
        return this.state;
      }

      // 4. Fetch live USD exchange rate
      try {
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
          sessionStorage.setItem('innovexa_currency_v3', JSON.stringify(this.state));
        }
      } catch (err) {
        console.warn('Exchange rate fetch failed:', err);
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

window.CurrencyManager = CurrencyManager;
CurrencyManager.init();
