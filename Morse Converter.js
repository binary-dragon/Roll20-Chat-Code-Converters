// ----------------------------------------
// Morse Converter - For roll20 chat v1.4
// ----------------------------------------
// Last updated October 18th 2026
// Use this script to convert text to Morse in roll20 chat. And vice versa.
// You can do so publicly and privately both ways.
// ------------------------------------------------------------------------------------------------
// This script was built by Paris Arrowsmith for the Cyberpunk Red Actual Play
// No Latency. Find out more about No Latency and our other homebrew offerings at
// www.patreon.com/nolatency
// www.nolatencypodcast.com
// Althought this roll20 mod is free, your support in any capacity would be appriciated choom.
// -------------------------------------------------------------------------------------------------
// To start using this in roll20, install as a mod script (this will require API access/Roll20 subscription)
// Once installed, type '!hexhelp' in chat to get instuctions.  
// `!xtm` [Text] - Converts Text to Binary, posts result in public chat.  
// `!mtx` [Hex] - Converts Binary to text, posts result in public chat.  
// `!xtmw` [Text] - Converts Text to Binary, whispers result to user.  
// `!mtxw` [Hex] - Converts Binary to text, whispers result to user.  

on("chat:message", function(msg) {
    if (msg.type !== "api") return;

    // SECTION 1 — MORSE CHARACTER TABLE

    var MORSE = {
        A: ".-", B: "-...", C: "-.-.", D: "-..",
        E: ".", F: "..-.", G: "--.", H: "....",
        I: "..", J: ".---", K: "-.-", L: ".-..",
        M: "--", N: "-.", O: "---", P: ".--.",
        Q: "--.-", R: ".-.", S: "...", T: "-",
        U: "..-", V: "...-", W: ".--", X: "-..-",
        Y: "-.--", Z: "--..",

        0: "-----", 1: ".----", 2: "..---",
        3: "...--", 4: "....-", 5: ".....",
        6: "-....", 7: "--...", 8: "---..",
        9: "----.",

        ".": ".-.-.-",
        ",": "--..--",
        "?": "..--..",
        "!": "-.-.--",
        "'": ".----.",
        '"': ".-..-.",
        "/": "-..-.",
        "(": "-.--.",
        ")": "-.--.-",
        "&": ".-...",
        ":": "---...",
        ";": "-.-.-.",
        "=": "-...-",
        "+": ".-.-.",
        "-": "-....-",
        "_": "..--.-",
        "@": ".--.-."
    };

    var REVERSE = {};
    Object.keys(MORSE).forEach(function(key) {
        REVERSE[MORSE[key]] = key;
    });

    // SECTION 2 — HTML SAFETY

    function escapeHtml(s) {
        return String(s).replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // SECTION 3 — HELP COMMAND (PUBLIC)

    if (msg.content.trim().toLowerCase() === "!morsehelp") {
        var helpCard =
            '<div style="background:#090d14;' +
            'border:1px solid #00d9ff;padding:12px;' +
            'color:#00f0ff;font-family:monospace;">' +
            '<div style="color:#ff3155;font-size:11px;">' +
            'NLS3 // MORSE CONVERTER - v1.4</div>' +
            '<div style="border-bottom:1px solid #263849;' +
            'padding:6px 0;margin-bottom:8px;">' +
            'MORSE TRANSLATION SYSTEM // HELP</div>' +

            '<div style="color:#00f0ff;padding:4px 0;">' +
            'TEXT TO MORSE</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            '!xtm HELLO<br>' +
            'Converts readable text into Morse code // ALL USERS.' +
            '</div>' +

            '<div style="color:#00f0ff;padding:4px 0;">' +
            'MORSE TO TEXT</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            '!mtx .... . .-.. .-.. ---<br>' +
            'Converts Morse code into readable text // ALL USERS.' +
            '</div>' +

            '<div style="color:#00f0ff;padding:4px 0;">' +
            'WHISPER CONVERSION MODE<br>// SINGLE USER MODE</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            '!xtmw HELLO<br>' +
            '!mtxw .... . .-.. .-.. ---<br>' +
            'Converts + Whispers result to user <br> // PRIVATE' +
            '</div>' +

            '<div style="color:#00f0ff;padding:4px 0;">' +
            'MESSAGE FORMAT</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            'SPACE = NEXT LETTER<br>' +
            '/ = NEXT WORD<br>' +
            'Supports letters, numbers and common punctuation.' +
            '</div>' +

            '<div style="border-top:1px solid #263849;' +
            'padding-top:8px;color:#7895a8;font-size:10px;">' +
            '!>> MORSE CONVERTER IS NOT RESPONSIBLE FOR WHAT YOU DISCOVER. USE AT YOUR OWN RISK.' +
            '</div></div>';

        sendChat("MorseDecoder", helpCard);
        return;
    }

    // SECTION 4 — COMMAND ROUTING

    var match = msg.content.match(
        /^!(mtxw|xtmw|mtx|xtm)(?:\s+([\s\S]*))?$/i
    );

    if (!match) return;

    var mode = match[1].toLowerCase();
    var input = match[2] || "";
    var isWhisper = mode === "mtxw" || mode === "xtmw";
    var isTextToMorse = mode === "xtm" || mode === "xtmw";
    var output = "";
    var error = "";

    // SECTION 5 — PUBLIC / PRIVATE OUTPUT

    function sendResult(html) {
        if (isWhisper) {
            var player = getObj("player", msg.playerid);
            var name = player ? player.get("displayname") : msg.who;
            name = String(name).replace(/"/g, "");

            sendChat(
                "MorseDecoder",
                '/w "' + name + '" ' + html
            );
        } else {
            sendChat("MorseDecoder", html);
        }
    }

    // SECTION 6 — CONVERSION ENGINE

    if (!input.trim()) {
        error = "NO DATA RECEIVED";

    } else if (isTextToMorse) {

        // TEXT → MORSE
        var words = input.toUpperCase()
            .trim()
            .split(/\s+/);

        var encoded = [];

        words.forEach(function(word) {
            var letters = [];

            word.split("").forEach(function(c) {
                if (MORSE[c]) {
                    letters.push(MORSE[c]);
                } else {
                    error = "UNSUPPORTED CHARACTER: " + c;
                }
            });

            encoded.push(letters.join(" "));
        });

        if (!error) {
            output = encoded.join(" / ");
        }

    } else {

        // MORSE → TEXT
        // Normalize Unicode dashes and extra spaces.
        var clean = input.trim()
            .replace(/[–—−]/g, "-")
            .replace(/\s*\/\s*/g, " / ")
            .replace(/\s+/g, " ");

        var words = clean.split(" / ");
        var decoded = [];

        words.forEach(function(word) {
            var letters = [];

            word.split(" ").forEach(function(code) {
                if (Object.prototype.hasOwnProperty.call(
                    REVERSE, code
                )) {
                    letters.push(REVERSE[code]);
                } else {
                    error = "INVALID MORSE SEQUENCE: " + code;
                }
            });

            decoded.push(letters.join(""));
        });

        if (!error) {
            output = decoded.join(" ");
        }
    }

    // SECTION 7 — RESULT CARD

    var color = error ? "#ff3155" : "#00f0ff";
    var result = error || output;

    var label = isTextToMorse
        ? "TEXT → MORSE"
        : "MORSE → TEXT";

    var card =
        '<div style="background:#090d14;' +
        'border:1px solid #00d9ff;padding:12px;' +
        'color:#00f0ff;font-family:monospace;">' +
        '<div style="color:#ff3155;font-size:11px;">' +
        'NLS3 // MORSE CONVERTER - v1.0</div>' +
        '<div style="border-bottom:1px solid #263849;' +
        'padding:6px 0;margin-bottom:8px;">' +
        'MORSE TRANSLATION SYSTEM</div>' +
        '<div style="color:#7895a8;font-size:10px;">' +
        label + (isWhisper ? " // PRIVATE" : " // PUBLIC") +
        '</div>' +
        '<div style="color:' + color +
        ';white-space:pre-wrap;overflow-wrap:anywhere;' +
        'padding-top:8px;">' + escapeHtml(result) +
        '</div>' +
        '<div style="border-top:1px solid #263849;' +
        'margin-top:10px;padding-top:8px;' +
        'color:#7895a8;font-size:10px;">' +
        'REMEMBER: TYPE !morsehelp FOR INSTRUCTIONS' +
        '</div></div>';

    sendResult(card);
});
