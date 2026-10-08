const fs = require('fs');

let c = fs.readFileSync('src/pages/admin/PrizesPage.tsx', 'utf8');

c = c.replace(
  '<div><dt>Peso</dt><dd>{prize.weight}</dd></div>',
  '<div><dt>Chance</dt><dd>{((prize.weight / (query.data?.filter(p => p.active).reduce((s, p) => s + p.weight, 0) || 1)) * 100).toFixed(1)}%</dd></div>'
);

fs.writeFileSync('src/pages/admin/PrizesPage.tsx', c);

let dialog = fs.readFileSync('src/features/prizes/PrizeFormDialog.tsx', 'utf8');

dialog = dialog.replace(
  '<Field label="Chance / Peso" hint="1 = normal; nǧmeros maiores aparecem mais.">',
  '<Field label="Probabilidade (%)" hint="Ex: digite 25 para 25%. A roleta calcula a proporção automaticamente.">'
);

fs.writeFileSync('src/features/prizes/PrizeFormDialog.tsx', dialog);
