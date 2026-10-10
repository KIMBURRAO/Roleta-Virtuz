import type { AppSettings, Prize } from '../../../types/domain'
import { BRAND_ASSETS, resolveAssetUrl } from '../../../lib/brand'

function point(radius: number, angle: number) {
  const radians = angle * Math.PI / 180
  return { x: 150 + radius * Math.cos(radians), y: 150 + radius * Math.sin(radians) }
}

function slicePath(index: number, count: number): string {
  if (count === 1) return 'M 150 2 A 148 148 0 1 1 149.99 2 Z'
  const size = 360 / count
  const start = point(148, -90 + size * index)
  const end = point(148, -90 + size * (index + 1))
  return `M 150 150 L ${start.x} ${start.y} A 148 148 0 ${size > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`
}

export function Wheel({ prizes, settings, rotation, spinning }: { prizes: Prize[]; settings: AppSettings; rotation: number; spinning: boolean }) {
  const scale = prizes.length > 12 ? 0.6 : prizes.length > 8 ? 0.75 : prizes.length > 5 ? 0.85 : 1
  const textSize = settings.wheelLabelFontSize * scale
  return (
    <div className="wheel-stage">
      <div className="wheel-pointer" />
      <div className="wheel-frame">
        <div className="wheel-rotor" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 5.2s cubic-bezier(.12,.68,.08,1)' : 'none' }}>
        <svg
          className="wheel-svg"
          viewBox="0 0 300 300"
          role="img"
          aria-label={`Roleta com ${prizes.length} prêmios`}
        >
          <defs>
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
                  <clipPath id={`slice-${prize.id}`}><path d={slicePath(index, prizes.length)} /></clipPath>
                  <path id={`text-path-${prize.id}`} d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 0 ${sweep} ${p2.x} ${p2.y}`} fill="none" />
                </g>
              )
            })}
          </defs>
          {prizes.map((prize, index) => {
            const size = 360 / prizes.length
            const center = -90 + size * (index + .5)
            const imagePoint = point(settings.wheelImageRadius, center)
            const imageUrl = resolveAssetUrl(prize.imageUrl)
            
            // Limit image size so it doesn't overflow slice lines
            const sliceWidthAtImage = (2 * Math.PI * settings.wheelImageRadius) / prizes.length
            const maxImageSize = sliceWidthAtImage * 0.85
            const actualImageSize = Math.min(settings.wheelImageSize, maxImageSize)
            const actualCircleR = actualImageSize * 0.75

            // Limit text size so long names don't overlap adjacent slices
            const sliceWidthAtText = (2 * Math.PI * 125) / prizes.length
            const maxTextWidth = sliceWidthAtText * 0.94
            const approxWidth = prize.name.length * (textSize * 0.55)
            const finalFontSize = approxWidth > maxTextWidth ? textSize * (maxTextWidth / approxWidth) : textSize

            return (
              <g key={prize.id}>
                <path d={slicePath(index, prizes.length)} fill={prize.color} stroke="rgba(255,255,255,.76)" strokeWidth="1.6" />
                {settings.showImages && imageUrl && (
                  <>
                    <circle cx={imagePoint.x} cy={imagePoint.y} r={actualCircleR} fill="rgba(255,255,255,.94)" stroke="rgba(0,0,0,.16)" strokeWidth="1" />
                    <image href={imageUrl} x={imagePoint.x - (actualImageSize / 2)} y={imagePoint.y - (actualImageSize / 2)} width={actualImageSize} height={actualImageSize} preserveAspectRatio="xMidYMid slice" />
                  </>
                )}
                {settings.showNames && (
                  <text
                    fill="#fff"
                    fontSize={finalFontSize}
                    fontWeight="800"
                    fontFamily={settings.wheelFontFamily}
                    paintOrder="stroke"
                    stroke="rgba(0,0,0,.24)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  >
                    <textPath href={`#text-path-${prize.id}`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                      {prize.name}
                    </textPath>
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        </div>
        <div className="wheel-hub"><img src={BRAND_ASSETS.markDark} alt="" /></div>
      </div>
    </div>
  )
}
