-- Waddle mobile: profile photos. Public bucket `avatars`; a learner reads and writes only avatars/<their id>/.
-- The app uploads a 256px JPEG (about 20 KB) to avatars/<user id>/avatar.jpg (src/lib/account.ts saveAvatar).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 262144, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Uploads with upsert need select, insert and update; removing a photo needs delete. All limited to the
-- user's own folder (the first path segment is their id).
drop policy if exists "avatars: read own" on storage.objects;
create policy "avatars: read own" on storage.objects
  for select to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars: insert own" on storage.objects;
create policy "avatars: insert own" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars: update own" on storage.objects;
create policy "avatars: update own" on storage.objects
  for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars: delete own" on storage.objects;
create policy "avatars: delete own" on storage.objects
  for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
