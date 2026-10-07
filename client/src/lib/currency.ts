// Currency utility — used throughout the app
export function useCurrencySymbol(user: any): string {
  return user?.currency === 'USD' ? '$' : 'R';
}

export function formatCurrency(amount: number | string, user: any): string {
  const symbol = useCurrencySymbol(user);
  const num = Number(amount);
  if (symbol === '$') {
    // Convert ZAR to USD (approximate rate)
    return `$${(num / 18.5).toFixed(2)}`;
  }
  return `R${num.toFixed(2)}`;
}
