
export default function UpdatedAt({ date }) {

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Lisbon'
  };

  const a = new Intl.DateTimeFormat("pt-PT", options);

  return (
    <span>
      Actualizado às <time dateTime={date.toISOString()}>{a.format(date)}</time>
    </span>
  );
}
