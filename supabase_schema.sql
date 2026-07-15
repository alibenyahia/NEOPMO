-- ==========================================================================
-- NEOPMO - Schéma Supabase pour le stockage partagé des données
-- ==========================================================================
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query > Run
-- ==========================================================================

-- Table unique contenant tout l'état de l'application (projets, formations,
-- tickets, facturation...) sous forme de JSON. C'est la migration la plus
-- simple depuis le localStorage actuel : une seule ligne partagée par tous
-- les utilisateurs de l'URL.
create table if not exists workspace_state (
    id text primary key,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

-- Active la Row Level Security (obligatoire sur Supabase pour les tables
-- accessibles publiquement via la clé "anon").
alter table workspace_state enable row level security;

-- Politique ouverte : tout utilisateur muni de la clé publique (anon key)
-- peut lire et écrire. Cela correspond à un accès "toute personne avec
-- l'URL peut consulter et modifier les données" (voir mise en garde dans
-- le README concernant l'absence d'authentification).
create policy "Autoriser lecture publique"
    on workspace_state for select
    using (true);

create policy "Autoriser écriture publique"
    on workspace_state for insert
    with check (true);

create policy "Autoriser mise à jour publique"
    on workspace_state for update
    using (true);

-- Ligne initiale vide : l'application la remplira automatiquement au
-- premier chargement si elle n'existe pas encore, mais on peut aussi la
-- créer manuellement ici pour éviter tout état intermédiaire.
insert into workspace_state (id, data)
values ('main', '{"projects": [], "currentWeek": "", "trainings": [], "tickets": [], "ticketsLastImport": null}'::jsonb)
on conflict (id) do nothing;
