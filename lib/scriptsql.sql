-- SCRIPT SQL POUR SAAS UNIVERSITAIRE (PostgreSQL)

-- Table des utilisateurs
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    studentid VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    filiere_id INT CONSTRAINT fk_utilisateur_filiere  FOREIGN KEY (filiere_id) REFERENCES filiere(id) ON DELETE SET NULL,
    departement_id INT CONSTRAINT fk_utilisateur_departement  FOREIGN KEY (departement_id) REFERENCES departements(departement_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expiration TIMESTAMP

);

-- Table des rôles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    nom VARCHAR(50) UNIQUE NOT NULL
);

-- Table de jonction utilisateurs-rôles
CREATE TABLE utilisateurs_roles (
    student_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    date_attribution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, role_id)
);

-- Table des départements
CREATE TABLE departements (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT
);

-- Table des semestres
CREATE TABLE semestres (
    semestre_id SERIAL PRIMARY KEY,
    annee_academique VARCHAR(20) NOT NULL,
    session VARCHAR(20) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    UNIQUE(annee_academique, session)
);

-- Table des cours
CREATE TABLE cours (
    cours_id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    credits INT NOT NULL,
    semestre_id INT REFERENCES semestres(semestre_id) ON DELETE SET NULL,
    departement_id INT REFERENCES departements(departement_id) ON DELETE SET NULL
);

-- Table d'association cours-professeurs
CREATE TABLE cours_professeurs (
    cours_id INT REFERENCES cours(cours_id) ON DELETE CASCADE,
    professeur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_attribution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cours_id, professeur_id)
);

-- Table des inscriptions aux cours
CREATE TABLE inscriptions (
    inscription_id SERIAL PRIMARY KEY,
    etudiant_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    cours_id INT REFERENCES cours(cours_id) ON DELETE CASCADE,
    date_inscription DATE DEFAULT CURRENT_DATE,
    statut VARCHAR(20) DEFAULT 'Active',
    motif_annulation VARCHAR(255),
    UNIQUE (etudiant_id, cours_id)
);

-- Table des évaluations
CREATE TABLE evaluations (
    evaluation_id SERIAL PRIMARY KEY,
    cours_id INT REFERENCES cours(cours_id) ON DELETE CASCADE,
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    poids DECIMAL(5,2)
);

-- Table des notes
CREATE TABLE notes (
    etudiant_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    evaluation_id INT REFERENCES evaluations(evaluation_id) ON DELETE CASCADE,
    note DECIMAL(5,2) NOT NULL,
    mention VARCHAR(20),
    PRIMARY KEY (etudiant_id, evaluation_id)
);

-- Table des salles
CREATE TABLE salles (
    salle_id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    capacite INT,
    localisation VARCHAR(100)
);

-- Table des emplois du temps
CREATE TABLE emplois_du_temps (
    seance_id SERIAL PRIMARY KEY,
    cours_id INT REFERENCES cours(cours_id) ON DELETE CASCADE,
    professeur_id INT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    salle_id INT REFERENCES salles(salle_id) ON DELETE SET NULL,
    jour_semaine INT CHECK (jour_semaine BETWEEN 1 AND 7),
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    CONSTRAINT fk_edt_cours
        FOREIGN KEY (cours_id) REFERENCES cours(id) 
        ON DELETE CASCADE,      -- Si un cours est supprimé, on supprime ses entrées d'emploi du temps
    CONSTRAINT fk_edt_prof
        FOREIGN KEY (professeur_id) REFERENCES utilisateur(id) 
        ON DELETE RESTRICT,    -- On empêche la suppression d'un professeur s'il a des cours programmés (il faudrait d'abord réassigner ou supprimer ces séances)
    CONSTRAINT chk_heure 
        CHECK (heure_debut < heure_fin),    -- Contrainte : l'heure de début doit précéder l'heure de fin
    CONSTRAINT chk_jour 
        CHECK (jour_semaine BETWEEN 1 AND 7) -- Contrainte : le jour de la semaine doit être compris entre 1 et 7
);

-- Table de messagerie interne
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    expediteur_id INT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    destinataire_id INT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    sujet VARCHAR(100),
    contenu TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lu BOOLEAN DEFAULT FALSE
);

-- Table des factures
CREATE TABLE factures (
    invoice_id SERIAL PRIMARY KEY,
    etudiant_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    semestre_id INT REFERENCES semestres(semestre_id) ON DELETE SET NULL,
    montant DECIMAL(10,2) NOT NULL,
    description VARCHAR(100),
    statut VARCHAR(20) DEFAULT 'Impayé',
    date_emission DATE DEFAULT CURRENT_DATE,
    date_echeance DATE
);

-- Table des paiements
CREATE TABLE paiements (
    paiement_id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES factures(invoice_id) ON DELETE CASCADE,
    date_paiement DATE DEFAULT CURRENT_DATE,
    montant DECIMAL(10,2) NOT NULL,
    methode_paiement VARCHAR(50)
);

CREATE TABLE annonces (
    id SERIAL PRIMARY KEY,
    university_id INT REFERENCES university(id) ON DELETE SET NULL,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    titre VARCHAR(200) NOT NULL,
    contenu TEXT NOT NULL,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'active',
    etablissement_id INT REFERENCES etablissement(id) ON DELETE SET NULL,
    filiere_id INT REFERENCES filiere(id) ON DELETE SET NULL
);


CREATE TABLE logs (    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,       -- Description courte de l’action (ex: 'connexion', 'modification_cours')
    description TEXT,                     -- Détails complémentaires sur l’action réalisée
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);


CREATE TABLE university (
    id          SERIAL PRIMARY KEY,            -- Clé primaire (générée automatiquement)
    nom         VARCHAR(100) NOT NULL,         -- Nom de l'université
    description TEXT,
    adresse     VARCHAR(255),
    contact     VARCHAR(100),
    email       VARCHAR(100),
    telephone   VARCHAR(20),
    site_web    VARCHAR(100),
    is_active   BOOLEAN DEFAULT TRUE,
    is_default  BOOLEAN DEFAULT FALSE,
    image       VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE etablissement (
    id            SERIAL PRIMARY KEY,
    nom           VARCHAR(100) NOT NULL, 
    university_id INT REFERENCES university(id) ON DELETE SET NULL,
    adresse       VARCHAR(255),
    contact       VARCHAR(100),
    image         VARCHAR(255),
    email         VARCHAR(100),
    telephone     VARCHAR(20),
    site_web      VARCHAR(100),
    CONSTRAINT fk_etablissement_universite
        FOREIGN KEY (university_id) REFERENCES university(id) 
        ON DELETE CASCADE                 
);

CREATE TABLE filiere (
    id               SERIAL PRIMARY KEY,
    nom              VARCHAR(100) NOT NULL, 
    etablissement_id INT NOT NULL,             -- Référence à l'établissement parent
    code             VARCHAR(50),             -- Code unique de la filière (optionnel, par ex. code interne)
    CONSTRAINT fk_filiere_etablissement
        FOREIGN KEY (etablissement_id) REFERENCES etablissement(id) 
        ON DELETE CASCADE,                -- Si un établissement est supprimé, on supprime aussi ses filières
    CONSTRAINT uq_filiere_code 
        UNIQUE(etablissement_id, code)    -- Un code de filière est unique au sein d'un même établissement (si utilisé)
);

CREATE TABLE filiere (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    etablissement_id INT NOT NULL,
    FOREIGN KEY (etablissement_id) REFERENCES etablissements(id) ON DELETE CASCADE
);



-- ====================================================================================
-- Suggestions d'index additionnels pour améliorer les performances des requêtes fréquentes:
-- ====================================================================================
-- (Certains index sont déjà créés implicitement via les clés primaires et uniques ci-dessus)
CREATE INDEX idx_utilisateur_filiere   ON utilisateur(filiere_id);       -- Pour rechercher rapidement tous les utilisateurs d'une filière (ex: lister les étudiants d'une filière)
CREATE INDEX idx_utilisateur_role_role ON utilisateur_role(role_id);     -- Pour lister tous les utilisateurs ayant un certain rôle
CREATE INDEX idx_cours_filiere         ON cours(filiere_id);             -- Pour lister les cours d'une filière (déjà partiellement couvert par uq_cours_code_filiere qui inclut filiere_id)
CREATE INDEX idx_cours_prof_prof       ON cours_professeur(professeur_id); -- Pour lister tous les cours enseignés par un professeur
CREATE INDEX idx_inscription_etudiant  ON inscription(etudiant_id);      -- Pour lister les cours d'un étudiant donné
CREATE INDEX idx_edt_prof_jour         ON emploi_du_temps(professeur_id, jour_semaine); -- Pour rechercher l'emploi du temps d'un prof, éventuellement filtrer par jour
CREATE INDEX idx_note_etudiant         ON note(etudiant_id);             -- Pour récupérer rapidement toutes les notes d'un étudiant (ex: historique de notes)
CREATE INDEX idx_message_destinataire  ON message(destinataire_id, date_envoi); -- Pour lister les messages reçus par un utilisateur, triés par date
CREATE INDEX idx_facture_utilisateur   ON facture(utilisateur_id);       -- Pour lister les factures d'un utilisateur donné
CREATE INDEX idx_paiement_facture      ON paiement(facture_id);          -- Pour trouver rapidement les paiements liés à une facture
CREATE INDEX idx_ticket_utilisateur    ON ticket_support(utilisateur_id, statut); -- Pour lister les tickets d'un utilisateur, éventuellement filtrés par statut
CREATE INDEX idx_ticket_statut         ON ticket_support(statut);        -- Pour filtrer rapidement les tickets par statut (ex: tous les tickets "ouverts")
CREATE INDEX idx_ticket_assigne        ON ticket_support(assigne_a);     -- Pour lister les tickets assignés à un agent support
CREATE INDEX idx_ticket_msg_ticket     ON ticket_message(ticket_id, date_message); -- Pour récupérer les messages d'un ticket dans l'ordre chronologique
CREATE INDEX idx_annonce_cible_etab    ON annonce(etablissement_id) WHERE etablissement_id IS NOT NULL;  -- Index partiel pour les annonces ciblant un établissement
CREATE INDEX idx_annonce_cible_filiere ON annonce(filiere_id) WHERE filiere_id IS NOT NULL;              -- Index partiel pour les annonces ciblant une filière
CREATE INDEX idx_log_user              ON journal_activite(utilisateur_id);
CREATE INDEX idx_log_date              ON journal_activite(date_action);