-- Generated from the live database 2026-10-28. DOCUMENTATION, NOT A MIGRATION.
-- This file is outside supabase/migrations/ on purpose: db push must not apply it.
-- Regenerate with queries/dump-policies.sql and commit the diff alongside any
-- policy change.
--
-- Every table below has RLS enabled. Read this together with grants.md: a policy
-- controls WHICH ROWS a role may touch, a grant controls WHICH COLUMNS. Postgres
-- cannot express a column restriction in a policy, which is exactly how the
-- is_premium self-grant was possible before 20261028133548.

create policy au_select_own on public.ai_usage for select using ((auth.uid() = user_id));

create policy "own rows delete" on public.body_measurements for delete using ((auth.uid() = user_id));
create policy "own rows insert" on public.body_measurements for insert with check ((auth.uid() = user_id));
create policy "own rows select" on public.body_measurements for select using ((auth.uid() = user_id));
create policy "own rows update" on public.body_measurements for update using ((auth.uid() = user_id));

create policy "own rows delete" on public.cardio_sessions for delete using ((auth.uid() = user_id));
create policy "own rows insert" on public.cardio_sessions for insert with check ((auth.uid() = user_id));
create policy "own rows select" on public.cardio_sessions for select using ((auth.uid() = user_id));
create policy "own rows update" on public.cardio_sessions for update using ((auth.uid() = user_id));

create policy "Users can delete own custom achievements" on public.custom_achievements for delete using ((auth.uid() = user_id));
create policy "Users can insert own custom achievements" on public.custom_achievements for insert with check ((auth.uid() = user_id));
create policy "Users can read own custom achievements" on public.custom_achievements for select using ((auth.uid() = user_id));
create policy "Users can update own custom achievements" on public.custom_achievements for update using ((auth.uid() = user_id));

create policy "Users can delete own custom exercises" on public.custom_exercises for delete using ((auth.uid() = user_id));
create policy "Users can insert own custom exercises" on public.custom_exercises for insert with check ((auth.uid() = user_id));
create policy "Users can read own custom exercises" on public.custom_exercises for select using ((auth.uid() = user_id));
create policy "Users can update own custom exercises" on public.custom_exercises for update using ((auth.uid() = user_id));

create policy "own rows delete" on public.daily_checkins for delete using ((auth.uid() = user_id));
create policy "own rows insert" on public.daily_checkins for insert with check ((auth.uid() = user_id));
create policy "own rows select" on public.daily_checkins for select using ((auth.uid() = user_id));
create policy "own rows update" on public.daily_checkins for update using ((auth.uid() = user_id));

create policy "own exercises" on public.exercises for all using ((auth.uid() = user_id));

-- NOTE: feedback accepts an insert from anyone, including anon. That is the
-- feedback form working as intended, but it is the one unauthenticated write
-- path in the schema and it has no rate limit. Worth a cap if it is ever abused.
create policy "Anyone can insert feedback" on public.feedback for insert with check (true);
create policy "Users see own feedback" on public.feedback for select using ((auth.uid() = user_id));

create policy "own meals" on public.meals for all using ((auth.uid() = user_id));

-- Select only. push-cron writes this table through the service role, which
-- bypasses RLS, so no insert policy is needed and none should be added.
create policy own_select on public.notif_log for select using ((auth.uid() = user_id));

create policy "Users manage own PRs" on public.personal_records for all using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

-- Column scope for this table comes from grants, not from here. See
-- migrations/20261028133548_profiles_column_grants.sql.
create policy "own profile" on public.profiles for all using ((auth.uid() = id));

create policy "own rows delete" on public.progress_photos for delete using ((auth.uid() = user_id));
create policy "own rows insert" on public.progress_photos for insert with check ((auth.uid() = user_id));
create policy "own rows select" on public.progress_photos for select using ((auth.uid() = user_id));
create policy "own rows update" on public.progress_photos for update using ((auth.uid() = user_id));

create policy own_delete on public.push_subscriptions for delete using ((auth.uid() = user_id));
create policy own_insert on public.push_subscriptions for insert with check ((auth.uid() = user_id));
create policy own_select on public.push_subscriptions for select using ((auth.uid() = user_id));
create policy own_update on public.push_subscriptions for update using ((auth.uid() = user_id));

create policy sp_delete_own on public.scheduled_pushes for delete using ((auth.uid() = user_id));
create policy sp_insert_own on public.scheduled_pushes for insert with check ((auth.uid() = user_id));
create policy sp_select_own on public.scheduled_pushes for select using ((auth.uid() = user_id));

create policy "own sets" on public.sets for all using ((auth.uid() = user_id));
create policy "own sleep" on public.sleep_logs for all using ((auth.uid() = user_id));

create policy "Users can read own prefs" on public.user_prefs for select using ((auth.uid() = user_id));
create policy "Users can update own prefs" on public.user_prefs for update using ((auth.uid() = user_id));
create policy "Users can upsert own prefs" on public.user_prefs for insert with check ((auth.uid() = user_id));

create policy "own water" on public.water_logs for all using ((auth.uid() = user_id));
create policy "own weight" on public.weight_logs for all using ((auth.uid() = user_id));

create policy "own rows delete" on public.workout_templates for delete using ((auth.uid() = user_id));
create policy "own rows insert" on public.workout_templates for insert with check ((auth.uid() = user_id));
create policy "own rows select" on public.workout_templates for select using ((auth.uid() = user_id));
create policy "own rows update" on public.workout_templates for update using ((auth.uid() = user_id));

create policy "own workouts" on public.workouts for all using ((auth.uid() = user_id));

-- A FOR ALL policy with USING and no WITH CHECK is not a gap: Postgres reuses the
-- USING expression as the check for rows being added or modified, so a user can
-- neither insert a row owned by someone else nor reassign user_id away. Verified
-- during the 2026-10-28 audit.
