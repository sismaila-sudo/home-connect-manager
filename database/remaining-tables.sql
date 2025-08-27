-- Create all remaining tables for Home Connect Manager

CREATE TABLE hcm_task_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hcm_task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES hcm_households(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES hcm_task_categories(id),
    estimated_duration INTEGER,
    instructions JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hcm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES hcm_task_categories(id),
    template_id UUID REFERENCES hcm_task_templates(id),
    assigned_to UUID REFERENCES hcm_household_members(id),
    created_by UUID REFERENCES hcm_household_members(id),
    status task_status DEFAULT 'pending',
    priority task_priority DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    points_reward INTEGER DEFAULT 0,
    requires_photos BOOLEAN DEFAULT FALSE,
    recurring_pattern JSONB,
    location VARCHAR(255),
    prerequisites UUID[],
    completion_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE hcm_budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    parent_id UUID REFERENCES hcm_budget_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hcm_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    category_id UUID REFERENCES hcm_budget_categories(id),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    period VARCHAR(20) DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE,
    alert_threshold DECIMAL(5,2) DEFAULT 80.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hcm_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    category_id UUID REFERENCES hcm_budget_categories(id),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    receipt_url TEXT,
    vendor VARCHAR(255),
    payment_method VARCHAR(50),
    recorded_by UUID REFERENCES hcm_household_members(id),
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hcm_shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Liste de courses',
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES hcm_household_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hcm_shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES hcm_shopping_lists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit VARCHAR(50),
    category VARCHAR(100),
    estimated_price DECIMAL(10,2),
    actual_price DECIMAL(10,2),
    is_purchased BOOLEAN DEFAULT FALSE,
    purchased_by UUID REFERENCES hcm_household_members(id),
    purchased_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hcm_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES hcm_households(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    servings INTEGER DEFAULT 4,
    prep_time INTEGER,
    cook_time INTEGER,
    difficulty VARCHAR(20) DEFAULT 'medium',
    cuisine_type VARCHAR(100),
    dietary_tags TEXT[],
    ingredients JSONB NOT NULL,
    instructions JSONB NOT NULL,
    nutrition JSONB,
    image_url TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES hcm_household_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hcm_meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    meals JSONB NOT NULL,
    created_by UUID REFERENCES hcm_household_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(household_id, week_start_date)
);

CREATE TABLE hcm_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    priority task_priority DEFAULT 'medium',
    status report_status DEFAULT 'open',
    location VARCHAR(255),
    coordinates POINT,
    reported_by UUID REFERENCES hcm_household_members(id),
    assigned_to UUID REFERENCES hcm_household_members(id),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hcm_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES hcm_household_members(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE hcm_member_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES hcm_households(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES hcm_household_members(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    monthly_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(household_id, member_id)
);

CREATE TABLE hcm_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES hcm_households(id) ON DELETE CASCADE,
    user_id UUID REFERENCES hcm_household_members(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);