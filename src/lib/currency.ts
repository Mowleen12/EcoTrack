/**
 * CarbonWise — Currency & Cost Formatting Utilities
 * Localizes cost estimate labels to Indian Rupee context.
 */

/**
 * Maps English cost estimate tiers to Indian Rupee ranges.
 */
export const COST_INR_LABEL: Record<'Free' | 'Low' | 'Medium' | 'High', string> = {
  Free: 'Free',
  Low: '₹500 – ₹2,000',
  Medium: '₹2,000 – ₹8,000',
  High: '₹8,000+',
};

/**
 * Formats a number as Indian Rupees using the en-IN locale.
 * e.g. 15000 → "₹15,000"
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
