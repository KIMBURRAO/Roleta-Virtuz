const fs = require('fs');

let c = fs.readFileSync('src/features/wheel/components/Wheel.tsx', 'utf8');

const newDefs = `          <defs>
            {prizes.map((prize, index) => {
              const size = 360 / prizes.length
              const startAngle = -90 + size * index
              const endAngle = -90 + size * (index + 1)
              const r = 125 // Radius for text path
              const p1 = point(r, startAngle)
              const p2 = point(r, endAngle)
              return (
                <g key={prize.id}>
                  <clipPath id={\`slice-\${prize.id}\`}><path d={slicePath(index, prizes.length)} /></clipPath>
                  <path id={\`text-path-\${prize.id}\`} d={\`M \${p1.x} \${p1.y} A \${r} \${r} 0 0 1 \${p2.x} \${p2.y}\`} fill="none" />
                </g>
              )
            })}
          </defs>`;

c = c.replace(/<defs>[\s\S]*?<\/defs>/, newDefs);

const newText = `                {settings.showNames && (
                  <text
                    fill="#fff"
                    fontSize={textSize}
                    fontWeight="800"
                    fontFamily={settings.wheelFontFamily}
                    paintOrder="stroke"
                    stroke="rgba(0,0,0,.24)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  >
                    <textPath href={\`#text-path-\${prize.id}\`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                      {prize.name}
                    </textPath>
                  </text>
                )}`;

c = c.replace(/\{settings\.showNames && \([\s\S]*?<\/text>\s*\)\}/, newText);

// Also we should move the image icon slightly closer to the center since the text is on the outside now.
// const imagePoint = point(prizes.length > 8 ? 82 : 76, center)
c = c.replace(/const imagePoint = point\(prizes\.length > 8 \? 82 : 76, center\)/, 'const imagePoint = point(70, center)');

fs.writeFileSync('src/features/wheel/components/Wheel.tsx', c);
