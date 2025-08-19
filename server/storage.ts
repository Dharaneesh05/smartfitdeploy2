import { 
  type User, 
  type InsertUser, 
  type Measurement, 
  type InsertMeasurement,
  type Product,
  type InsertProduct,
  type FitAnalysis,
  type Favorite,
  type LoginData
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Measurement methods
  getMeasurement(userId: string): Promise<Measurement | undefined>;
  createOrUpdateMeasurement(userId: string, measurement: InsertMeasurement): Promise<Measurement>;
  
  // Product methods
  createProduct(userId: string, product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getUserProducts(userId: string): Promise<Product[]>;
  
  // Fit Analysis methods
  createFitAnalysis(userId: string, productId: string, fitStatus: string, analysis: any, recommendations?: string): Promise<FitAnalysis>;
  getUserFitAnalyses(userId: string): Promise<FitAnalysis[]>;
  
  // Favorites methods
  addToFavorites(userId: string, productId: string): Promise<Favorite>;
  removeFromFavorites(userId: string, productId: string): Promise<void>;
  getUserFavorites(userId: string): Promise<(Favorite & { product: Product })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private measurements: Map<string, Measurement>;
  private products: Map<string, Product>;
  private fitAnalyses: Map<string, FitAnalysis>;
  private favorites: Map<string, Favorite>;

  constructor() {
    this.users = new Map();
    this.measurements = new Map();
    this.products = new Map();
    this.fitAnalyses = new Map();
    this.favorites = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getMeasurement(userId: string): Promise<Measurement | undefined> {
    return Array.from(this.measurements.values()).find(m => m.userId === userId);
  }

  async createOrUpdateMeasurement(userId: string, measurement: InsertMeasurement): Promise<Measurement> {
    const existing = await this.getMeasurement(userId);
    const id = existing?.id || randomUUID();
    const now = new Date();
    
    const newMeasurement: Measurement = {
      ...measurement,
      id,
      userId,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    
    this.measurements.set(id, newMeasurement);
    return newMeasurement;
  }

  async createProduct(userId: string, product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      ...product,
      id,
      userId,
      createdAt: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getUserProducts(userId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.userId === userId);
  }

  async createFitAnalysis(userId: string, productId: string, fitStatus: string, analysis: any, recommendations?: string): Promise<FitAnalysis> {
    const id = randomUUID();
    const fitAnalysis: FitAnalysis = {
      id,
      userId,
      productId,
      fitStatus,
      analysis,
      recommendations: recommendations || null,
      createdAt: new Date()
    };
    this.fitAnalyses.set(id, fitAnalysis);
    return fitAnalysis;
  }

  async getUserFitAnalyses(userId: string): Promise<FitAnalysis[]> {
    return Array.from(this.fitAnalyses.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async addToFavorites(userId: string, productId: string): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = {
      id,
      userId,
      productId,
      createdAt: new Date()
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    const toRemove = Array.from(this.favorites.entries())
      .find(([_, fav]) => fav.userId === userId && fav.productId === productId);
    
    if (toRemove) {
      this.favorites.delete(toRemove[0]);
    }
  }

  async getUserFavorites(userId: string): Promise<(Favorite & { product: Product })[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(f => f.userId === userId);
    
    return userFavorites.map(fav => {
      const product = this.products.get(fav.productId);
      return {
        ...fav,
        product: product!
      };
    }).filter(fav => fav.product);
  }
}

export const storage = new MemStorage();
