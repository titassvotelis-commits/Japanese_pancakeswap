import React from 'react'
import styled, { keyframes } from 'styled-components'
import { PromoArtTheme } from 'config/constants/promoAds'

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-7px) rotate(-4deg); }
`

const spinSlow = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(0.94); }
  50% { opacity: 1; transform: scale(1.06); }
`

const shimmer = keyframes`
  0% { transform: translateX(-120%) skewX(-12deg); }
  100% { transform: translateX(220%) skewX(-12deg); }
`

const orbit = keyframes`
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-5px, 4px); }
`

const rise = keyframes`
  0% { transform: translateY(6px) scale(0.5); opacity: 0; }
  35% { opacity: 1; }
  100% { transform: translateY(-20px) scale(1); opacity: 0; }
`

const JNTO_GOLD = 'linear-gradient(145deg, #ffe566 0%, #f5b82e 45%, #d4920a 100%)'
const JNTO_RING = 'rgba(255, 229, 102, 0.45)'

const Canvas = styled.div<{ $theme: PromoArtTheme }>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${({ $theme }) =>
    $theme === 'jnto-hero'
      ? 'radial-gradient(ellipse at 25% 85%, rgba(212, 146, 10, 0.4) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(155, 107, 255, 0.35) 0%, transparent 50%), #141018'
      : $theme === 'jnto-swap'
        ? 'radial-gradient(ellipse at 70% 80%, rgba(155, 107, 255, 0.38) 0%, transparent 55%), radial-gradient(ellipse at 20% 25%, rgba(255, 229, 102, 0.28) 0%, transparent 45%), #13121a'
        : 'radial-gradient(ellipse at 55% 95%, rgba(72, 207, 134, 0.32) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255, 229, 102, 0.3) 0%, transparent 45%), #12141a'};
`

const GlowOrb = styled.div<{ $color: string; $size: number; $top: string; $left: string; $delay?: string }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  filter: blur(20px);
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay ?? '0s'};
`

const Shimmer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 42%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 229, 102, 0.14), transparent);
    animation: ${shimmer} 4.2s ease-in-out infinite;
  }
`

const JntoCoin = styled.div<{ $size: number; $top: string; $right: string; $delay?: string; $hero?: boolean }>`
  position: absolute;
  top: ${({ $top }) => $top};
  right: ${({ $right }) => $right};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${JNTO_GOLD};
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 6px 20px rgba(212, 146, 10, 0.45), inset 0 -4px 8px rgba(0, 0, 0, 0.15);
  animation: ${float} ${({ $hero }) => ($hero ? '2.4s' : '3s')} ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay ?? '0s'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size, $hero }) => ($hero ? $size * 0.28 : $size * 0.32)}px;
  font-weight: 800;
  color: #3d2e08;
  letter-spacing: -0.04em;
`

const HeroRing = styled.div`
  position: absolute;
  top: 50%;
  left: 52%;
  width: 78px;
  height: 78px;
  margin: -39px 0 0 -39px;
  border-radius: 50%;
  border: 2px dashed ${JNTO_RING};
  animation: ${spinSlow} 16s linear infinite;
`

const HeroCore = styled.div`
  position: absolute;
  top: 50%;
  left: 52%;
  width: 48px;
  height: 48px;
  margin: -24px 0 0 -24px;
  border-radius: 50%;
  background: ${JNTO_GOLD};
  border: 2px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 24px rgba(255, 229, 102, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #3d2e08;
  animation: ${pulse} 2.5s ease-in-out infinite;
`

const SwapPath = styled.svg`
  position: absolute;
  top: 22%;
  left: 32%;
  width: 58px;
  height: 40px;
  animation: ${orbit} 3.5s ease-in-out infinite;
`

const Spark = styled.div<{ $left: string; $bottom: string; $delay: string }>`
  position: absolute;
  left: ${({ $left }) => $left};
  bottom: ${({ $bottom }) => $bottom};
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ffe566;
  box-shadow: 0 0 10px #ffe566;
  animation: ${rise} 2.2s ease-out infinite;
  animation-delay: ${({ $delay }) => $delay};
`

const StakeBar = styled.div<{ $height: number; $left: string; $delay: string }>`
  position: absolute;
  bottom: 14px;
  left: ${({ $left }) => $left};
  width: 10px;
  height: ${({ $height }) => $height}px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #ffe566, #d4920a);
  animation: ${pulse} 2.8s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
`

const JntoHeroArt: React.FC = () => (
  <Canvas $theme="jnto-hero">
    <Shimmer />
    <GlowOrb $color="rgba(255, 229, 102, 0.65)" $size={58} $top="6%" $left="8%" />
    <GlowOrb $color="rgba(155, 107, 255, 0.5)" $size={44} $top="58%" $left="58%" $delay="0.7s" />
    <HeroRing />
    <HeroCore>JNTo</HeroCore>
    <JntoCoin $size={22} $top="14%" $right="10%" $delay="0.3s">
      J
    </JntoCoin>
    <JntoCoin $size={18} $top="62%" $right="24%" $delay="1s">
      N
    </JntoCoin>
  </Canvas>
)

const JntoSwapArt: React.FC = () => (
  <Canvas $theme="jnto-swap">
    <Shimmer />
    <GlowOrb $color="rgba(155, 107, 255, 0.55)" $size={50} $top="12%" $left="15%" />
    <GlowOrb $color="rgba(255, 229, 102, 0.5)" $size={46} $top="55%" $left="50%" $delay="0.5s" />
    <SwapPath viewBox="0 0 58 40" fill="none" aria-hidden>
      <path d="M4 20h16M16 14l6 6-6 6M38 20H22M30 14l6 6-6 6" stroke="#c8b6ff" strokeWidth="2.2" strokeLinecap="round" />
    </SwapPath>
    <JntoCoin $size={34} $top="28%" $right="16%" $delay="0s" $hero>
      JNTo
    </JntoCoin>
    <JntoCoin $size={22} $top="8%" $right="32%" $delay="0.8s">
      B
    </JntoCoin>
  </Canvas>
)

const JntoEarnArt: React.FC = () => (
  <Canvas $theme="jnto-earn">
    <Shimmer />
    <GlowOrb $color="rgba(72, 207, 134, 0.5)" $size={48} $top="18%" $left="20%" />
    <GlowOrb $color="rgba(255, 229, 102, 0.45)" $size={40} $top="62%" $left="55%" $delay="0.9s" />
    <StakeBar $height={28} $left="38%" $delay="0s" />
    <StakeBar $height={40} $left="48%" $delay="0.4s" />
    <StakeBar $height={22} $left="58%" $delay="0.8s" />
    <JntoCoin $size={32} $top="18%" $right="12%" $delay="0.2s" $hero>
      JNTo
    </JntoCoin>
    <Spark $left="44%" $bottom="50px" $delay="0s" />
    <Spark $left="54%" $bottom="54px" $delay="0.9s" />
    <Spark $left="50%" $bottom="46px" $delay="1.7s" />
  </Canvas>
)

const PromoSlideArt: React.FC<{ theme: PromoArtTheme }> = ({ theme }) => {
  switch (theme) {
    case 'jnto-swap':
      return <JntoSwapArt />
    case 'jnto-earn':
      return <JntoEarnArt />
    case 'jnto-hero':
    default:
      return <JntoHeroArt />
  }
}

export default PromoSlideArt
