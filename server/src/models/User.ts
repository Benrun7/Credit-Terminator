import { User as UserType, CreditCard } from '../../../shared/types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../utils/storage.js';

export class UserModel {
  private static users: Map<string, UserType> = new Map();
  private static defaultUserId = 'default-user'; // Для MVP используем одного пользователя
  private static initialized = false;

  /**
   * Инициализирует модель: загружает данные из файла
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await StorageService.initialize();
      this.users = await StorageService.loadUsers();
      this.initialized = true;
      console.log('✅ User data loaded from storage');
    } catch (error) {
      console.error('Failed to initialize UserModel:', error);
      throw error;
    }
  }

  /**
   * Сохраняет пользователя в файл
   */
  private static async persistUser(user: UserType): Promise<void> {
    try {
      await StorageService.saveUser(user);
    } catch (error) {
      console.error('Failed to persist user:', error);
      // Не бросаем ошибку, чтобы не ломать основную функциональность
    }
  }

  static getDefaultUser(): UserType {
    const existing = this.users.get(this.defaultUserId);
    if (existing) {
      return existing;
    }

    const newUser: UserType = {
      id: this.defaultUserId,
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(this.defaultUserId, newUser);
    // Сохраняем нового пользователя
    this.persistUser(newUser).catch(console.error);
    return newUser;
  }

  static getUserById(id: string): UserType | null {
    return this.users.get(id) || null;
  }

  static updateUser(user: UserType): UserType {
    const updated = {
      ...user,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(user.id, updated);
    // Сохраняем изменения
    this.persistUser(updated).catch(console.error);
    return updated;
  }

  static addCard(userId: string, card: Omit<CreditCard, 'id'>): CreditCard {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newCard: CreditCard = {
      ...card,
      id: uuidv4(),
      currency: card.currency || 'RUB',
    };

    user.cards.push(newCard);
    this.updateUser(user);

    return newCard;
  }

  static updateCard(userId: string, cardId: string, updates: Partial<CreditCard>): CreditCard | null {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const cardIndex = user.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return null;
    }

    user.cards[cardIndex] = {
      ...user.cards[cardIndex],
      ...updates,
    };

    this.updateUser(user);
    return user.cards[cardIndex];
  }

  static deleteCard(userId: string, cardId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const cardIndex = user.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return false;
    }

    user.cards.splice(cardIndex, 1);
    this.updateUser(user);
    return true;
  }

  static getAllCards(userId: string): CreditCard[] {
    const user = this.getUserById(userId);
    return user ? user.cards : [];
  }
}

