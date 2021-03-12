import Head from 'next/head';

const H2 = ({ children }) => (
  <h2 className="text-3xl font-light">{children}</h2>
);

const Content = ({ classes, children }) => (
  <div
    className={`
      h-auto
      
      p-7
      rounded
      m-3
      sm:mx-7
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
          max-w-2xl
          mx-auto
          bg-white
          p-4
          sm:p-8
          m-8
          content-center
          space-y-4"
      >
        <header className="flex ml-5 mr-7 justify-between">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold">Barnaby Bishop</h1>
            <blockquote>Welcome to my very short website.</blockquote>
          </div>

          <img
            className="
                profile-picture
                border-solid
                rounded-full 
                border-4
                border-black"
            src="/profile.jpg"
            alt="me"
            width="128"
            height="128"
          />
        </header>

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
                working with NodeJS, ReactJS and a fair bit of AWS.
              </p>
              <p>
                I've been managing engineering teams for five years and have
                been lucky to work on a lot of amazing projects with amazing
                people.
              </p>
              <p>
                Once upon a time I worked in .Net but that was a long time ago.
              </p>
            </Content>
          </section>

          <section>
            <H2>Handy Links</H2>
            <Content classes="bg-blue-200">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://www.linkedin.com/in/barnaby-bishop-4a209299/"
                    classes="text-red-500"
                    target="_blank"
                    rel="noopener"
                  >
                    LinkedIn
                  </Link>{' '}
                  - for business 💼
                </li>
                <li>
                  <Link
                    href="https://github.com/BarnabyBishop/"
                    classes="text-pink-500"
                    target="_blank"
                    rel="noopener"
                  >
                    Github
                  </Link>{' '}
                  - come visit my land of unfinished projects.
                </li>
                <li>
                  <Link
                    href="https://twitter.com/barneybishop"
                    classes="text-indigo-500"
                    target="_blank"
                    rel="noopener"
                  >
                    Twitter
                  </Link>{' '}
                  - I never post on twitter so no reason to follow me to be
                  honest.
                </li>
                <li>
                  <Link
                    href="/2019/index.html"
                    classes="text-gray-500"
                    target="_blank"
                    rel="noopener"
                  >
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
                    href="https://github.com/BarnabyBishop/noted"
                    classes="text-green-500"
                    target="_blank"
                    rel="noopener"
                  >
                    Noted
                  </Link>{' '}
                  - A note taking/todo app I built and used day-to-day when I
                  started working as an Engineering Manager. Build with NodeJS,
                  React, Postgres and half implemented with GraphQL.
                </li>
                <li>
                  <Link
                    href="https://github.com/BarnabyBishop/barnabybishop"
                    classes="text-red-500"
                    target="_blank"
                    rel="noopener"
                  >
                    barnabybishop.com
                  </Link>{' '}
                  - This website. NextJS &amp; TailwindCSS.
                </li>
                <li>
                  <Link
                    href="https://github.com/BarnabyBishop/barnabybishop/tree/2019"
                    classes="text-indigo-500"
                    target="_blank"
                    rel="noopener"
                  >
                    barnabybishop.com (2019)
                  </Link>{' '}
                  - Previous iteration of this website. No libraries, just plain
                  HTML, CSS &amp; Javascript.
                </li>
                <li>
                  <Link
                    href="https://codepen.io/collection/DQEqjk"
                    classes="text-gray-500"
                    target="_blank"
                    rel="noopener"
                  >
                    Space Codepen Collection
                  </Link>{' '}
                  - Some Codepens for prototyping ideas for the 2019 version of
                  this site.
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
                <Link
                  href="https://nextjs.org/"
                  classes="text-green-500"
                  target="_blank"
                  rel="noopener"
                >
                  NextJS
                </Link>
                <span> and </span>
                <Link href="https://tailwindcss.com/" classes="text-purple-500">
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
