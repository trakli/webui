// ISO 3166-1 alpha-2 codes; names are resolved via Intl.DisplayNames so we
// don't hard-code a localized name table.
const COUNTRY_CODES = (
  'AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ ' +
  'CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM ' +
  'FR GA GB GD GE GH GM GN GQ GR GT GW GY HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG ' +
  'KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MR ' +
  'MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PT PW PY QA RO RS RU ' +
  'RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV ' +
  'TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW'
).split(' ');

let cache: { code: string; name: string }[] | null = null;

export function getCountries(): { code: string; name: string }[] {
  if (cache) return cache;
  let display: Intl.DisplayNames | null = null;
  try {
    display = new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    display = null;
  }
  cache = COUNTRY_CODES.map((code) => ({ code, name: display?.of(code) || code })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return cache;
}
