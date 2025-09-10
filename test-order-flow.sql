-- Script de test pour vérifier le flow complet de commande
-- Exécutez ce script après avoir passé une commande pour vérifier la cohérence

-- 1. Vérifier les dernières commandes créées
SELECT 
    o.id as order_id,
    o.user_id,
    o.total,
    o.status,
    o.paypal_order_id,
    o.created_at,
    p.display_name as buyer_name
FROM orders o
JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 5;

-- 2. Vérifier les items de la dernière commande
WITH latest_order AS (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 1
)
SELECT 
    oi.id as item_id,
    oi.order_id,
    oi.item_type,
    oi.qty,
    oi.unit_price,
    oi.status,
    s.name as shop_name,
    sp.display_name as seller_name
FROM order_items oi
JOIN shops s ON oi.shop_id = s.id
JOIN profiles sp ON s.owner_id = sp.id
WHERE oi.order_id = (SELECT id FROM latest_order);

-- 3. Vérifier les escrows créés
WITH latest_order AS (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 1
)
SELECT 
    e.id as escrow_id,
    e.order_id,
    e.gross_amount,
    e.commission_platform,
    e.commission_ambassador,
    e.net_amount,
    e.status,
    e.auto_release_at,
    bp.display_name as buyer_name,
    sp.display_name as seller_name
FROM escrows e
JOIN profiles bp ON e.buyer_id = bp.id
JOIN profiles sp ON e.seller_id = sp.id
WHERE e.order_id = (SELECT id FROM latest_order);

-- 4. Vérifier les notifications créées
WITH latest_order AS (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 1
)
SELECT 
    n.id as notification_id,
    n.user_id,
    n.category,
    n.event_name,
    n.title,
    n.body,
    n.created_at,
    p.display_name as recipient_name
FROM notifications n
JOIN profiles p ON n.user_id = p.id
WHERE n.payload->>'order_id' = (SELECT id::text FROM latest_order)
ORDER BY n.created_at DESC;

-- 5. Vérifier les payouts créés
WITH latest_order AS (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 1
)
SELECT 
    py.id as payout_id,
    py.order_id,
    py.gross_amount,
    py.commission_platform,
    py.commission_ambassador,
    py.net_amount,
    py.status,
    s.name as shop_name,
    sp.display_name as seller_name
FROM payouts py
JOIN shops s ON py.shop_id = s.id
JOIN profiles sp ON s.owner_id = sp.id
WHERE py.order_id = (SELECT id FROM latest_order);

-- 6. Vérification de cohérence des montants
WITH latest_order AS (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 1
),
order_totals AS (
    SELECT 
        o.total as order_total,
        COALESCE(SUM(oi.unit_price * oi.qty), 0) as items_total,
        COALESCE(SUM(e.gross_amount), 0) as escrow_total,
        COALESCE(SUM(py.gross_amount), 0) as payout_total
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN escrows e ON o.id = e.order_id
    LEFT JOIN payouts py ON o.id = py.order_id
    WHERE o.id = (SELECT id FROM latest_order)
    GROUP BY o.total
)
SELECT 
    order_total,
    items_total,
    escrow_total,
    payout_total,
    CASE 
        WHEN order_total = items_total 
         AND items_total = escrow_total 
         AND escrow_total = payout_total 
        THEN '✅ COHÉRENT'
        ELSE '❌ INCOHÉRENT'
    END as coherence_check
FROM order_totals;

-- 7. Vérifier les contraintes d'escrow
SELECT 
    e.id,
    e.gross_amount,
    e.commission_platform,
    e.commission_ambassador,
    e.net_amount,
    (e.commission_platform + e.commission_ambassador + e.net_amount) as calculated_total,
    CASE 
        WHEN ABS(e.gross_amount - (e.commission_platform + e.commission_ambassador + e.net_amount)) < 0.01
        THEN '✅ MONTANTS COHÉRENTS'
        ELSE '❌ MONTANTS INCOHÉRENTS'
    END as amount_check
FROM escrows e
WHERE e.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY e.created_at DESC;

-- 8. Statistiques rapides
SELECT 
    'Commandes dernière heure' as metric,
    COUNT(*) as count
FROM orders 
WHERE created_at >= NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
    'Escrows en attente' as metric,
    COUNT(*) as count
FROM escrows 
WHERE status = 'held'

UNION ALL

SELECT 
    'Notifications non lues' as metric,
    COUNT(*) as count
FROM notifications 
WHERE read_at IS NULL 
AND created_at >= NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
    'Payouts en attente' as metric,
    COUNT(*) as count
FROM payouts 
WHERE status = 'en_attente';

-- 9. Test des fonctions créées
SELECT 
    'Test fonction calculate_commission_amounts' as test_name,
    *
FROM calculate_commission_amounts(100.0, 0.05, 0.02);

SELECT 
    'Test fonction generate_referral_code' as test_name,
    generate_referral_code('Test User') as generated_code;

-- 10. Vérification des triggers updated_at
SELECT 
    schemaname,
    tablename,
    triggername
FROM pg_triggers 
WHERE schemaname = 'public' 
AND triggername LIKE '%updated_at%'
ORDER BY tablename;

COMMENT ON SCRIPT IS 'Script de test pour vérifier le flow complet de commande après les corrections';
