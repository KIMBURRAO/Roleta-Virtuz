alter table public.app_settings
  add column wheel_highlight_text text,
  add column wheel_footer_text text,
  add column wheel_subfooter_text text;

update public.app_settings set 
  wheel_highlight_text = 'INCLUINDO 1 AR-CONDICIONADO',
  wheel_footer_text = 'Boa sorte! 🍀',
  wheel_subfooter_text = 'Seu prêmio será revelado ao final da rodada.';
