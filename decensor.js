var replace = `fuck
fucks
pornstar
sucked
bisexual
cumdump
vagina
crap
shitload
shithole
stupidness
fuckery
retardation
horshit
smut
bitching
stupids
bumfucks
bumblefuck
fuckin
fucktard
licked
crotch
hitler
crotchless
incestuous
batshit
penis
masturbate
Goddamn
enslave
slavery
socked
enslavement
murderess
molest
molestation
dicks
cockblock
scrape
perverts
cock
stupidest
boobs
stupidity
slavery
sadist
stupid
trashest
fag
bitchybitchy
erotic
cockroach
tits
murdering
bitchy
trashing
trashiest
bullshitting
cocky
cockiness
murderous
Hancock
trashy
trashcan
horny
suicide
retard
clicked
incestual
basement
rapes
thorny
virgin
murderers
murderer
murder
virgins
assholes
rapest
whore
slut
bitchest
raped
morons
amusement
cocks
incest
fingerfuck
molested
murders
trash
cockroaches
monsterfucker
intersex
Futanari
trashhero
fucked
motherfucker
bitches
bastard
fucking
hell
nasty
scum
pissed
bastards
raping
bitch
shit
bitch
bastard
fucker
bitch
scumbag
shitless
ass
badass
shit
virginity
slave
pervert
futanari
sex
futa
Impregnating
Impregnated
trashes
murderfest
Impregnate
rapey
retards
fuckk
Cunnilingus
slaves
sexual
edgefuckfests
anal
stupider
assed
Intercourse
Fallatio
Handjob
Masturbation
Masturbating
Orgy
Prostitutes
rape
enslaved
perverted
stupidly
prostitution
sexually
bullshits
shits
porn
dick
shitty
dicking
bullshit
sexuality
retardedness
Futadomworld
asshole
pussy
sexy
murdered
cocktail
trAshed
virginal
retarded
hentai
dogshit
fricking
frick
fricker
webtoon`
  .toLowerCase()
  .split("\n")
  .map((a) => [
    new RegExp(
      `(?<=[^a-z0-9@#$%^&\\*x♥]|^)${a
        .split("")
        .map((e) => `[${e}%#*♥]`)
        .join(" ?")}(?=[^a-z0-9@#$%^&\\*x♥]|$)`,
      "ig"
    ),
    `${a}`,
  ])

const replacementLookup = Object.fromEntries(
  replace.map(([regex, replacement]) => [regex.source, replacement])
)
const combinedRegex = new RegExp(
  replace.map(([regex]) => `(${regex.source})`).join("|"),
  "gi"
)
//log(combinedRegex)
replace = []
//replace.push([/([a-z]+)\.([a-z]+)\.(?:([a-z]+)\.)?(?:([a-z]+)\.)?(?:([a-z]+)\.)?(?:([a-z]+)\.)?(?:([a-z]+)\.)?([a-z]+)/gi, "$1$2$3$4$5$6$7$8"])
replace.push([/(?<=^|[^\d\w])\*(\w+( \w+)*)\*(?=[^\w\d]|$)/gi, "$1"])
replace.push([/what( ?ever)? the duck/gi, "what$1 the fuck"])
replace.push([/duck(ed)? up/gi, "fuck$1 up"])
replace.push([/R4P3/gi, "rape"])
// replace.push([/(?<!\w)minf\*+k(s|(?:ed|er|ing)(?:s)?|)(?!\w)/gi, "mindfuck$1"]) - broken???
replace.push([/(?<!\w)minf\*+ks(?!\w)/gi, "mindfucks"])
replace.push([/(?<!\w)asspull(?!\w)/gi, "asshole"])
replace.push([/\bfriggin\b/gi, "fucking"])
replace.push([/(?<!\w)fupping(?!\w)/gi, "fucking"])
replace.push([/.*░.*/gi, ""])
replace.push([/.*THIS IS BOB.*/gi, ""])
replace.push([/F\**CK/gi, "fuck"])
replace.push([/.*\@\#\$\&.*/gi, ""])
replace.push([/(?<!\w)friking?(?!\w)/gi, "fucking"])
replace.push([/(?<!\w)shyt(?!\w)/gi, "shit"])
replace.push([/(?<!\w)arse?(?!\w)/gi, "ass"])
replace.push([/f\*ing(?!\w)/gi, "fucking"])
replace.push([/motherf\*(?!\w)/gi, "motherfucker"])
replace.push([/b\*\*\*/gi, "bitch"])
replace.push([
  /(?<=[^a-z0-9@#$%^&\*x♥]|^)[h%#*♥] ?[e%#*♥] ?[c%#*♥] ?[k%#*♥](?=[^a-z0-9@#$%^&\*x♥]|$)/gi,
  "hell",
])
replace.push([/(?<!\w)prosti\*ion(?!\w)/gi, "prostitution"])
replace.push([/(?<!\w)Ayaponzu\*(?!\w)/gi, "Ayaponzu"])
replace.push([/(?<!\w)DECO\*27(?=[^\w\d]|$)/gi, "DECO27"])
replace.push([/(?<!\w)freakin'?(?!\w)/gi, "fucking"])
replace.push([/(?<!\w)(?:pron|p0rn)(?!\w)/gi, "porn"])
replace.push([/(?<!\w)fricking(?!\w)/gi, "fucking"])
replace.push([/(?<!\w)frick(?!\w)/gi, "fuck"])
replace.push([/(?<!\w)fricker(?!\w)/gi, "fucker"])

function decensor(text) {
  text = text.replace(combinedRegex, (match) => {
    for (const [source, replacement] of Object.entries(
      replacementLookup
    )) {
      if (new RegExp(source, "i").test(match)) {
        return replacement
      }
    }
    return match // Fallback if no replacement found
  })
  for (var r of replace) {
    text = text.replace(r[0], r[1])
  }
  return text
}
window.decensor = decensor
