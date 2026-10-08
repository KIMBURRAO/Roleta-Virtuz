const fs = require('fs');
let c = fs.readFileSync('src/pages/public/WheelPage.tsx', 'utf8');

const newCopy = `      <section className="public-copy">
        <img
          className="virtuz-logo"
          src={settings.logoUrl ?? BRAND_ASSETS.horizontalLight}
          alt={settings.eventName || 'Virtuz'}
          onError={(event) => {
            const fallback = getLogoFallbackSource(event.currentTarget.dataset.fallbackApplied === 'true')
            if (!fallback) return
            event.currentTarget.dataset.fallbackApplied = 'true'
            event.currentTarget.src = fallback
          }}
        />
        <h1>{settings.wheelTitle}</h1>
        <p className="subtitle">{settings.wheelSubtitle}</p>
        {settings.wheelHighlightText && <div className="highlight-badge">{settings.wheelHighlightText}</div>}
      </section>`;

c = c.replace(/<section className="public-copy">[\s\S]*?<\/section>/, newCopy);

const newSpinArea = `      <section className="spin-area" aria-live="polite">
        <p className={spin.error ? 'empty-message error-message' : 'empty-message'}>{status || '\u00A0'}</p>
        <button className="spin-button" type="button" disabled={!canSpin} onClick={() => void spin.start()}>
          {spin.phase === 'requesting' ? 'Preparando...' : spin.phase === 'spinning' ? 'Girando...' : 'GIRAR A ROLETA'}
        </button>
        <div className="wheel-footer">
          {settings.wheelFooterText && <p className="footer-line1">{settings.wheelFooterText}</p>}
          {settings.wheelSubfooterText && <p className="footer-line2">{settings.wheelSubfooterText}</p>}
        </div>
      </section>`;

c = c.replace(/<section className="spin-area" aria-live="polite">[\s\S]*?<\/section>/, newSpinArea);

fs.writeFileSync('src/pages/public/WheelPage.tsx', c);
