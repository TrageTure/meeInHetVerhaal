create extension if not exists pgcrypto;

create table if not exists public.blog_audiences (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_path text not null,
  image_path text not null,
  foreground_image_path text,
  foreground_class text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  audience_id uuid not null references public.blog_audiences(id) on delete restrict,
  slug text not null unique,
  title text not null,
  intro text not null,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_filter_groups (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_filter_options (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.blog_filter_groups(id) on delete cascade,
  slug text not null,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, slug)
);

create table if not exists public.blog_post_filter_options (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  filter_option_id uuid not null references public.blog_filter_options(id) on delete cascade,
  primary key (post_id, filter_option_id)
);

create index if not exists blog_posts_audience_id_idx on public.blog_posts(audience_id);
create index if not exists blog_posts_status_published_at_idx on public.blog_posts(status, published_at desc);
create index if not exists blog_filter_options_group_id_idx on public.blog_filter_options(group_id);
create index if not exists blog_post_filter_options_option_idx on public.blog_post_filter_options(filter_option_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_blog_audiences_updated_at on public.blog_audiences;
create trigger set_blog_audiences_updated_at
before update on public.blog_audiences
for each row execute function public.set_updated_at();

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists set_blog_filter_groups_updated_at on public.blog_filter_groups;
create trigger set_blog_filter_groups_updated_at
before update on public.blog_filter_groups
for each row execute function public.set_updated_at();

drop trigger if exists set_blog_filter_options_updated_at on public.blog_filter_options;
create trigger set_blog_filter_options_updated_at
before update on public.blog_filter_options
for each row execute function public.set_updated_at();

alter table public.blog_audiences enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_filter_groups enable row level security;
alter table public.blog_filter_options enable row level security;
alter table public.blog_post_filter_options enable row level security;

grant select on public.blog_audiences to anon, authenticated;
grant select on public.blog_posts to anon, authenticated;
grant select on public.blog_filter_groups to anon, authenticated;
grant select on public.blog_filter_options to anon, authenticated;
grant select on public.blog_post_filter_options to anon, authenticated;

grant insert, update, delete on public.blog_audiences to authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant insert, update, delete on public.blog_filter_groups to authenticated;
grant insert, update, delete on public.blog_filter_options to authenticated;
grant insert, update, delete on public.blog_post_filter_options to authenticated;

drop policy if exists "Public can read audiences" on public.blog_audiences;
create policy "Public can read audiences"
on public.blog_audiences for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can manage audiences" on public.blog_audiences;
create policy "Authenticated can manage audiences"
on public.blog_audiences for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read published posts" on public.blog_posts;
create policy "Public can read published posts"
on public.blog_posts for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Authenticated can manage posts" on public.blog_posts;
create policy "Authenticated can manage posts"
on public.blog_posts for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read filter groups" on public.blog_filter_groups;
create policy "Public can read filter groups"
on public.blog_filter_groups for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can manage filter groups" on public.blog_filter_groups;
create policy "Authenticated can manage filter groups"
on public.blog_filter_groups for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read filter options" on public.blog_filter_options;
create policy "Public can read filter options"
on public.blog_filter_options for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can manage filter options" on public.blog_filter_options;
create policy "Authenticated can manage filter options"
on public.blog_filter_options for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read published post filter links" on public.blog_post_filter_options;
create policy "Public can read published post filter links"
on public.blog_post_filter_options for select
to anon, authenticated
using (
  exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_post_filter_options.post_id
      and blog_posts.status = 'published'
  )
);

drop policy if exists "Authenticated can manage post filter links" on public.blog_post_filter_options;
create policy "Authenticated can manage post filter links"
on public.blog_post_filter_options for all
to authenticated
using (true)
with check (true);

insert into public.blog_audiences (slug, name, category_path, image_path, foreground_image_path, foreground_class, sort_order)
values
  ('voor-zorgfiguren', 'Voor zorgfiguren', '/blog/voor-zorgfiguren/', '/assets/blog-voor-zorgfiguren.png', '/assets/zorgfiguren.png', 'foreground-zorgfiguren', 1),
  ('voor-leerkrachten', 'Voor leerkrachten', '/blog/voor-leerkrachten/', '/assets/blog-voor-leerkrachten.png', '/assets/leerkrachten.png', 'foreground-leerkrachten', 2),
  ('voor-zorgverleners', 'Voor zorgverleners', '/blog/voor-zorgverleners/', '/assets/blog-voor-zorgverleners.png', '/assets/zorgverleners.png', 'foreground-zorgverleners', 3)
on conflict (slug) do update set
  name = excluded.name,
  category_path = excluded.category_path,
  image_path = excluded.image_path,
  foreground_image_path = excluded.foreground_image_path,
  foreground_class = excluded.foreground_class,
  sort_order = excluded.sort_order;

insert into public.blog_filter_groups (key, label, sort_order)
values
  ('age', 'Leeftijd', 1),
  ('theme', 'Thema', 2),
  ('goal', 'Doel', 3),
  ('format', 'Werkvorm', 4)
on conflict (key) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

insert into public.blog_filter_options (group_id, slug, label, sort_order)
select groups.id, seed.slug, seed.label, seed.sort_order
from (
  values
    ('age', '0-2-jaar', '0-2 jaar', 1),
    ('age', '3-5-jaar', '3-5 jaar', 2),
    ('age', '6-9-jaar', '6-9 jaar', 3),
    ('age', '9-12-jaar', '9-12 jaar', 4),
    ('theme', 'ernstig-ziek', 'ernstig ziek', 1),
    ('theme', 'ongeneeslijk-ziek', 'ongeneeslijk ziek', 2),
    ('theme', 'afscheid-en-rouw', 'afscheid en rouw', 3),
    ('goal', 'samen-begrijpen', 'samen begrijpen', 1),
    ('goal', 'samen-voelen', 'samen voelen', 2),
    ('goal', 'samen-doen', 'samen doen', 3),
    ('format', 'gesprek', 'gesprek', 1),
    ('format', 'ritueel', 'ritueel', 2),
    ('format', 'activiteit', 'activiteit', 3)
) as seed(group_key, slug, label, sort_order)
join public.blog_filter_groups groups on groups.key = seed.group_key
on conflict (group_id, slug) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

insert into public.blog_posts (audience_id, slug, title, intro, content, status, published_at)
select audiences.id, seed.slug, seed.title, seed.intro, seed.content, 'published', now()
from (
  values
    (
      'voor-zorgverleners',
      'blog-voor-zorgverleners',
      'Blog voor zorgverleners',
      'Een korte testblog voor zorgverleners over hoe je moeilijke informatie rustig en helder kunt aanbieden aan kinderen en hun omgeving.',
      'Als zorgverlener kom je soms op momenten waarop woorden zorgvuldig gekozen moeten worden. Kinderen hebben nood aan eerlijke taal, maar ook aan rust, herhaling en nabijheid.' || chr(10) || chr(10) ||
      'Deze testblog geeft een eerste aanzet om uitleg behapbaar te maken en telkens te checken wat een kind al begrepen heeft.'
    ),
    (
      'voor-leerkrachten',
      'blog-voor-leerkrachten',
      'Blog voor leerkrachten',
      'Een testblog voor leerkrachten met handvatten om ruimte te maken voor vragen, stilte en gesprek in de klas.',
      'In de klas kan ziekte of verlies veel losmaken. Een veilige klasomgeving helpt kinderen om vragen te stellen en gevoelens te tonen zonder dat alles meteen opgelost moet worden.' || chr(10) || chr(10) ||
      'Gebruik korte momenten, duidelijke afspraken en eenvoudige rituelen om houvast te geven.'
    ),
    (
      'voor-zorgfiguren',
      'blog-voor-zorgfiguren',
      'Blog voor zorgfiguren',
      'Een testblog voor zorgfiguren over nabij blijven, woorden zoeken en samen kleine momenten van betekenis maken.',
      'Zorgfiguren hoeven geen perfecte woorden te vinden. Vaak is nabij blijven, luisteren en opnieuw uitleg geven al heel waardevol.' || chr(10) || chr(10) ||
      'Deze blog helpt om kleine, zachte momenten te herkennen waarin kinderen zich gezien en gedragen voelen.'
    ),
    (
      'voor-zorgfiguren',
      'wanneer-woorden-moeilijk-zijn',
      'Wanneer woorden moeilijk zijn',
      'Soms zijn er geen perfecte woorden. Deze testblog verkent hoe nabijheid, eenvoud en herhaling toch veiligheid kunnen geven.',
      'Wanneer woorden tekortschieten, mag je klein beginnen. Benoem wat zichtbaar is, laat stiltes bestaan en geef kinderen ruimte om later terug te komen op hun vragen.'
    ),
    (
      'voor-zorgfiguren',
      'een-rustig-afscheidsmoment-maken',
      'Een rustig afscheidsmoment maken',
      'Een testblog over zachte rituelen, voorspelbaarheid en kleine handelingen die een afscheid tastbaar kunnen maken.',
      'Een afscheidsmoment hoeft niet groot te zijn. Een tekening, een kaarsje, een lied of een vaste zin kan kinderen helpen om iets moeilijks tastbaar te maken.'
    ),
    (
      'voor-leerkrachten',
      'praten-in-de-klas-over-ziekte',
      'Praten in de klas over ziekte',
      'Deze testblog laat zien hoe je als leerkracht ziekte bespreekbaar kunt maken zonder de klas te overspoelen.',
      'Vertrek vanuit wat kinderen al weten. Geef korte informatie, gebruik gewone woorden en spreek af waar kinderen terechtkunnen met vragen.'
    ),
    (
      'voor-leerkrachten',
      'rituelen-die-kinderen-houvast-geven',
      'Rituelen die kinderen houvast geven',
      'Een testblog over klasrituelen die kinderen helpen om gevoelens te delen en samen houvast te vinden.',
      'Rituelen maken ruimte voor herhaling. Ze geven kinderen een voorspelbare vorm om iets te voelen, te delen of net even stil te zijn.'
    ),
    (
      'voor-zorgverleners',
      'uitleg-geven-zonder-te-overspoelen',
      'Uitleg geven zonder te overspoelen',
      'Een testblog met aandacht voor doseren, checken wat een kind al weet en aansluiten bij de taal van het gezin.',
      'Doseren betekent niet verzwijgen. Het betekent stap voor stap vertellen, pauzeren en nagaan welke woorden blijven hangen.'
    ),
    (
      'voor-zorgverleners',
      'samen-iets-doen-na-slecht-nieuws',
      'Samen iets doen na slecht nieuws',
      'Een testblog over eenvoudige activiteiten na slecht nieuws: tekenen, verzamelen, vertellen of gewoon samen zijn.',
      'Na slecht nieuws kan samen iets doen rust brengen. Een activiteit geeft handen en hoofd iets concreets, terwijl gevoelens er gewoon mogen zijn.'
    )
) as seed(audience_slug, slug, title, intro, content)
join public.blog_audiences audiences on audiences.slug = seed.audience_slug
on conflict (slug) do update set
  audience_id = excluded.audience_id,
  title = excluded.title,
  intro = excluded.intro,
  content = excluded.content,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.blog_post_filter_options (post_id, filter_option_id)
select posts.id, options.id
from (
  values
    ('blog-voor-zorgverleners', 'age', '6-9-jaar'),
    ('blog-voor-zorgverleners', 'age', '9-12-jaar'),
    ('blog-voor-zorgverleners', 'theme', 'ernstig-ziek'),
    ('blog-voor-zorgverleners', 'theme', 'ongeneeslijk-ziek'),
    ('blog-voor-zorgverleners', 'goal', 'samen-begrijpen'),
    ('blog-voor-zorgverleners', 'goal', 'samen-voelen'),
    ('blog-voor-zorgverleners', 'format', 'gesprek'),
    ('blog-voor-leerkrachten', 'age', '3-5-jaar'),
    ('blog-voor-leerkrachten', 'age', '6-9-jaar'),
    ('blog-voor-leerkrachten', 'age', '9-12-jaar'),
    ('blog-voor-leerkrachten', 'theme', 'afscheid-en-rouw'),
    ('blog-voor-leerkrachten', 'goal', 'samen-begrijpen'),
    ('blog-voor-leerkrachten', 'goal', 'samen-doen'),
    ('blog-voor-leerkrachten', 'format', 'gesprek'),
    ('blog-voor-zorgfiguren', 'age', '0-2-jaar'),
    ('blog-voor-zorgfiguren', 'age', '3-5-jaar'),
    ('blog-voor-zorgfiguren', 'age', '6-9-jaar'),
    ('blog-voor-zorgfiguren', 'theme', 'ernstig-ziek'),
    ('blog-voor-zorgfiguren', 'theme', 'ongeneeslijk-ziek'),
    ('blog-voor-zorgfiguren', 'theme', 'afscheid-en-rouw'),
    ('blog-voor-zorgfiguren', 'goal', 'samen-begrijpen'),
    ('blog-voor-zorgfiguren', 'goal', 'samen-voelen'),
    ('blog-voor-zorgfiguren', 'goal', 'samen-doen'),
    ('blog-voor-zorgfiguren', 'format', 'activiteit'),
    ('wanneer-woorden-moeilijk-zijn', 'age', '3-5-jaar'),
    ('wanneer-woorden-moeilijk-zijn', 'age', '6-9-jaar'),
    ('wanneer-woorden-moeilijk-zijn', 'theme', 'ernstig-ziek'),
    ('wanneer-woorden-moeilijk-zijn', 'goal', 'samen-voelen'),
    ('wanneer-woorden-moeilijk-zijn', 'goal', 'samen-begrijpen'),
    ('een-rustig-afscheidsmoment-maken', 'age', '0-2-jaar'),
    ('een-rustig-afscheidsmoment-maken', 'age', '3-5-jaar'),
    ('een-rustig-afscheidsmoment-maken', 'theme', 'afscheid-en-rouw'),
    ('een-rustig-afscheidsmoment-maken', 'goal', 'samen-voelen'),
    ('een-rustig-afscheidsmoment-maken', 'goal', 'samen-doen'),
    ('een-rustig-afscheidsmoment-maken', 'format', 'ritueel'),
    ('praten-in-de-klas-over-ziekte', 'age', '6-9-jaar'),
    ('praten-in-de-klas-over-ziekte', 'age', '9-12-jaar'),
    ('praten-in-de-klas-over-ziekte', 'theme', 'ernstig-ziek'),
    ('praten-in-de-klas-over-ziekte', 'goal', 'samen-begrijpen'),
    ('praten-in-de-klas-over-ziekte', 'format', 'gesprek'),
    ('rituelen-die-kinderen-houvast-geven', 'age', '3-5-jaar'),
    ('rituelen-die-kinderen-houvast-geven', 'age', '6-9-jaar'),
    ('rituelen-die-kinderen-houvast-geven', 'theme', 'afscheid-en-rouw'),
    ('rituelen-die-kinderen-houvast-geven', 'goal', 'samen-doen'),
    ('rituelen-die-kinderen-houvast-geven', 'goal', 'samen-voelen'),
    ('rituelen-die-kinderen-houvast-geven', 'format', 'ritueel'),
    ('uitleg-geven-zonder-te-overspoelen', 'age', '6-9-jaar'),
    ('uitleg-geven-zonder-te-overspoelen', 'age', '9-12-jaar'),
    ('uitleg-geven-zonder-te-overspoelen', 'theme', 'ongeneeslijk-ziek'),
    ('uitleg-geven-zonder-te-overspoelen', 'goal', 'samen-begrijpen'),
    ('samen-iets-doen-na-slecht-nieuws', 'age', '0-2-jaar'),
    ('samen-iets-doen-na-slecht-nieuws', 'age', '3-5-jaar'),
    ('samen-iets-doen-na-slecht-nieuws', 'age', '6-9-jaar'),
    ('samen-iets-doen-na-slecht-nieuws', 'theme', 'ernstig-ziek'),
    ('samen-iets-doen-na-slecht-nieuws', 'theme', 'ongeneeslijk-ziek'),
    ('samen-iets-doen-na-slecht-nieuws', 'goal', 'samen-doen'),
    ('samen-iets-doen-na-slecht-nieuws', 'goal', 'samen-voelen'),
    ('samen-iets-doen-na-slecht-nieuws', 'format', 'activiteit')
) as seed(post_slug, group_key, option_slug)
join public.blog_posts posts on posts.slug = seed.post_slug
join public.blog_filter_groups groups on groups.key = seed.group_key
join public.blog_filter_options options on options.group_id = groups.id and options.slug = seed.option_slug
on conflict do nothing;
