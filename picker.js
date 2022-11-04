window.addEventListener("DOMContentLoaded", async () => {
    const lobbyChatbox = document.querySelector("#chat_input");
    const dmChatbox = document.querySelector("#social_dm_input");
    const ingameChatbox = document.querySelector("#ingame_chat_input");
    const leagueChatbox = document.querySelector("#league_chat_input");

    const chatboxes = [lobbyChatbox, dmChatbox, ingameChatbox, leagueChatbox];

    const emotes = await ((await fetch("https://emotes.kagar.in/emotes.json")).json());

    const picker = document.createElement("div");
    picker.classList.add("zudo-emote-picker");

    let pickerSupressed = false;
    let lastBox;
    let emoteStartIndex = 0;
    let emoteEndIndex = 0;

    for (const [role, subemotes] of Object.entries(emotes)) {
        // hide the verified emote - i'd love to have it, but there's no verified class on the body to show/hide it
        if (role === "verified") continue;
        for (const [emote, url] of Object.entries(subemotes)) {
            const emoteEl = document.createElement("div");
            emoteEl.dataset.zudoEmote = emote;

            const emoteImgDiv = document.createElement("div");

            const emoteImg = document.createElement("img");
            emoteImg.src = "/res/" + url;
            emoteImg.alt = emote;

            emoteImgDiv.appendChild(emoteImg);

            const emoteDiv = document.createElement("div");
            emoteDiv.innerText = emote;

            emoteEl.classList.add("zudo-emote-picker-emote", "zudo-emote-picker-emote-" + role);

            emoteEl.addEventListener("mousedown", e => {
                e.preventDefault();
                if (!lastBox) return;

                const newContent = lastBox.value.substring(0, emoteStartIndex) + ":" + emote + ":" + lastBox.value.substring(emoteEndIndex);
                const newCursorPos = emoteEndIndex + 2 + emote.length;
                lastBox.value = newContent;
                lastBox.focus();
                lastBox.setSelectionRange(newCursorPos, newCursorPos);

                updateBox(lastBox);
            });

            emoteEl.appendChild(emoteImgDiv)
            emoteEl.appendChild(emoteDiv);
            picker.appendChild(emoteEl);
        }
    }

    function updateBox(box) {
        if (pickerSupressed) {
            picker.style.display = "none";
            return;
        }

        let picking = false;
        let emoteStart = 0;
        let search = "";

        for (let i = 0; i < box.value.length; i++) {
            const char = box.value[i];

            if (!picking && char === ":") {
                picking = true;
                emoteStart = i;
            } else if (picking && !char.match(/[a-zA-Z0-9_]/)) {
                picking = false;
                search = "";
            } else if (picking) {
                search += char;
            }
        }

        if (picking) {
            emoteStartIndex = emoteStart;
            emoteEndIndex = emoteStart + search.length + 1;
            search = search.toLowerCase().trim();
            picker.style.display = "block";
            picker.style.top = (box.getBoundingClientRect().y - picker.getBoundingClientRect().height - 10) + "px";
            picker.style.left = box.getBoundingClientRect().x + "px";
            picker.style.width = box.getBoundingClientRect().width + "px";

            if (search.length > 0) {
                document.querySelectorAll(`[data-zudo-emote]`).forEach(el => el.classList.add("zudo-emote-picker-emote-hidden"));
                document.querySelectorAll(`[data-zudo-emote*='${search}']`).forEach(el => el.classList.remove("zudo-emote-picker-emote-hidden"));
            } else {
                document.querySelectorAll(`[data-zudo-emote]`).forEach(el => el.classList.remove("zudo-emote-picker-emote-hidden"));
            }
        } else {
            picker.style.display = "none";
        }
    }

    chatboxes.forEach(box => {
        box.addEventListener("click", () => {
            lastBox = box;
            updateBox(box);
        });

        box.addEventListener("focus", () => {
            lastBox = box;
            updateBox(box);
        });

        box.addEventListener("blur", e => {
            picker.style.display = "none";
        });

        box.addEventListener("keyup", () => {
            lastBox = box;
            updateBox(box);
        });
    });

    document.querySelector("#social").addEventListener("transitionstart", () => {
        pickerSupressed = true;
        picker.style.display = "none";
    });

    document.querySelector("#social").addEventListener("transitionend", () => {
        pickerSupressed = false;
        picker.style.display = "none";
    });

    document.body.appendChild(picker);
});
