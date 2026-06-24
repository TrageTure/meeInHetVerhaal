alter table public.blog_audiences
add column if not exists accent_color text not null default '#c3d8cb';

update public.blog_audiences
set accent_color = case slug
  when 'voor-zorgfiguren' then '#e4ce55'
  when 'voor-leerkrachten' then '#adafd5'
  when 'voor-zorgverleners' then '#f28a63'
  else accent_color
end;

create table if not exists public.blog_post_audiences (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  audience_id uuid not null references public.blog_audiences(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (post_id, audience_id)
);

create index if not exists blog_post_audiences_audience_id_idx
on public.blog_post_audiences(audience_id);

alter table public.blog_post_audiences enable row level security;

grant select on public.blog_post_audiences to anon, authenticated;
grant insert, update, delete on public.blog_post_audiences to authenticated;

drop policy if exists "Public can read published post audiences" on public.blog_post_audiences;
create policy "Public can read published post audiences"
on public.blog_post_audiences for select
to anon, authenticated
using (
  exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_post_audiences.post_id
      and blog_posts.status = 'published'
  )
);

drop policy if exists "Authenticated can manage post audiences" on public.blog_post_audiences;
create policy "Authenticated can manage post audiences"
on public.blog_post_audiences for all
to authenticated
using (true)
with check (true);

insert into public.blog_post_audiences (post_id, audience_id, sort_order)
select id, audience_id, 1
from public.blog_posts
on conflict (post_id, audience_id) do nothing;
