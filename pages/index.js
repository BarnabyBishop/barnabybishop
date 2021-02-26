import Head from 'next/head';

const H2 = ({ children }) => (
  <h2 className="text-3xl font-light">{children}</h2>
);

const Content = ({ classes, children }) => (
  <div
    className={`
      h-auto
      w-4/5
      p-7
      rounded
      ml-5
      -mt-4
      shadow-heavy
      space-y-3
      ${classes}
      `}
  >
    {children}
  </div>
);

const Link = ({ href, classes, children }) => (
  <a
    href={href}
    className={`underline hover:no-underline ${classes}`}
    rel="noopener"
    target="_blank"
  >
    {children}
  </a>
);

export default function Home() {
  return (
    <div>
      <Head>
        <title>Barnaby Bishop</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700&display=swap"
          rel="stylesheet"
          async
        />
      </Head>

      <main
        className="
          max-w-screen-md
          mx-auto
          bg-white
          p-8
          m-8
          content-center
          space-y-4"
      >
        <img
          className="
                border-solid
                rounded-full 
                border-4
                border-black
                float-right"
          src="/profile.png"
          alt="me"
          width="128"
          height="128"
        />

        <h1 className="text-5xl font-bold">Barnaby Bishop</h1>
        <blockquote>Welcome to my very short website.</blockquote>

        <div className="space-y-12">
          <section>
            <H2>About</H2>
            <Content
              classes="
              bg-green-200
              "
            >
              <p>
                I'm an Engineering Manager who enjoys building cool things with
                fun people.
              </p>
              <p>
                It has been almost 20 years since I started working as a
                software developer (yikes!) but I've spent the last few years
                working with NodeJS &amp; ReactJS with deployment shenanigans in
                AWS.
              </p>
              <p>
                I've been managing engineering teams for five years, it has been
                fun.
              </p>
              <p>
                Once upon a time I worked in .Net but that was a long time ago
                in a galaxy far, far away.
              </p>
            </Content>
          </section>

          <section>
            <H2>Handy Links</H2>
            <Content classes="bg-blue-200">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://github.com/BarnabyBishop/"
                    classes="text-pink-500"
                  >
                    Github
                  </Link>{' '}
                  - come visit my land of unfinished projects.
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/barnaby-bishop-4a209299/"
                    classes="text-green-500"
                  >
                    Linked in
                  </Link>{' '}
                  - for business 💼
                </li>
                <li>
                  <Link
                    href="https://twitter.com/barneybishop"
                    classes="text-indigo-500"
                  >
                    Twitter
                  </Link>{' '}
                  - I never post on twitter so no reason to follow me to be
                  honest.
                </li>
                <li>
                  <Link href="/2019/index.html" classes="text-gray-500">
                    2019
                  </Link>{' '}
                  - previous version of this site.
                </li>
              </ul>
            </Content>
          </section>

          <section>
            <H2>Personal Projects</H2>
            <Content classes="bg-purple-200">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://github.com/BarnabyBishop/bananapark"
                    classes="text-pink-500"
                  >
                    bananapark.com.au
                  </Link>{' '}
                  - Static rendered e-commerce site built before it was cool!
                  Using GatsbyJS
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/barnaby-bishop-4a209299/"
                    classes="text-green-500"
                  >
                    Noted
                  </Link>{' '}
                  - A note taking/todo app I built and used day-to-day when I
                  started working as an Engineering Manager.
                </li>
                <li>
                  <Link
                    href="https://twitter.com/barneybishop"
                    classes="text-indigo-500"
                  >
                    barnabybishop.com
                  </Link>{' '}
                  - This website
                </li>
                <li>
                  <Link
                    href="https://twitter.com/barneybishop"
                    classes="text-indigo-500"
                  >
                    barnabybishop.com
                  </Link>{' '}
                  - Previous iteration of this website
                </li>
                <li>
                  <Link
                    href="https://barnabybishop.com/2019"
                    classes="text-gray-500"
                  >
                    Planet Codepen
                  </Link>{' '}
                  - Some Codepen CSS planets inspired by the 2019 version of
                  this website.
                </li>
              </ul>
            </Content>
          </section>

          <section>
            <H2>About This Site</H2>
            <Content
              classes="
              bg-red-200
              space-y-3"
            >
              <p>
                <span>Built with </span>
                <Link href="https://nextjs.org/" classes="text-green-500">
                  NextJS
                </Link>
                <span> and </span>
                <Link href="https://nextjs.org/" classes="text-purple-500">
                  Tailwind CSS
                </Link>
                .
              </p>
              <p>
                NextJS is a tad overkill for this simple site but I wanted to
                play with NextJS'&nbsp;
                <Link
                  href="https://nextjs.org/docs/basic-features/pages#static-generation-recommended"
                  classes="text-blue-500"
                >
                  static generation
                </Link>
                . Plus I stopped any Javascript coming to the client for you
                enjoyment.
              </p>
            </Content>
          </section>
        </div>
      </main>
    </div>
  );
}
