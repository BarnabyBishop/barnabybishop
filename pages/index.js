import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Header stuff</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        className="
          max-w-screen-lg
          mx-auto
          bg-white
          shadow-md
          rounded-xl
          p-8
          m-8
          content-center
          space-y-5"
      >
        <h1 className="text-5xl">Barnaby Bishop</h1>
        <blockquote className="italic">
          Engineering Manager building sustainable technology solutions
        </blockquote>
        <div>
          Here is some text about a dude who does things, and sometimes, some{' '}
          <em>stuff.</em>
        </div>
      </main>
    </div>
  );
}
