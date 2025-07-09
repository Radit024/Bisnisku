/**
 * Business service - handles business settings and HPP calculations
 */
import { ApiService } from "./api";
import { queryClient } from "@/lib/queryClient";
import type { 
  BusinessSettings, 
  InsertBusinessSettings, 
  HppCalculation, 
  InsertHppCalculation 
} from "@shared/schema";

class BusinessService extends ApiService {
  constructor() {
    super("/api", queryClient);
  }

  // Business Settings
  async getBusinessSettings(): Promise<BusinessSettings | null> {
    try {
      return await this.get<BusinessSettings>("/business-settings");
    } catch (error) {
      return null;
    }
  }

  async updateBusinessSettings(data: InsertBusinessSettings): Promise<BusinessSettings> {
    const result = await this.put<BusinessSettings>("/business-settings", data);
    this.invalidateQueries("business-settings");
    return result;
  }

  // HPP Calculations
  async getHppCalculations(): Promise<HppCalculation[]> {
    return await this.get<HppCalculation[]>("/hpp-calculations");
  }

  async getHppCalculation(id: number): Promise<HppCalculation> {
    return await this.get<HppCalculation>(`/hpp-calculations/${id}`);
  }

  async createHppCalculation(data: InsertHppCalculation): Promise<HppCalculation> {
    const result = await this.post<HppCalculation>("/hpp-calculations", data);
    this.invalidateQueries("hpp-calculations");
    return result;
  }

  async updateHppCalculation(id: number, data: Partial<InsertHppCalculation>): Promise<HppCalculation> {
    const result = await this.put<HppCalculation>(`/hpp-calculations/${id}`, data);
    this.invalidateQueries("hpp-calculations");
    return result;
  }

  async deleteHppCalculation(id: number): Promise<void> {
    await this.delete(`/hpp-calculations/${id}`);
    this.invalidateQueries("hpp-calculations");
  }
}

export const businessService = new BusinessService();