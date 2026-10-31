
-- Sample customers
INSERT INTO customers (name, email, company, joined)
VALUES
    ('Ananya Nair', 'ananya@example.com', 'Acme Solutions', '2026-09-01'),
    ('Rahul Menon', 'rahul@example.com', 'Bright Tech', '2026-09-15'),
    ('Meera Thomas', 'meera@example.com', 'Nova Systems', '2026-10-01')
ON CONFLICT (email) DO NOTHING;

-- Sample subscriptions
INSERT INTO subscriptions
    (customer_id, plan, cycle, amount, next_billing, status)
SELECT c.id, v.plan, v.cycle, v.amount, v.next_billing, v.status
FROM (VALUES
    ('ananya@example.com', 'Pro', 'monthly', 999.00::numeric,
     DATE '2026-11-01', 'active'),
    ('rahul@example.com', 'Basic', 'yearly', 4999.00::numeric,
     DATE '2027-09-15', 'active'),
    ('meera@example.com', 'Enterprise', 'monthly', 2999.00::numeric,
     DATE '2026-11-01', 'paused')
) AS v(email, plan, cycle, amount, next_billing, status)
JOIN customers c ON c.email = v.email
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.customer_id = c.id AND s.plan = v.plan
);

-- Sample invoices
INSERT INTO invoices
    (customer_id, issue_date, due_date, amount, status)
SELECT c.id, v.issue_date, v.due_date, v.amount, v.status
FROM (VALUES
    ('ananya@example.com', DATE '2026-10-01',
     DATE '2026-10-10', 999.00::numeric, 'paid'),
    ('rahul@example.com', DATE '2026-10-15',
     DATE '2026-10-30', 4999.00::numeric, 'pending'),
    ('meera@example.com', DATE '2026-10-20',
     DATE '2026-10-31', 2999.00::numeric, 'pending')
) AS v(email, issue_date, due_date, amount, status)
JOIN customers c ON c.email = v.email
WHERE NOT EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.customer_id = c.id
      AND i.issue_date = v.issue_date
      AND i.amount = v.amount
);
