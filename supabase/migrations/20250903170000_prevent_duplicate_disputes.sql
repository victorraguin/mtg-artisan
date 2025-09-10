-- Empêcher les litiges multiples pour le même escrow

-- Supprimer les litiges en double (garder le plus récent pour chaque escrow)
DELETE FROM disputes 
WHERE id NOT IN (
  SELECT DISTINCT ON (escrow_id) id 
  FROM disputes 
  ORDER BY escrow_id, created_at DESC
);

-- Ajouter un index unique partiel pour empêcher les doublons futurs
CREATE UNIQUE INDEX unique_open_dispute_per_escrow 
ON disputes (escrow_id) 
WHERE status = 'open';
