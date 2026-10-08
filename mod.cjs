const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AppearancePage.tsx', 'utf8');
c = c.replace(/<Field label="Subt.*?<\/Field>/, `$&
    <Field label="Texto Destaque"><Input value={settings.wheelHighlightText ?? ''} onChange={(event) => set('wheelHighlightText', event.target.value)} /></Field>
    <Field label="Rodapé Linha 1"><Input value={settings.wheelFooterText ?? ''} onChange={(event) => set('wheelFooterText', event.target.value)} /></Field>
    <Field label="Rodapé Linha 2"><Input value={settings.wheelSubfooterText ?? ''} onChange={(event) => set('wheelSubfooterText', event.target.value)} /></Field>`);
fs.writeFileSync('src/pages/admin/AppearancePage.tsx', c);
