-- HOME CONNECT MANAGER - Supabase Sample Data
-- Compatible with Supabase Auth integration

-- First, we'll create demo user profiles
-- Note: In production, these would be created automatically when users sign up
INSERT INTO user_profiles (id, auth_user_id, email, name, phone, subscription_type) VALUES
('550e8400-e29b-41d4-a716-446655440000', NULL, 'marie.martin@email.com', 'Marie Martin', '+33612345678', 'family'),
('550e8400-e29b-41d4-a716-446655440001', NULL, 'jean.dupont@email.com', 'Jean Dupont', '+33687654321', 'free'),
('550e8400-e29b-41d4-a716-446655440002', NULL, 'sophie.bernard@email.com', 'Sophie Bernard', '+33698765432', 'professional');

-- Demo households
INSERT INTO households (id, owner_id, name, address, currency, timezone) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Maison Martin', '12 Rue de la Paix, 75001 Paris', 'EUR', 'Europe/Paris'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Villa Dupont', '45 Avenue des Champs, 69000 Lyon', 'EUR', 'Europe/Paris'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Château Bernard', '78 Rue du Commerce, 33000 Bordeaux', 'EUR', 'Europe/Paris');

-- Demo household members (including owners and staff)
INSERT INTO household_members (id, household_id, user_profile_id, name, email, phone, role, login_code, status) VALUES
-- Maison Martin members
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Marie Martin', 'marie.martin@email.com', '+33612345678', 'owner', NULL, 'active'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', NULL, 'Pierre Martin', 'pierre.martin@email.com', '+33612345679', 'co_manager', 'PIERRE01', 'active'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', NULL, 'Lucie Dubois', 'lucie.dubois@email.com', '+33623456789', 'member', 'LUCIE01', 'active'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', NULL, 'Ahmed Hassan', 'ahmed.hassan@email.com', '+33634567890', 'member', 'AHMED01', 'active'),
-- Villa Dupont members
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Jean Dupont', 'jean.dupont@email.com', '+33687654321', 'owner', NULL, 'active'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', NULL, 'Claire Moreau', 'claire.moreau@email.com', '+33645678901', 'member', 'CLAIRE01', 'active'),
-- Château Bernard members
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Sophie Bernard', 'sophie.bernard@email.com', '+33698765432', 'owner', NULL, 'active'),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', NULL, 'Marc Leroy', 'marc.leroy@email.com', '+33656789012', 'co_manager', 'MARC01', 'active'),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', NULL, 'Isabella Santos', 'isabella.santos@email.com', '+33667890123', 'member', 'ISABEL01', 'active'),
('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440002', NULL, 'Thomas Petit', 'thomas.petit@email.com', '+33678901234', 'member', 'THOMAS01', 'active');

-- Task categories for each household
INSERT INTO task_categories (id, household_id, name, color, icon) VALUES
-- Maison Martin categories
('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Ménage', '#EF4444', 'cleaning'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Cuisine', '#F97316', 'cooking'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'Jardinage', '#22C55E', 'gardening'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', 'Maintenance', '#3B82F6', 'maintenance'),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440000', 'Courses', '#8B5CF6', 'shopping'),
-- Villa Dupont categories
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Ménage', '#EF4444', 'cleaning'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'Cuisine', '#F97316', 'cooking'),
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', 'Jardinage', '#22C55E', 'gardening'),
-- Château Bernard categories
('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'Ménage', '#EF4444', 'cleaning'),
('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440002', 'Cuisine', '#F97316', 'cooking'),
('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'Jardinage', '#22C55E', 'gardening'),
('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'Maintenance', '#3B82F6', 'maintenance');

-- Task templates
INSERT INTO task_templates (id, household_id, name, description, category_id, estimated_duration, instructions, is_public) VALUES
('990e8400-e29b-41d4-a716-446655440000', NULL, 'Nettoyage salon complet', 'Nettoyage approfondi du salon', NULL, 120, '{"steps": ["Dépoussiérer tous les meubles", "Passer l''aspirateur", "Nettoyer les vitres", "Ranger les objets"]}', true),
('990e8400-e29b-41d4-a716-446655440001', NULL, 'Préparation repas 4 personnes', 'Préparer un repas complet pour 4 personnes', NULL, 90, '{"steps": ["Vérifier les ingrédients", "Préparer les légumes", "Cuire le plat principal", "Dresser les assiettes"]}', true),
('990e8400-e29b-41d4-a716-446655440002', NULL, 'Tonte pelouse', 'Tondre et entretenir la pelouse', NULL, 60, '{"steps": ["Vérifier l''équipement", "Tondre la pelouse", "Ramasser l''herbe coupée", "Nettoyer les outils"]}', true);

-- Demo tasks
INSERT INTO tasks (id, household_id, title, description, category_id, assigned_to, created_by, status, priority, due_date, estimated_duration, points_reward, requires_photos) VALUES
-- Maison Martin tasks
('aa0e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Nettoyer la cuisine', 'Nettoyage complet de la cuisine après le dîner', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000', 'pending', 'high', NOW() + INTERVAL '2 hours', 45, 10, true),
('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Passer l''aspirateur salon', 'Aspirateur complet du salon et des canapés', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'in_progress', 'medium', NOW() + INTERVAL '4 hours', 30, 8, false),
('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'Arroser les plantes', 'Arroser toutes les plantes du jardin', '880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440000', 'completed', 'low', NOW() - INTERVAL '1 day', 20, 5, false),
('aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', 'Réparer robinet salle de bain', 'Le robinet fuit, besoin de changer le joint', '880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440000', 'pending', 'urgent', NOW() + INTERVAL '1 day', 60, 15, true),
-- Villa Dupont tasks
('aa0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Préparer le déjeuner', 'Préparer un déjeuner pour 3 personnes', '880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004', 'pending', 'high', NOW() + INTERVAL '3 hours', 60, 12, false),
('aa0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Tondre la pelouse', 'Première tonte de la saison', '880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004', 'completed', 'medium', NOW() - INTERVAL '2 days', 90, 20, true);

-- Budget categories
INSERT INTO budget_categories (id, household_id, name, color, icon) VALUES
-- Maison Martin budget categories
('bb0e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Alimentation', '#EF4444', 'food'),
('bb0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Ménage', '#3B82F6', 'cleaning'),
('bb0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'Maintenance', '#F97316', 'maintenance'),
('bb0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', 'Loisirs', '#8B5CF6', 'entertainment'),
-- Villa Dupont budget categories
('bb0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Alimentation', '#EF4444', 'food'),
('bb0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Jardinage', '#22C55E', 'gardening');

-- Demo budgets
INSERT INTO budgets (id, household_id, category_id, name, amount, period, start_date, alert_threshold) VALUES
('cc0e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'bb0e8400-e29b-41d4-a716-446655440000', 'Budget Alimentation Mars', 800.00, 'monthly', '2024-03-01', 85.00),
('cc0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'bb0e8400-e29b-41d4-a716-446655440001', 'Budget Ménage Trimestriel', 300.00, 'monthly', '2024-03-01', 90.00),
('cc0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440004', 'Courses Hebdomadaires', 200.00, 'weekly', '2024-03-01', 80.00);

-- Demo expenses
INSERT INTO expenses (id, household_id, category_id, amount, description, vendor, payment_method, recorded_by, expense_date) VALUES
('dd0e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'bb0e8400-e29b-41d4-a716-446655440000', 125.50, 'Courses hebdomadaires - Carrefour', 'Carrefour', 'carte_bancaire', '770e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - 1),
('dd0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'bb0e8400-e29b-41d4-a716-446655440000', 89.30, 'Boulangerie et marché', 'Marché Local', 'especes', '770e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - 2),
('dd0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'bb0e8400-e29b-41d4-a716-446655440001', 45.99, 'Produits ménage - Monoprix', 'Monoprix', 'carte_bancaire', '770e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - 3),
('dd0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440004', 78.25, 'Courses familiales', 'Leclerc', 'carte_bancaire', '770e8400-e29b-41d4-a716-446655440004', CURRENT_DATE);

-- Demo shopping lists
INSERT INTO shopping_lists (id, household_id, name, created_by) VALUES
('ee0e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Courses de la semaine', '770e8400-e29b-41d4-a716-446655440000'),
('ee0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Liste urgente', '770e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Repas de dimanche', '770e8400-e29b-41d4-a716-446655440004');

-- Demo shopping list items
INSERT INTO shopping_list_items (id, list_id, name, quantity, unit, category, estimated_price, is_purchased) VALUES
-- Courses de la semaine (Maison Martin)
('ff0e8400-e29b-41d4-a716-446655440000', 'ee0e8400-e29b-41d4-a716-446655440000', 'Pain complet', 2, 'pieces', 'Boulangerie', 3.50, false),
('ff0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440000', 'Lait demi-écrémé', 2, 'litres', 'Produits laitiers', 2.80, true),
('ff0e8400-e29b-41d4-a716-446655440002', 'ee0e8400-e29b-41d4-a716-446655440000', 'Pommes', 2, 'kg', 'Fruits', 4.60, false),
('ff0e8400-e29b-41d4-a716-446655440003', 'ee0e8400-e29b-41d4-a716-446655440000', 'Poulet fermier', 1.5, 'kg', 'Viandes', 15.90, false),
('ff0e8400-e29b-41d4-a716-446655440004', 'ee0e8400-e29b-41d4-a716-446655440000', 'Riz basmati', 1, 'paquet', 'Épicerie', 3.25, true),
-- Liste urgente (Maison Martin)
('ff0e8400-e29b-41d4-a716-446655440005', 'ee0e8400-e29b-41d4-a716-446655440001', 'Papier toilette', 1, 'paquet', 'Hygiène', 8.50, false),
('ff0e8400-e29b-41d4-a716-446655440006', 'ee0e8400-e29b-41d4-a716-446655440001', 'Liquide vaisselle', 1, 'bouteille', 'Ménage', 3.20, false);

-- Demo recipes
INSERT INTO recipes (id, household_id, name, description, servings, prep_time, cook_time, difficulty, cuisine_type, dietary_tags, ingredients, instructions, is_public, created_by) VALUES
('110e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Ratatouille Provençale', 'Délicieuse ratatouille aux légumes de saison', 4, 20, 45, 'medium', 'Française', '["végétarien", "vegan", "sans gluten"]', 
'[{"name": "Aubergines", "quantity": 2, "unit": "pieces"}, {"name": "Courgettes", "quantity": 3, "unit": "pieces"}, {"name": "Tomates", "quantity": 4, "unit": "pieces"}, {"name": "Poivrons", "quantity": 2, "unit": "pieces"}, {"name": "Oignons", "quantity": 2, "unit": "pieces"}, {"name": "Ail", "quantity": 3, "unit": "gousses"}, {"name": "Huile d''olive", "quantity": 4, "unit": "cuillères à soupe"}, {"name": "Herbes de Provence", "quantity": 1, "unit": "cuillère à café"}]',
'[{"step": 1, "description": "Couper tous les légumes en dés"}, {"step": 2, "description": "Faire revenir les oignons et l''ail"}, {"step": 3, "description": "Ajouter les légumes un par un"}, {"step": 4, "description": "Laisser mijoter 45 minutes"}]', 
true, '770e8400-e29b-41d4-a716-446655440000'),

('110e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Quiche Lorraine', 'Quiche traditionnelle aux lardons et fromage', 6, 15, 35, 'easy', 'Française', '[]',
'[{"name": "Pâte brisée", "quantity": 1, "unit": "rouleau"}, {"name": "Lardons", "quantity": 200, "unit": "g"}, {"name": "Œufs", "quantity": 4, "unit": "pieces"}, {"name": "Crème fraîche", "quantity": 200, "unit": "ml"}, {"name": "Gruyère râpé", "quantity": 100, "unit": "g"}]',
'[{"step": 1, "description": "Préchauffer le four à 200°C"}, {"step": 2, "description": "Étaler la pâte dans un moule"}, {"step": 3, "description": "Faire revenir les lardons"}, {"step": 4, "description": "Mélanger œufs et crème"}, {"step": 5, "description": "Assembler et cuire 35 minutes"}]',
false, '770e8400-e29b-41d4-a716-446655440001');

-- Demo meal plans
INSERT INTO meal_plans (id, household_id, week_start_date, meals, created_by) VALUES
('120e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '2024-03-04', 
'{"monday": {"lunch": "110e8400-e29b-41d4-a716-446655440000", "dinner": "110e8400-e29b-41d4-a716-446655440001"}, "tuesday": {"lunch": "salade", "dinner": "110e8400-e29b-41d4-a716-446655440000"}, "wednesday": {"lunch": "110e8400-e29b-41d4-a716-446655440001", "dinner": "pasta"}}',
'770e8400-e29b-41d4-a716-446655440000');

-- Demo reports
INSERT INTO reports (id, household_id, title, description, category, priority, status, location, reported_by, assigned_to, estimated_cost) VALUES
('130e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Fuite robinet cuisine', 'Le robinet de la cuisine fuit depuis ce matin', 'Plomberie', 'high', 'open', 'Cuisine', '770e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', 50.00),
('130e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Ampoule grillée salon', 'L''ampoule du plafonnier est grillée', 'Électricité', 'low', 'resolved', 'Salon', '770e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 15.00),
('130e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Tondeuse en panne', 'La tondeuse ne démarre plus', 'Jardinage', 'medium', 'in_progress', 'Garage', '770e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440005', 80.00);

-- Demo notifications
INSERT INTO notifications (household_id, recipient_id, type, title, message, data, is_read) VALUES
('660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'task_assigned', 'Nouvelle tâche assignée', 'Une nouvelle tâche "Nettoyer la cuisine" vous a été assignée.', '{"task_id": "aa0e8400-e29b-41d4-a716-446655440000"}', false),
('660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', 'task_assigned', 'Nouvelle tâche assignée', 'Une nouvelle tâche "Passer l''aspirateur salon" vous a été assignée.', '{"task_id": "aa0e8400-e29b-41d4-a716-446655440001"}', true),
('660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'maintenance_due', 'Réparation en attente', 'La réparation du robinet nécessite votre attention.', '{"report_id": "130e8400-e29b-41d4-a716-446655440000"}', false);

-- Initialize member points
INSERT INTO member_points (household_id, member_id, total_points, monthly_points, level, badges, achievements) VALUES
('660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 45, 25, 2, '["first_task", "kitchen_master"]', '{"tasks_completed": 8, "perfect_week": 1}'),
('660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', 78, 35, 3, '["first_task", "garden_expert", "reliable_worker"]', '{"tasks_completed": 15, "perfect_week": 2}'),
('660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440005', 32, 32, 2, '["first_task", "cooking_pro"]', '{"tasks_completed": 6, "perfect_week": 1}'),
('660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440008', 95, 40, 4, '["first_task", "multi_talent", "team_player"]', '{"tasks_completed": 22, "perfect_week": 3}'),
('660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440009', 65, 28, 3, '["first_task", "maintenance_expert"]', '{"tasks_completed": 12, "perfect_week": 2}');

-- Sample audit logs
INSERT INTO audit_logs (household_id, user_id, action, resource_type, resource_id, new_values, ip_address) VALUES
('660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'CREATE', 'task', 'aa0e8400-e29b-41d4-a716-446655440000', '{"title": "Nettoyer la cuisine", "assigned_to": "770e8400-e29b-41d4-a716-446655440002"}', '192.168.1.100'),
('660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'UPDATE', 'task', 'aa0e8400-e29b-41d4-a716-446655440002', '{"status": "completed"}', '192.168.1.101'),
('660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'CREATE', 'member', '770e8400-e29b-41d4-a716-446655440003', '{"name": "Ahmed Hassan", "role": "member"}', '192.168.1.100');