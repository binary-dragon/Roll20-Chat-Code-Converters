// ----------------------------------------
// Hex Converter - For roll20 chat v1.6
// ----------------------------------------
// Last updated October 18th 2026
// Use this script to convert text to hexadecimal in roll20 chat. And vice versa.
// You can do so publicly and privately both ways.
// ------------------------------------------------------------------------------------------------
// This script was built by Paris Arrowsmith for the Cyberpunk Red Actual Play
// No Latency. Find out more about No Latency and our other homebrew offerings at
// www.patreon.com/nolatency
// www.nolatencypodcast.com
// Althought this roll20 mod is free, your support in any capacity would be appriciated choom.
// -------------------------------------------------------------------------------------------------
// To start using this in roll20, install as a mod script (this will require API/roll20 subscription access)
// Once installed, type '!hexhelp' in chat to get instuctions. 
// * PUBLIC COMMANDS
// !xth HELLO
// !htx 48 45 4C 4C 4F
//
// PRIVATE COMMANDS
// !xthw HELLO
// !htxw 48 45 4C 4C 4F
//
// HELP
// !hexhelp
//
// Standard ASCII (0-127).
//

on("chat:message", function(msg) {
    if (msg.type !== "api") return;

    // HELP COMMAND — PUBLIC
    if (msg.content.trim().toLowerCase() === "!hexhelp") {
        var helpCard =
            '<div style="background:#090d14;' +
            'border:1px solid #00d9ff;padding:12px;' +
            'color:#00f0ff;font-family:monospace;">' +
            '<div style="color:#ff3155;font-size:11px;">' +
            'NLS3 // HEX CONVERTER - v1.6</div>' +
            '<div style="border-bottom:1px solid #263849;' +
            'padding:6px 0;margin-bottom:8px;">' +
            'HEXADECIMAL TRANSLATION SYSTEM // HELP</div>' +
            '<div style="color:#00f0ff;padding:4px 0;">' +
            'TEXT TO HEX</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            '!xth HELLO<br>' +
            'Converts readable text into hexadecimal code // ALL USERS.' +
            '</div>' +
            '<div style="color:#00f0ff;padding:4px 0;">' +
            'HEX TO TEXT</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            '!htx 48 45 4C 4C 4F<br>' +
            'Converts hexadecimal code into readable text // ALL USERS.' +
            '</div>' +
            '<div style="color:#00f0ff;padding:4px 0;">' +
            'WHISPER CONVERSION MODE<br>// SINGLE USER MODE</div>' +
            '<div style="color:#d9ffff;padding-bottom:8px;">' +
            '!xthw HELLO<br>' +
            '!htxw 48 45 4C 4C 4F<br>' +
            'Converts + Whispers result to user <br> // PRIVATE' +
            '</div>' +
            '<div style="border-top:1px solid #263849;' +
            'padding-top:8px;color:#7895a8;font-size:10px;">' +
            '!>> HEX CONVERTER IS NOT RESPONSIBLE FOR WHAT YOU DISCOVER. USE AT YOUR OWN RISK.' +
            '</div></div>';

        sendChat("HexDecoder", helpCard);
        return;
    }

    // COMMAND ROUTING
    var match = msg.content.match(
        /^!(htxw|xthw|htx|xth)(?:\s+([\s\S]*))?$/i
    );
    if (!match) return;

    var mode = match[1].toLowerCase();
    var input = match[2] || "";
    var isWhisper = mode === "htxw" || mode === "xthw";
    var isTextToHex = mode === "xth" || mode === "xthw";
    var output = "";
    var error = "";

    // HTML SAFETY
    function escapeHtml(s) {
        return String(s).replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
    }

    // PUBLIC OR PRIVATE OUTPUT
    function sendResult(html) {
        if (isWhisper) {
            var player = getObj("player", msg.playerid);
            var name = player ? player.get("displayname") : msg.who;
            name = String(name).replace(/"/g, "");
            sendChat("HexDecoder", '/w "' + name + '" ' + html);
        } else {
            sendChat("HexDecoder", html);
        }
    }

    // CONVERSION ENGINE
    if (!input.trim()) {
        error = "NO DATA RECEIVED";

    } else if (isTextToHex) {

        // TEXT → HEX
        output = input.split("").map(function(c) {
            var n = c.charCodeAt(0);

            if (n > 127) return "?";

            return n.toString(16)
                .toUpperCase()
                .padStart(2, "0");
        }).join(" ");

    } else {

        // HEX → TEXT
        var hex = input.replace(/\s+/g, "");

        if (!/^[0-9a-fA-F]+$/.test(hex) ||
            hex.length % 2 !== 0) {

            error = "INVALID HEX — USE COMPLETE 2-DIGIT BYTES";

        } else {
            for (var i = 0; i < hex.length; i += 2) {
                var n = parseInt(hex.slice(i, i + 2), 16);

                if (n > 127) {
                    error = "ASCII TEST MODE — BYTE OUT OF RANGE";
                    break;
                }

                output += String.fromCharCode(n);
            }
        }
    }

    // RESULT CARD
    var color = error ? "#ff3155" : "#00f0ff";
    var result = error || output;
    var label = isTextToHex
        ? "TEXT → HEX"
        : "HEX → TEXT";

    var card =
        '<div style="background:#090d14;' +
        'border:1px solid #00d9ff;padding:12px;' +
        'color:#00f0ff;font-family:monospace;">' +
        '<div style="color:#ff3155;font-size:11px;">' +
        'NLS3 // HEX CONVERTER - v1.0</div>' +
        '<div style="border-bottom:1px solid #263849;' +
        'padding:6px 0;margin-bottom:8px;">' +
        'HEXADECIMAL TRANSLATION SYSTEM</div>' +
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
        'REMEMBER: TYPE !hexhelp FOR INSTRUCTIONS' +
        '</div></div>';

    sendResult(card);
});
