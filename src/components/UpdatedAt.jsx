"use client";

// we want to render a date in a human readable format based on the user's locale

export default function UpdatedAt({ date }) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  const a = new Intl.DateTimeFormat(navigator.language, options);

  return (
    <span>
      Actualizado às <time dateTime={date.toISOString()}>{a.format(date)}</time>
    </span>
  );
}
