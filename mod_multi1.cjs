const fs = require('fs');

// 1. domain.ts
let domain = fs.readFileSync('src/types/domain.ts', 'utf8');
domain = domain.replace(/hideInRoleta2\??: boolean/g, 'campaignSlug: string');
domain = domain.replace(/wheelHighlightText2: string\n  wheelFooterText2: string\n  wheelSubfooterText2: string \| null/g, 'campaignSlug: string');
if (!domain.includes('campaignSlug') && domain.includes('hideInRoleta2')) {
    domain = domain.replace('hideInRoleta2: boolean', 'campaignSlug: string');
}
if (!domain.match(/campaignSlug: string/g) || domain.match(/campaignSlug: string/g).length < 2) {
    domain = domain.replace('active: boolean', 'active: boolean\n  campaignSlug: string'); // For PrizeInput
}
domain = domain.replace('eventSessionId: string', 'eventSessionId: string\n  campaignSlug: string'); // For SpinHistoryItem
domain = domain.replace('status: \'pending\' | \'conflict\'', 'status: \'pending\' | \'conflict\'\n  campaignSlug: string'); // For OfflineSpin
fs.writeFileSync('src/types/domain.ts', domain);

// 2. defaults.ts
let defaults = fs.readFileSync('src/lib/defaults.ts', 'utf8');
defaults = defaults.replace('id: 1,', 'id: 1,\n  campaignSlug: \'default\',');
defaults = defaults.replace(/wheelHighlightText2: '',\n  wheelFooterText2: 'Boa sorte! 🍀',\n  wheelSubfooterText2: 'Seu prêmio será revelado ao final da rodada.',/g, '');
fs.writeFileSync('src/lib/defaults.ts', defaults);

// 3. mappers.ts
let mappers = fs.readFileSync('src/services/mappers.ts', 'utf8');
mappers = mappers.replace('active: boolean(row.active, true),', 'active: boolean(row.active, true),\n    campaignSlug: string(row.campaign_slug, \'default\'),');
mappers = mappers.replace('id: number(row.id, 1),', 'id: number(row.id, 1),\n    campaignSlug: string(row.campaign_slug, \'default\'),');
mappers = mappers.replace(/wheelHighlightText2: .*\n.*wheelFooterText2: .*\n.*wheelSubfooterText2: .*/g, '');
mappers = mappers.replace('eventSessionId: string(row.event_session_id) }', 'eventSessionId: string(row.event_session_id), campaignSlug: string(row.campaign_slug, \'default\') }');
mappers = mappers.replace('id: 1,', 'id: settings.id,\n    campaign_slug: settings.campaignSlug,');
mappers = mappers.replace(/wheel_highlight_text_2: settings.wheelHighlightText2,\n.*wheel_footer_text_2: settings.wheelFooterText2,\n.*wheel_subfooter_text_2: settings.wheelSubfooterText2,/g, '');
fs.writeFileSync('src/services/mappers.ts', mappers);

// 4. prize-schema.ts
let prizeSchema = fs.readFileSync('src/features/prizes/prize-schema.ts', 'utf8');
prizeSchema = prizeSchema.replace(/hideInRoleta2: z\.boolean\(\)\.default\(false\),/g, 'campaignSlug: z.string().default(\'default\'),');
fs.writeFileSync('src/features/prizes/prize-schema.ts', prizeSchema);

// 5. wheel-domain.test.ts
let t1 = fs.readFileSync('src/features/wheel/domain/wheel-domain.test.ts', 'utf8');
t1 = t1.replace(/hideInRoleta2: false/g, 'campaignSlug: \'default\'');
fs.writeFileSync('src/features/wheel/domain/wheel-domain.test.ts', t1);

// 6. wheel-session.test.ts
let t2 = fs.readFileSync('src/features/wheel/domain/wheel-session.test.ts', 'utf8');
t2 = t2.replace(/hideInRoleta2: false/g, 'campaignSlug: \'default\'');
fs.writeFileSync('src/features/wheel/domain/wheel-session.test.ts', t2);

