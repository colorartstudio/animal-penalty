export const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
export const formatMPH = (val) => `${val.toLocaleString()} MPH`;
