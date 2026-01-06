import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      <Image
        src="/images/app-background.png"
        alt="Tenpo"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center pt-96">
        <h1
          className="text-5xl text-white md:text-7xl"
          style={{ fontFamily: "var(--font-seriously-nostalgic)" }}
        >
          Coming Soon
        </h1>
      </div>
    </div>
  );
}
