import Link from "next/link";

import { listOfDates } from "../utils";

export default async function Page() {
  const dates = await listOfDates();

  return (
    <div>
      <h1>Notícias à data</h1>
      <br></br>
      <br></br>

      <main>
        {dates.map(date => (
          <Link key={date} href={`/date/${date}`}>
            <h2>{date}</h2>
          </Link>
        ))}
      </main>
    </div>
  );
}