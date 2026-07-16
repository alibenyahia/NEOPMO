-- ==========================================================================
-- NEOPMO - Restreindre l'accès aux données aux utilisateurs authentifiés
-- ==========================================================================
-- À exécuter APRÈS supabase_schema.sql, dans : SQL Editor > New query > Run
--
-- Remplace les politiques "publiques" (accessibles à quiconque possède la
-- clé anon) par des politiques qui exigent une connexion (login) réussie.
-- Combiné à l'écran de connexion ajouté dans l'application, personne ne
-- peut plus lire ni écrire les données sans se connecter au préalable.
-- ==========================================================================

drop policy if exists "Autoriser lecture publique" on workspace_state;
drop policy if exists "Autoriser écriture publique" on workspace_state;
drop policy if exists "Autoriser mise à jour publique" on workspace_state;

create policy "Lecture réservée aux utilisateurs connectés"
    on workspace_state for select
    using (auth.role() = 'authenticated');

create policy "Écriture réservée aux utilisateurs connectés"
    on workspace_state for insert
    with check (auth.role() = 'authenticated');

create policy "Mise à jour réservée aux utilisateurs connectés"
    on workspace_state for update
    using (auth.role() = 'authenticated');
