-- ============================================================
-- Run AFTER creating two public storage buckets in the Supabase
-- dashboard (Storage → New bucket): "avatars" and "stories".
-- Both should be marked Public (read access) so getPublicUrl()
-- works; write access is restricted to the owner by these policies.
-- ============================================================

create policy "avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users can upload to their own avatar folder"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can update their own avatar files"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "story images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'stories');

create policy "users can upload to their own stories folder"
  on storage.objects for insert
  with check (bucket_id = 'stories' and (storage.foldername(name))[1] = auth.uid()::text);
