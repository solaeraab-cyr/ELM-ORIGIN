import Image from 'next/image';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 32 }: LogoProps) {
  return (
    <Image
      src="/elm-origin-logo.png"
      alt="Elm Origin"
      height={size}
      width={size * 3.75}
      style={{ height: size, width: 'auto', display: 'block' }}
      priority
    />
  );
}
