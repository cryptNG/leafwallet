! name: Crime & Fraud Focus
! description: Boost crime, fraud, and enforcement content
! public: false
! author: you

! --- topical URL slugs (substring match on the whole URL) ---
/business/$boost=3
/crime/$boost=3
/fraud/$boost=3
/scam/$boost=3
/betrug/$boost=3
/kriminalitaet/$boost=3
/corruption/$boost=3
/money-laundering/$boost=3
/geldwaesche/$boost=3
/enforcement/$boost=2
/indictment/$boost=2
/court/$boost=2

! looser matches (no leading slash = matches anywhere in the URL)
fraud$boost=2
scam-alert$boost=2

! --- authoritative domains ---
$boost=3,site=bka.de
$boost=3,site=polizei.de
$boost=3,site=bafin.de
$boost=3,site=justice.gov
$boost=3,site=sec.gov
$boost=3,site=ftc.gov
$boost=3,site=europol.europa.eu
$boost=2,site=verbraucherzentrale.de
$boost=2,site=occrp.org

! --- push down the noise that crowds out real cases ---
$downrank=3,site=pinterest.com
$downrank=2,site=quora.com
