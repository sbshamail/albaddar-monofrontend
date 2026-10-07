import Image from "next/image";
import logo from "../../../shared/public/images/logo.webp";
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      <div className="pointer-events-none fixed top-1/2 z-0 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[5px] opacity-20">
        <Image
          src={logo}
          height={1000}
          width={1000}
          className="w-full"
          alt="logo"
        />
      </div>
      <div className="relative z-10 h-svh overflow-y-auto opacity-80">
        {children}
      </div>
    </div>
  );
}
