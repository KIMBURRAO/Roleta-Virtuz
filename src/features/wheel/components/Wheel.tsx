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
  const textSize = prizes.length > 12 ? 8 : prizes.length > 8 ? 10 : prizes.length > 5 ? 12 : 14
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
            {prizes.map((prize, index) => <clipPath id={`slice-${prize.id}`} key={prize.id}><path d={slicePath(index, prizes.length)} /></clipPath>)}
          </defs>
          {prizes.map((prize, index) => {
            const size = 360 / prizes.length
            const center = -90 + size * (index + .5)
            const imagePoint = point(prizes.length > 8 ? 82 : 76, center)
            const labelPoint = point(104, center)
            const labelRotation = center + 90 > 90 && center + 90 < 270 ? center - 90 : center + 90
            const imageUrl = resolveAssetUrl(prize.imageUrl)
            return (
              <g key={prize.id}>
                <path d={slicePath(index, prizes.length)} fill={prize.color} stroke="rgba(255,255,255,.76)" strokeWidth="1.6" />
                {settings.showImages && imageUrl && (
                  <>
                    <circle cx={imagePoint.x} cy={imagePoint.y} r="17" fill="rgba(255,255,255,.94)" stroke="rgba(0,0,0,.16)" strokeWidth="1" />
                    <image href={imageUrl} x={imagePoint.x - 14} y={imagePoint.y - 14} width="28" height="28" preserveAspectRatio="xMidYMid slice" clipPath={`url(#slice-${prize.id})`} />
                  </>
                )}
                {settings.showNames && (
                  <text
                    x={labelPoint.x}
                    y={labelPoint.y}
                    transform={`rotate(${labelRotation} ${labelPoint.x} ${labelPoint.y})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={textSize}
                    fontWeight="800"
                    paintOrder="stroke"
                    stroke="rgba(0,0,0,.24)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  >{prize.name.length > 18 ? `${prize.name.slice(0, 17)}…` : prize.name}</text>
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
