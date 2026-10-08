const fs = require('fs');

let c = fs.readFileSync('src/features/wheel/components/Wheel.tsx', 'utf8');

const newDefs = `          <defs>
            {prizes.map((prize, index) => {
              const size = 360 / prizes.length
              const startAngle = -90 + size * index
              const endAngle = -90 + size * (index + 1)
              const centerAngle = (startAngle + endAngle) / 2
              const r = 125 // Radius for text path
              
              // If text is in the bottom half of the wheel, draw the arc backwards so text is upright
              const isBottom = centerAngle > 0 && centerAngle < 180
              
              const p1 = point(r, isBottom ? endAngle : startAngle)
              const p2 = point(r, isBottom ? startAngle : endAngle)
              
              // sweep-flag is 1 for clockwise, 0 for counter-clockwise
              const sweep = isBottom ? 0 : 1
              
              return (
                <g key={prize.id}>
                  <clipPath id={\`slice-\${prize.id}\`}><path d={slicePath(index, prizes.length)} /></clipPath>
                  <path id={\`text-path-\${prize.id}\`} d={\`M \${p1.x} \${p1.y} A \${r} \${r} 0 0 \${sweep} \${p2.x} \${p2.y}\`} fill="none" />
                </g>
              )
            })}
          </defs>`;

c = c.replace(/<defs>[\s\S]*?<\/defs>/, newDefs);

fs.writeFileSync('src/features/wheel/components/Wheel.tsx', c);
