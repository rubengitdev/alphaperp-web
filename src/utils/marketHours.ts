/**
 * Checks if the US Stock Market is currently open.
 * Regular trading hours: Monday - Friday, 9:30 AM - 4:00 PM Eastern Time.
 */
export function isUSMarketOpen(): boolean {
  const now = new Date();
  
  // Convert current time to Eastern Time (ET)
  const estString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const estDate = new Date(estString);
  
  const day = estDate.getDay();
  // Saturday (6) and Sunday (0) are closed
  if (day === 0 || day === 6) {
    return false;
  }
  
  const hours = estDate.getHours();
  const minutes = estDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // 9:30 AM = 9 * 60 + 30 = 570
  const openTime = 9 * 60 + 30;
  // 4:00 PM = 16 * 60 = 960
  const closeTime = 16 * 60;
  
  if (timeInMinutes >= openTime && timeInMinutes < closeTime) {
    return true;
  }
  
  return false;
}
