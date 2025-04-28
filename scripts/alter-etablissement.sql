-- Ajouter la colonne code à la table etablissement
ALTER TABLE etablissement
ADD COLUMN code VARCHAR(50);

-- Créer un index sur la colonne code
CREATE INDEX idx_etablissement_code ON etablissement(code);

-- Ajouter une contrainte d'unicité sur code + university_id
ALTER TABLE etablissement
ADD CONSTRAINT uq_etablissement_code UNIQUE(university_id, code);

-- Commentaire pour expliquer la contrainte
COMMENT ON CONSTRAINT uq_etablissement_code ON etablissement IS 'Assure que le code de l''établissement est unique au sein d''une même université'; 