-- Stop users writing their own billing state.
--
-- CONFIRMED EXPLOITABLE before this migration. The live database had:
--   * one permissive policy on profiles: FOR ALL USING (auth.uid() = id),
--     with no WITH CHECK, so a user may write any column of their own row; and
--   * table-wide INSERT/UPDATE for roles `authenticated` and `anon`, including
--     is_premium, premium_plan, premium_until, stripe_customer_id and
--     stripe_subscription_id.
--
-- Postgres RLS grants access to a ROW; it cannot restrict WHICH COLUMNS an
-- UPDATE touches. So any signed-in user could run
--
--     update profiles set is_premium = true where id = auth.uid();
--
-- and be served as a paying customer, because js/home.js reads is_premium
-- straight off the row. Writing stripe_customer_id was the same hole with a
-- worse payload: repointing it at another customer's cus_... would have opened
-- that person's billing portal. (create-portal-session now independently
-- verifies customer ownership against Stripe metadata, so that path is closed
-- from both ends.)
--
-- The column list below is NOT guessed: it is exactly the set of columns the
-- two browser roles already held, minus the five server-owned billing columns.
-- Nothing the app legitimately writes is removed, so no client code changes.
--
-- SELECT is deliberately left table-wide. The client must read is_premium to
-- render the UI. Reading it was never the problem; writing it was.

begin;

revoke insert, update on public.profiles from authenticated;
revoke insert, update on public.profiles from anon;

grant update (
  id, name, gender, age, height_cm, units, current_weight_kg, timezone,
  protein_goal, weight_goal, water_goal, calorie_goal,
  notif_workout, notif_protein, notif_water,
  notif_workout_time, notif_protein_time,
  onboarding_done, auto_rest, default_rest_seconds,
  muscle_grow, muscle_define, muscle_exclude,
  onb_v2_done, onb_motivations, onb_main_goal, onb_experience,
  onb_prior_tracking, onb_train_style, onb_follow_plan,
  onb_logging_style, onb_weekly_days,
  freezes_used_month, freezes_used_dates,
  created_at, updated_at
) on public.profiles to authenticated, anon;

-- js/ai.js upserts profiles on conflict (id), which needs INSERT on the
-- columns it supplies plus the key itself.
grant insert (
  id, name, gender, age, height_cm, units, current_weight_kg, timezone,
  protein_goal, weight_goal, water_goal, calorie_goal,
  notif_workout, notif_protein, notif_water,
  notif_workout_time, notif_protein_time,
  onboarding_done, auto_rest, default_rest_seconds,
  muscle_grow, muscle_define, muscle_exclude,
  onb_v2_done, onb_motivations, onb_main_goal, onb_experience,
  onb_prior_tracking, onb_train_style, onb_follow_plan,
  onb_logging_style, onb_weekly_days,
  freezes_used_month, freezes_used_dates,
  created_at, updated_at
) on public.profiles to authenticated, anon;

commit;
