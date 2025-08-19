import { 
  type User, 
  type InsertUser, 
  type Measurement, 
  type InsertMeasurement,
  type Product,
  type InsertProduct,
  type FitAnalysis,
  type Favorite,
  type Recommendation,
  type InsertRecommendation,
  type UserHistory,
  type InsertHistory,
  type Notification,
  type InsertNotification,
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
  
  // Recommendations methods
  createRecommendation(userId: string, recommendation: InsertRecommendation): Promise<Recommendation>;
  getUserRecommendations(userId: string): Promise<Recommendation[]>;
  
  // History methods
  addToHistory(userId: string, history: InsertHistory): Promise<UserHistory>;
  getUserHistory(userId: string): Promise<UserHistory[]>;
  
  // Notifications methods
  createNotification(userId: string, notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private measurements: Map<string, Measurement>;
  private products: Map<string, Product>;
  private fitAnalyses: Map<string, FitAnalysis>;
  private favorites: Map<string, Favorite>;
  private recommendations: Map<string, Recommendation>;
  private userHistory: Map<string, UserHistory>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.measurements = new Map();
    this.products = new Map();
    this.fitAnalyses = new Map();
    this.favorites = new Map();
    this.recommendations = new Map();
    this.userHistory = new Map();
    this.notifications = new Map();
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
      id,
      userId,
      chest: measurement.chest || null,
      shoulders: measurement.shoulders || null,
      waist: measurement.waist || null,
      height: measurement.height || null,
      hips: measurement.hips || null,
      confidence: measurement.confidence || null,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    
    this.measurements.set(id, newMeasurement);
    return newMeasurement;
  }

  async createProduct(userId: string, product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      id,
      userId,
      name: product.name,
      brand: product.brand || null,
      imageUrl: product.imageUrl || null,
      description: product.description || null,
      size: product.size || null,
      measurements: product.measurements || null,
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

  // Recommendations methods
  async createRecommendation(userId: string, recommendation: InsertRecommendation): Promise<Recommendation> {
    const id = randomUUID();
    const newRecommendation: Recommendation = {
      id,
      userId,
      productName: recommendation.productName,
      brand: recommendation.brand || null,
      price: recommendation.price || null,
      imageUrl: recommendation.imageUrl || null,
      fitScore: recommendation.fitScore,
      reason: recommendation.reason,
      category: recommendation.category || null,
      size: recommendation.size || null,
      externalUrl: recommendation.externalUrl || null,
      createdAt: new Date()
    };
    this.recommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(r => r.userId === userId);
  }

  // History methods
  async addToHistory(userId: string, history: InsertHistory): Promise<UserHistory> {
    const id = randomUUID();
    const newHistory: UserHistory = {
      id,
      userId,
      action: history.action,
      details: history.details || null,
      metadata: history.metadata || null,
      createdAt: new Date()
    };
    this.userHistory.set(id, newHistory);
    return newHistory;
  }

  async getUserHistory(userId: string): Promise<UserHistory[]> {
    return Array.from(this.userHistory.values())
      .filter(h => h.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Notifications methods
  async createNotification(userId: string, notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      id,
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: false,
      actionUrl: notification.actionUrl || null,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      this.notifications.set(notificationId, { ...notification, isRead: true });
    }
  }
}

export const storage = new MemStorage();
