#!/bin/bash
urls=(
  "234352-margot-robbie"
  "90633-gal-gadot"
  "505710-zendaya"
  "224513-ana-de-armas"
  "1373737-florence-pugh"
  "54693-emma-stone"
  "115440-sydney-sweeney"
  "27661-song-hye-kyo"
  "37625-jun-ji-hyun"
  "1041410-park-shin-hye"
  "1302834-bae-suzy"
  "1710008-kim-tae-ri"
  "2063950-iu"
  "2526474-han-so-hee"
  "1412421-kim-ji-won"
  "1782112-zhao-li-ying"
  "1620194-yang-mi"
  "1343938-liu-yi-fei"
  "81116-fan-bingbing"
  "1340626-yang-zi"
  "1419594-dilraba-dilmurat"
  "1431464-zhao-lu-si"
  "2326052-bai-lu"
)

for id in "${urls[@]}"; do
  name=$(echo "$id" | sed 's/^[0-9]*-//' | tr '-' ' ')
  path=$(curl -s "https://www.themoviedb.org/person/$id" | grep -o 'image\.tmdb\.org/t/p/w500/[^"]*' | head -1 | sed 's|image\.tmdb\.org/t/p/w500/||')
  echo "$name|$path"
done
