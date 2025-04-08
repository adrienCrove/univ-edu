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
    departement_id SERIAL PRIMARY KEY,
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
    student_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    PRIMARY KEY (cours_id, student_id)
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
    salle_id INT REFERENCES salles(salle_id) ON DELETE SET NULL,
    jour_semaine INT CHECK (jour_semaine BETWEEN 1 AND 7),
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL
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
