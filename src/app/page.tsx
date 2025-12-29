import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black">
      <main className="text-center">
        <Image
          src="/name-logo.png"
          alt="Tenpo"
          width={300}
          height={105}
          priority
          className="mx-auto dark:invert"
        />
        <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
          Coming Soon
        </p>
        <p className="mt-2 text-base text-zinc-500 dark:text-zinc-500">
          We&apos;re building something great. Check back soon.
        </p>
      </main>
    </div>
  );
}
