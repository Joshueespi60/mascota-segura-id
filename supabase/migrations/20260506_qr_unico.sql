-- 20260506_qr_unico.sql
-- Flujo QR unico por collar para MascotaSegura ID.

create extension if not exists pgcrypto;

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  qr_id text not null unique,
  status text not null default 'available',
  created_at timestamptz not null default now(),
  registered_at timestamptz,
  disabled_at timestamptz,
  notes text,
  constraint qr_codes_status_check check (status in ('available', 'registered', 'disabled'))
);

alter table public.mascotas
  add column if not exists qr_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'mascotas_qr_id_key'
      and conrelid = 'public.mascotas'::regclass
  ) then
    alter table public.mascotas
      add constraint mascotas_qr_id_key unique (qr_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'mascotas_qr_id_fkey'
      and conrelid = 'public.mascotas'::regclass
  ) then
    alter table public.mascotas
      add constraint mascotas_qr_id_fkey
      foreign key (qr_id)
      references public.qr_codes(qr_id)
      on update cascade
      on delete restrict;
  end if;
end
$$;

create index if not exists idx_qr_codes_qr_id on public.qr_codes(qr_id);
create index if not exists idx_qr_codes_status on public.qr_codes(status);
create index if not exists idx_mascotas_qr_id on public.mascotas(qr_id);

comment on table public.qr_codes is 'Inventario de codigos QR para collares fisicos';
comment on column public.mascotas.qr_id is 'QR unico del collar vinculado a la mascota';

-- -------------------------------------------------------------------------
-- RLS (guia sugerida)
-- -------------------------------------------------------------------------
-- Este proyecto usa anon key en frontend.
-- Para produccion se recomienda Supabase Auth + politicas RLS estrictas.
-- Ajustar estas politicas segun su modelo actual antes de activarlas.
--
-- Ejemplo de lectura publica minima (resolver QR y perfil):
--   select qr_id, status, registered_at
--   from public.qr_codes
--
-- Ejemplo de escritura restringida para admin (no aplicar sin auth):
--   insert/update/delete solo para usuarios con rol admin.
--
-- NOTA: si ya existen politicas, mantenerlas y solo adaptar permisos
-- para qr_codes y mascotas.qr_id.
