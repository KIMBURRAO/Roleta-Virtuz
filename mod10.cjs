const fs = require('fs');

let wheel = fs.readFileSync('src/features/wheel/components/Wheel.tsx', 'utf8');

const oldImageBlock = `<clipPath id={\`image-clip-\${prize.id}\`}>
                      <circle cx={imagePoint.x} cy={imagePoint.y} r={(settings.wheelImageSize / 2) + 3} />
                    </clipPath>
                    <circle cx={imagePoint.x} cy={imagePoint.y} r={(settings.wheelImageSize / 2) + 3} fill="rgba(255,255,255,.94)" stroke="rgba(0,0,0,.16)" strokeWidth="1" />
                    <image href={imageUrl} x={imagePoint.x - (settings.wheelImageSize / 2)} y={imagePoint.y - (settings.wheelImageSize / 2)} width={settings.wheelImageSize} height={settings.wheelImageSize} preserveAspectRatio="xMidYMid slice" clipPath={\`url(#image-clip-\${prize.id})\`} />`;

const newImageBlock = `<circle cx={imagePoint.x} cy={imagePoint.y} r={settings.wheelImageSize * 0.75} fill="rgba(255,255,255,.94)" stroke="rgba(0,0,0,.16)" strokeWidth="1" />
                    <image href={imageUrl} x={imagePoint.x - (settings.wheelImageSize / 2)} y={imagePoint.y - (settings.wheelImageSize / 2)} width={settings.wheelImageSize} height={settings.wheelImageSize} preserveAspectRatio="xMidYMid slice" />`;

wheel = wheel.replace(oldImageBlock, newImageBlock);

fs.writeFileSync('src/features/wheel/components/Wheel.tsx', wheel);
