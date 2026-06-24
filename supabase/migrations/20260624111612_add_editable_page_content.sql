create table if not exists public.site_page_content (
  page_key text primary key check (page_key in ('home', 'about')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_site_page_content_updated_at on public.site_page_content;
create trigger set_site_page_content_updated_at
before update on public.site_page_content
for each row execute function public.set_updated_at();

alter table public.site_page_content enable row level security;

grant select on public.site_page_content to anon, authenticated;
grant insert, update on public.site_page_content to authenticated;

drop policy if exists "Public can read page content" on public.site_page_content;
create policy "Public can read page content"
on public.site_page_content for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can insert page content" on public.site_page_content;
create policy "Authenticated can insert page content"
on public.site_page_content for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update page content" on public.site_page_content;
create policy "Authenticated can update page content"
on public.site_page_content for update
to authenticated
using (true)
with check (true);

insert into public.site_page_content (page_key, title, body)
values
  (
    'home',
    'Warme taal voor moeilijke momenten',
    'Verhalen, handvatten en zachte oefeningen voor kinderen, zorgfiguren, leerkrachten en zorgverleners wanneer ziekte, afscheid of rouw dichtbij komt.'
  ),
  (
    'about',
    'Ruimte maken voor wat moeilijk te zeggen is',
    'Met Mee in het verhaal wil Jorane kinderen en de mensen rondom hen helpen om taal, rust en houvast te vinden wanneer ziekte, afscheid of rouw dichtbij komt.'
    || chr(10) || chr(10) ||
    'Moeilijke gebeurtenissen komen vaak met grote vragen. Wat zeg je tegen een kind? Hoe blijf je eerlijk zonder te overspoelen? En hoe geef je ruimte aan verdriet, verwarring of stilte?'
    || chr(10) || chr(10) ||
    'Deze plek verzamelt zachte woorden, concrete handvatten en kleine oefeningen voor zorgfiguren, leerkrachten en zorgverleners die kinderen nabij willen blijven op kwetsbare momenten.'
  )
on conflict (page_key) do nothing;
