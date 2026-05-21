import Image from 'next/image';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 32 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Elm Origin"
      height={size}
      width={Math.round(size * 3.73)}
      style={{ height: size, width: 'auto', display: 'block' }}
      priority
    />
  );
}
