const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

c += `

/* Redesign Virtuz 2026 */
.highlight-badge {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.4rem 1.2rem;
  background-color: #E0F42A;
  color: #004D04;
  font-weight: 900;
  border-radius: 999px;
  text-transform: uppercase;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.wheel-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.footer-line1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.2rem;
}

.footer-line2 {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.spin-button {
  background-color: #0CB800 !important;
  color: #FFFFFF !important;
  font-weight: 900 !important;
  text-transform: uppercase;
  border-radius: 999px !important;
  box-shadow: 0 6px 16px rgba(0,0,0,0.3) !important;
  transition: transform 0.2s, background-color 0.2s !important;
  border: 2px solid #E0F42A !important;
}

.spin-button:active {
  transform: scale(0.95) !important;
}

.wheel-frame {
  border: 6px solid #d4e2d4;
  border-radius: 50%;
  box-shadow: 0 0 0 10px #027D00, 0 12px 30px rgba(0,0,0,0.5);
  background: #027D00;
}

.wheel-svg {
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.3));
}
`;

fs.writeFileSync('src/index.css', c);
