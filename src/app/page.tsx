import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      <Image
        src="/app-background.png"
        alt="Tenpo"
        fill
        priority
        className="object-cover"
      />
    </div>
  );
}
