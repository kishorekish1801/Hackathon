"""AquaWatch AI - Language Service.

Provides text preprocessing, normalization, and hackathon-friendly
bilingual translation (Tamil + Tanglish -> English concepts)
to support transparent categorization.
"""

import re
import unicodedata

# Compound and multi-word Tamil expressions (highest precision)
TAMIL_COMPOUND_PHRASES: dict[str, str] = {
    "சாக்கடை அடைப்பு": "drainage blocked drain clogged sewage",
    "குடிநீர் வரவில்லை": "no drinking water supply stopped",
    "தண்ணீர் வரவில்லை": "no water supply stopped not getting water",
    "தண்ணி வரல": "no water supply stopped",
    "குழாய் உடைப்பு": "main pipeline burst broken pipe damaged",
    "பைப் உடைப்பு": "main pipeline burst broken pipe",
    "குழாய் ஒழுகுது": "pipe leak leaking dripping",
    "தொட்டி நிரம்பி வழிகிறது": "tank overflow overflowing continuously",
    "தொட்டி நிரம்பி": "tank overflow overflowing",
    "கழிவு நீர்": "sewage drainage water",
    "அழுக்கு நீர்": "dirty contaminated water",
    "மஞ்சள் நிற நீர்": "dirty yellow contaminated water",
    "கருப்பு நிற நீர்": "dirty black contaminated water",
    "சாலை வெள்ளம்": "road is flooding flooded street",
}

# Common Tamil (Unicode Script) keywords mapped to English concepts
TAMIL_SCRIPT_MAPPING: dict[str, str] = {
    # Water & Supply
    "தண்ணீர்": "water",
    "தண்ணி": "water",
    "குடிநீர்": "drinking water",
    "நீர்": "water",
    "வரவில்லை": "no water supply stopped",
    "வரல": "no water supply stopped",
    "இல்லை": "no supply",
    "வழங்கப்படவில்லை": "no water supply",
    # Pipe & Plumbing
    "குழாய்": "pipe tap",
    "பைப்ப": "pipe",
    "பைப்": "pipe",
    "குழாயில்": "in pipe",
    "உடைந்தது": "broken burst",
    "உடைந்து": "broken burst",
    "உடைப்பு": "burst broken damaged",
    "வெடித்தது": "burst explosion damaged",
    "வெடிப்பு": "burst damaged",
    "ஒழுகுது": "leaking dripping",
    "ஒழுகுதல்": "leak leaking",
    "கசிகிறது": "leaking seepage",
    "சொட்டுது": "dripping drip",
    "சொட்டுகிறது": "dripping drip",
    # Tap
    "திறந்த": "open",
    "மூடவில்லை": "not closed running wastage",
    # Tank
    "தொட்டி": "tank",
    "வாட்டர் டேங்க்": "water tank",
    "நிரம்பி": "full overflowing",
    "வழிகிறது": "overflowing spilling",
    "வழிகின்றது": "overflowing spilling",
    # Contamination & Cleanliness
    "அழுக்கு": "dirty contaminated",
    "கழிவு": "sewage",
    "துர்நாற்றம்": "bad smell foul",
    "நாற்றம்": "foul smell",
    "புழு": "worms contamination",
    "மஞ்சள்": "yellow dirty",
    "கருப்பு": "black dirty",
    "மண்": "muddy dirty",
    "கலங்கலாக": "muddy contaminated",
    # Drainage
    "சாக்கடை": "drainage sewage drain",
    "கால்வாய்": "drain canal",
    "அடைப்பு": "blocked clogging",
    "தேங்கி": "stagnant water blocked",
    "நிற்கிறது": "stagnant",
    # Wastage
    "வீணாகிறது": "wastage wasted",
    "வீணாக": "wastage",
    "வீணாகுது": "wastage running",
    # Road / Flood
    "சாலை": "road street",
    "தெரு": "street road",
    "வெள்ளம்": "flooding flood",
    "மூழ்கியது": "flooded submerged",
}

# Common Tanglish (Tamil written in English alphabet) mapped to English concepts
TANGLISH_MAPPING: dict[str, str] = {
    "thanni": "water",
    "thanneer": "water",
    "thani": "water",
    "kudineer": "drinking water",
    "kuzhai": "pipe tap",
    "kulaai": "pipe tap",
    "kulla": "pipe tap",
    "pipe-la": "in pipe",
    "pipela": "in pipe",
    "udanjiduchu": "broken burst damaged",
    "odanjiduchu": "broken burst damaged",
    "odanju": "broken burst",
    "udaipu": "burst broken damaged",
    "vedichiduchu": "burst explosion",
    "ozhukudhu": "leaking dripping",
    "ozhukuthu": "leaking dripping",
    "kasidhal": "leak leaking",
    "kasithu": "leaking seepage",
    "sottudhu": "dripping drip",
    "sottuthu": "dripping drip",
    "thotti": "tank",
    "nerambi": "full overflowing",
    "valiyudhu": "overflowing spilling",
    "valiyuthu": "overflowing spilling",
    "azhukku": "dirty contamination",
    "azhuku": "dirty contamination",
    "saakadai": "drainage sewage drain",
    "saakada": "drainage sewage drain",
    "adaippu": "blocked clogging",
    "adaichu": "blocked clogging",
    "theangi": "stagnant water blocked",
    "theanguthu": "stagnant water",
    "varala": "no water supply stopped",
    "varavillai": "no water supply stopped",
    "illai": "no water none",
    "veenaguthu": "wastage wasted",
    "veenavuthu": "wastage wasted",
    "vellam": "flood flooding",
    "saalai": "road street",
    "theru": "street road",
}


def clean_text(text: str | None) -> str:
    """Lowercase, strip extraneous whitespace, and clean punctuation while preserving alphanumeric tokens."""
    if not text:
        return ""

    # Normalize unicode (NFC)
    normalized = unicodedata.normalize("NFC", text.strip().lower())

    # Replace punctuation characters with space (except unicode characters for Tamil and alphanumeric)
    # Keep Tamil block \u0B80-\u0BFF and standard ASCII alphanumerics
    cleaned = re.sub(r"[^\w\s\u0B80-\u0BFF]", " ", normalized)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def normalize_and_translate(text: str | None) -> str:
    """Normalize text and translate Tamil script or Tanglish expressions into English concepts.

    Preserves original English words while appending translated equivalents.
    Safe fallback: returns empty string if text is None or empty.
    """
    if not text:
        return ""

    cleaned = clean_text(text)
    if not cleaned:
        return ""

    translated_tokens: list[str] = []

    # 1. Check compound Tamil phrases first
    for phrase, en_concept in TAMIL_COMPOUND_PHRASES.items():
        if phrase in cleaned:
            translated_tokens.append(en_concept)

    # 2. Process individual tokens
    tokens = cleaned.split()
    for token in tokens:
        translated_tokens.append(token)
        if token in TAMIL_SCRIPT_MAPPING:
            translated_tokens.append(TAMIL_SCRIPT_MAPPING[token])
        elif token in TANGLISH_MAPPING:
            translated_tokens.append(TANGLISH_MAPPING[token])

    result = " ".join(translated_tokens)
    return re.sub(r"\s+", " ", result).strip()
