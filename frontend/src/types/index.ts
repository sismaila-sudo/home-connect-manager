// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  subscription_type: 'free' | 'family' | 'professional';
  created_at: string;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'owner' | 'co_manager' | 'member' | 'guest';
  avatar_url?: string;
  login_code?: string;
  status: 'active' | 'inactive';
  total_points?: number;
  level?: number;
  total_tasks?: number;
  completed_tasks?: number;
  created_at: string;
}

export interface Household {
  id: string;
  name: string;
  address?: string;
  currency: string;
  timezone: string;
  owner_name?: string;
  owner_email?: string;
  settings?: Record<string, any>;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  member: Member | null;
  household: Household | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithCode: (code: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  householdName?: string;
}

// Task Types
export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  estimated_duration?: number;
  instructions?: any;
  is_public: boolean;
}

export interface Task {
  id: string;
  household_id: string;
  title: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  template_id?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  created_by?: string;
  created_by_name?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  points_reward: number;
  requires_photos: boolean;
  location?: string;
  recurring_pattern?: any;
  completion_notes?: string;
  photos?: TaskPhoto[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TaskPhoto {
  id: string;
  url: string;
  type: 'before' | 'after' | 'progress';
  uploaded_at: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  category_id?: string;
  template_id?: string;
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_duration?: number;
  points_reward: number;
  requires_photos: boolean;
  location?: string;
  recurring_pattern?: any;
}

// Recipe Types
export interface Recipe {
  id: string;
  household_id?: string;
  name: string;
  description?: string;
  servings: number;
  prep_time?: number;
  cook_time?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine_type?: string;
  dietary_tags: string[];
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  nutrition?: any;
  image_url?: string;
  is_favorite: boolean;
  is_public: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeInstruction {
  step: number;
  description: string;
}

// Shopping Types
export interface ShoppingList {
  id: string;
  household_id: string;
  name: string;
  status: 'active' | 'completed';
  created_by?: string;
  created_by_name?: string;
  total_items?: number;
  purchased_items?: number;
  estimated_total?: number;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
  estimated_price?: number;
  actual_price?: number;
  is_purchased: boolean;
  purchased_by?: string;
  purchased_at?: string;
  notes?: string;
  created_at: string;
}

// Budget Types
export interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  household_id: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  alert_threshold: number;
  spent_amount?: number;
  created_at: string;
}

export interface Expense {
  id: string;
  household_id: string;
  category_id?: string;
  category_name?: string;
  amount: number;
  description?: string;
  receipt_url?: string;
  vendor?: string;
  payment_method?: string;
  recorded_by?: string;
  expense_date: string;
  created_at: string;
}

// Report Types
export interface Report {
  id: string;
  household_id: string;
  title: string;
  description: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  location?: string;
  coordinates?: any;
  reported_by?: string;
  reported_by_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  estimated_cost?: number;
  actual_cost?: number;
  due_date?: string;
  resolved_at?: string;
  photos?: ReportPhoto[];
  created_at: string;
  updated_at: string;
}

export interface ReportPhoto {
  id: string;
  url: string;
  caption?: string;
  uploaded_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  household_id: string;
  recipient_id: string;
  type: 'task_assigned' | 'task_overdue' | 'budget_exceeded' | 'maintenance_due';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  sent_at: string;
  read_at?: string;
}

// Dashboard Types
export interface DashboardStats {
  task_stats: {
    total_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
  };
  member_count: number;
  recent_tasks: Task[];
  budget_summary: {
    total_expenses: number;
    expense_count: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginationResponse<T> extends ApiResponse<T> {
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface MemberLoginForm {
  loginCode: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  householdName?: string;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Override<T, R> = Omit<T, keyof R> & R;