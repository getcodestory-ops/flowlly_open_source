export default function getCurrentDateFormatted(): string {
  const date = new Date();
  let dd: number | string = date.getDate();
  let mm: number | string = date.getMonth() + 1; // January is 0!
  const yyyy: number = date.getFullYear();

  if (dd < 10) {
    dd = "0" + dd;
  }

  if (mm < 10) {
    mm = "0" + mm;
  }

  return `${yyyy}-${mm}-${dd}`;
}
