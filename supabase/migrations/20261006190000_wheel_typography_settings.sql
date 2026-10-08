alter table public.app_settings
  add column wheel_font_family text not null default 'Inter',
  add column wheel_title_font_size smallint not null default 80,
  add column wheel_label_font_size smallint not null default 14;

alter table public.app_settings
  add constraint app_settings_wheel_title_font_size check (wheel_title_font_size between 24 and 120),
  add constraint app_settings_wheel_label_font_size check (wheel_label_font_size between 8 and 24),
  add constraint app_settings_wheel_font_family check (wheel_font_family in ('Inter', 'Arial', 'Georgia', 'Trebuchet MS', 'Verdana'));
