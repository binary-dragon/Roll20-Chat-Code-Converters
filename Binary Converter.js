// ----------------------------------------
// Binary Converter - For roll20 chat v1.6
// ----------------------------------------
// Last updated October 18th 2026
// Use this script to convert text to binary in roll20 chat. And vice versa.
// You can do so publicly and privateely both ways.
// ------------------------------------------------------------------------------------------------
// This script was built by Paris Arrowsmith for the Cyberpunk Red Actual Play
// No Latency. Find out more about No Latency and our other homebrew offerings at
// www.patreon.com/nolatency
// www.nolatencypodcast.com
// Althought this roll20 mod is free, your support in any capacity would be appriciated choom.
// -------------------------------------------------------------------------------------------------
// To start using this in roll20, install as a mod script (this will require API/roll20 subscription access)
// Once installed, type `!binaryhelp` in chat to get instuctions.  
// `!xtb` [Text] - Converts Text to Binary, posts result in public chat.  
// `!btx` [Binary] - Converts Binary to text, posts result in public chat.  
// `!xtbw` [Text] - Converts Text to Binary, whispers result to user.  
// `!btxw` [Binary] - Converts Binary to text, whispers result to user.  

on("chat:message", function(msg) {
    if (msg.type !== "api") return;

    // HELP COMMAND — PUBLIC
    if (msg.content.trim().toLowerCase() === "!binaryhelp") {
        var helpCard =
            '<div style="background:#090d14;' +
            'border:1px solid #00d9ff;padding:12px;' +
            'color:#00f0ff;font-family:monospace;">' +
            '<div style="color:#ff3155;font-size:11px;">' +
            'NLS3 // BINARY CONVERTER - v2.1</div>' +
            '<div style="border-bottom:1px solid #263849;' +
            'padding:6px 0;margin-bottom:8px;">' +
            'BINARY TRANSLATION SYSTEM // HELP</div>' +
            '<div style="color:#00f0ff;padding:4px 0;">' +
            'TEXT TO BINARY</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            '!xtb HELLO<br>' +
            'Converts readable text into binary code // ALL USERS.' +
            '</div>' +
            '<div style="color:#00f0ff;padding:4px 0;">' +
            'BINARY TO TEXT</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            '!btx 01001000<br>' +
            'Converts binary code into readable text // ALL USERS.' +
            '</div>' +
            '<div style="color:#00f0ff;padding:4px 0;">' +
            'WHISPER CONVERSION MODE<br>// SINGLE USER MODE</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            '!xtbw HELLO<br>' +
            '!btxw 01001000<br>' +
            'Converts + Whispers result to user <br> // PRIVATE' +
            '</div>' +
            '<div style="border-top:1px solid #263849;' +
            'padding-top:8px;color:#7895a8;font-size:10px;">' +
            '!>> BINARY CONVERTER IS NOT RESPONSIBLE FOR WHAT YOU DISCOVER. USE AT YOUR OWN RISK.' +
            '</div></div>';

        sendChat("BinaryDecoder", helpCard);
        return;
    }

    var match = msg.content.match(
        /^!(btxw|xtbw|btx|xtb)(?:\s+([\s\S]*))?$/i
    );
    if (!match) return;

    var mode = match[1].toLowerCase();
    var input = match[2] || "";
    var isWhisper = mode === "btxw" || mode === "xtbw";
    var isTextToBinary = mode === "xtb" || mode === "xtbw";
    var output = "";
    var error = "";

    function escapeHtml(s) {
        return s.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
    }

    function sendResult(html) {
        if (isWhisper) {
            var player = getObj("player", msg.playerid);
            var name = player ? player.get("displayname") : msg.who;
            name = String(name).replace(/"/g, "");
            sendChat("BinaryDecoder", '/w "' + name + '" ' + html);
        } else {
            sendChat("BinaryDecoder", html);
        }
    }

    if (!input.trim()) {
        error = "NO DATA RECEIVED";
    } else if (isTextToBinary) {
        output = input.split("").map(function(c) {
            var n = c.charCodeAt(0);
            if (n > 127) return "?";
            return n.toString(2).padStart(8, "0");
        }).join(" ");
    } else {
        var bits = input.replace(/\s+/g, "");

        if (!/^[01]+$/.test(bits) || bits.length % 8 !== 0) {
            error = "INVALID BINARY — USE COMPLETE 8-BIT BYTES";
        } else {
            for (var i = 0; i < bits.length; i += 8) {
                var n = parseInt(bits.slice(i, i + 8), 2);

                if (n > 127) {
                    error = "ASCII TEST MODE — BYTE OUT OF RANGE";
                    break;
                }
                output += String.fromCharCode(n);
            }
        }
    }

    var color = error ? "#ff3155" : "#00f0ff";
    var result = error || output;
    var label = isTextToBinary
        ? "TEXT → BINARY"
        : "BINARY → TEXT";

    var card =
        '<div style="background:#090d14;' +
        'border:1px solid #00d9ff;padding:12px;' +
        'color:#00f0ff;font-family:monospace;">' +
        '<div style="color:#ff3155;font-size:11px;">' +
        'NLS3 // BINARY CONVERTER - v2.1</div>' +
        '<div style="border-bottom:1px solid #263849;' +
        'padding:6px 0;margin-bottom:8px;">' +
        'BINARY TRANSLATION SYSTEM</div>' +
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
        'REMEMBER: TYPE !binaryhelp FOR INSTRUCTIONS' +
        '</div></div>';

    sendResult(card);
});

