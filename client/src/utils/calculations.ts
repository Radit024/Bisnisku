/**
 * Business calculation utilities for HPP and BEP
 */

import type { HPPCalculationData, BEPCalculationData } from '@/types';

export const calculateHPP = (
  materialCost: number,
  laborCost: number,
  overheadCost: number,
  quantity: number = 1
): HPPCalculationData => {
  const totalCost = materialCost + laborCost + overheadCost;
  const costPerUnit = totalCost / quantity;
  
  return {
    materialCost,
    laborCost,
    overheadCost,
    totalCost,
    sellingPrice: 0, // To be set by user
    profitMargin: 0, // To be calculated after selling price is set
    productName: '',
    quantity,
  };
};

export const calculateProfitMargin = (
  sellingPrice: number,
  totalCost: number
): number => {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - totalCost) / sellingPrice) * 100;
};

export const calculateMarkup = (
  sellingPrice: number,
  totalCost: number
): number => {
  if (totalCost === 0) return 0;
  return ((sellingPrice - totalCost) / totalCost) * 100;
};

export const calculateBEP = (
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number
): BEPCalculationData => {
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  
  if (contributionMargin <= 0) {
    return {
      fixedCosts,
      variableCostPerUnit,
      sellingPricePerUnit,
      breakEvenUnits: 0,
      breakEvenRevenue: 0,
    };
  }
  
  const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
  const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;
  
  return {
    fixedCosts,
    variableCostPerUnit,
    sellingPricePerUnit,
    breakEvenUnits,
    breakEvenRevenue,
  };
};

export const calculateROI = (
  netProfit: number,
  totalInvestment: number
): number => {
  if (totalInvestment === 0) return 0;
  return (netProfit / totalInvestment) * 100;
};

export const calculateNetProfitMargin = (
  netProfit: number,
  totalRevenue: number
): number => {
  if (totalRevenue === 0) return 0;
  return (netProfit / totalRevenue) * 100;
};

export const calculateAverageOrderValue = (
  totalRevenue: number,
  totalOrders: number
): number => {
  if (totalOrders === 0) return 0;
  return totalRevenue / totalOrders;
};

export const calculateMonthlyGrowthRate = (
  currentMonth: number,
  previousMonth: number
): number => {
  if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
  return ((currentMonth - previousMonth) / previousMonth) * 100;
};