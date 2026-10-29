-- ROASTERA database setup. Run this entire file in Supabase > SQL Editor.
-- Important: create the owner account in Supabase Authentication first.
-- Admin access is restricted to the email below.
begin;

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text not null default '',
  description text not null default '',
  price integer not null check (price >= 0),
  weight text not null default '250 غ',
  category text not null default 'خلطاتنا',
  badge text not null default '',
  image text not null,
  active boolean not null default true,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('RST-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,8))),
  customer_name text not null,
  phone text not null,
  city text not null default 'حلب',
  address text not null,
  notes text not null default '',
  total bigint not null default 0 check (total >= 0),
  status text not null default 'new' check (status in ('new','confirmed','preparing','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products for select using (active = true or (auth.jwt()->>'email') = 'roastera.aleppo@gmail.com');

drop policy if exists "Owner manages products" on public.products;
create policy "Owner manages products" on public.products for all to authenticated using ((auth.jwt()->>'email') = 'roastera.aleppo@gmail.com') with check ((auth.jwt()->>'email') = 'roastera.aleppo@gmail.com');

drop policy if exists "Owner reads orders" on public.orders;
create policy "Owner reads orders" on public.orders for select to authenticated using ((auth.jwt()->>'email') = 'roastera.aleppo@gmail.com');
drop policy if exists "Owner updates orders" on public.orders;
create policy "Owner updates orders" on public.orders for update to authenticated using ((auth.jwt()->>'email') = 'roastera.aleppo@gmail.com') with check ((auth.jwt()->>'email') = 'roastera.aleppo@gmail.com');

drop policy if exists "Owner reads order items" on public.order_items;
create policy "Owner reads order items" on public.order_items for select to authenticated using ((auth.jwt()->>'email') = 'roastera.aleppo@gmail.com');

-- Anonymous visitors can only submit through this function. They cannot directly read or alter orders.
create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_city text,
  p_address text,
  p_notes text,
  p_items jsonb
) returns table(order_number text, total bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_total bigint := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_name text;
  v_phone text;
  v_city text;
  v_address text;
  v_notes text;
  v_count integer := 0;
begin
  v_name := trim(coalesce(p_customer_name,''));
  v_phone := trim(coalesce(p_phone,''));
  v_city := trim(coalesce(p_city,'حلب'));
  v_address := trim(coalesce(p_address,''));
  v_notes := trim(coalesce(p_notes,''));

  if length(v_name) < 2 or length(v_name) > 100 then raise exception 'Invalid customer name'; end if;
  if length(v_phone) < 6 or length(v_phone) > 30 then raise exception 'Invalid phone'; end if;
  if length(v_city) < 2 or length(v_city) > 80 then raise exception 'Invalid city'; end if;
  if length(v_address) < 5 or length(v_address) > 300 then raise exception 'Invalid address'; end if;
  if length(v_notes) > 500 then raise exception 'Notes too long'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then raise exception 'Invalid items'; end if;

  insert into public.orders(customer_name, phone, city, address, notes, total)
  values(v_name, v_phone, v_city, v_address, v_notes, 0)
  returning id, orders.order_number into v_order_id, v_order_number;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_count := v_count + 1;
    if v_count > 30 then raise exception 'Too many items'; end if;
    if not (v_item ? 'product_id') or not (v_item ? 'quantity') then raise exception 'Invalid item'; end if;
    if (v_item->>'quantity') !~ '^[0-9]{1,3}$' then raise exception 'Invalid quantity'; end if;
    v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 or v_qty > 99 then raise exception 'Invalid quantity'; end if;

    select * into v_product from public.products
    where id::text = v_item->>'product_id' and active = true
    for update;
    if not found then raise exception 'Product unavailable'; end if;
    if v_product.stock < v_qty then raise exception 'Insufficient stock for %', v_product.name; end if;

    insert into public.order_items(order_id, product_id, product_name, quantity, unit_price)
    values(v_order_id, v_product.id, v_product.name, v_qty, v_product.price);
    v_total := v_total + (v_product.price::bigint * v_qty);
  end loop;

  update public.orders set total = v_total where id = v_order_id;
  return query select v_order_number, v_total;
end;
$$;

revoke all on function public.create_order(text,text,text,text,text,jsonb) from public;
grant execute on function public.create_order(text,text,text,text,text,jsonb) to anon, authenticated;

-- Starter products. These are DEMO prices and should be edited before accepting real orders.
insert into public.products(name,subtitle,description,price,weight,category,badge,image,active,stock)
select * from (values
('خلطة روستيرا','Signature Blend','خلطة متوازنة برائحة غنية ونهاية ناعمة، مناسبة لبداية يوم مختلف.',85000,'250 غ','خلطاتنا','اختيارنا','https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=85',true,20),
('إسبريسو داكن','Dark Espresso','تحميص غني وقوام ممتلئ لمحبي الإسبريسو والنكهات العميقة.',95000,'250 غ','إسبريسو','قوي وغني','https://images.unsplash.com/photo-1510707577719-ae7c14805e76?auto=format&fit=crop&w=900&q=85',true,15),
('إثيوبيا المختارة','Ethiopia Select','طابع عطري ولمسات فاكهية لطيفة لعشاق القهوة المختصة.',110000,'250 غ','قهوة مختصة','مختصة','https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85',true,12),
('قهوة كل يوم','Everyday Coffee','قهوة يومية متوازنة، سهلة التحضير ومناسبة لكل الأوقات.',140000,'500 غ','خلطاتنا','للاستخدام اليومي','https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85',true,25),
('منزوعة الكافيين','Decaf Roast','نكهة القهوة التي تحبها مع كافيين أقل، لتحضير مسائي هادئ.',105000,'250 غ','قهوة مختصة','كافيين أقل','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',true,8),
('صندوق القهوة','Coffee Gift Box','هدية أنيقة لمحبي القهوة. تفاصيل المحتويات والسعر النهائي تؤكد عبر واتساب.',180000,'صندوق هدايا','هدايا','هدية مميزة','https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=900&q=85',true,5)
) as seed(name,subtitle,description,price,weight,category,badge,image,active,stock)
where not exists (select 1 from public.products);

commit;
