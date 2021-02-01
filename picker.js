window.addEventListener("DOMContentLoaded", () => {
    const lobbyChatbox = document.querySelector("#chat_input");
    const dmChatbox = document.querySelector("#social_dm_input");
    const ingameChatbox = document.querySelector("#ingame_chat_input");
    const leagueChatbox = document.querySelector("#league_chat_input");

    let chatbox;

    const shownEmotes = [];

    let currentSearch;

    const emotePicker = document.createElement("div");
    emotePicker.classList.add("zudo-emote-picker");
    document.body.appendChild(emotePicker);

    console.log(window.localStorage);

    fetch("https://emotes.kagar.in/emotes.json").then(res => res.json()).then(emotes => {
        fetch("/api/users/me", {
            headers: {
                "Authorization": "Bearer " + window.localStorage.getItem("userToken")
            }
        }).then(res => res.json()).then(user => {
            const roles = ["base"];

            if (!user.success) {
                console.log("Couldn't pull your profile information... You're probably anon, assuming that.");
            } else {
                if (user.user.supporter) {
                    roles.push("supporter");
                }

                if (user.user.verified) {
                    roles.push("verified");
                }

                if (user.user.role === "moderator" || user.user.role === "administrator") {
                    roles.push("staff");
                }
            }

            roles.forEach(role => {
                for (const emote in emotes[role]) {
                    if (emotes[role].hasOwnProperty(emote)) {
                        shownEmotes.push([emote, emotes[role][emote]]);

                        const el = document.createElement("div");
                        el.classList.add("zudo-emote-picker-emote", "zudo-emote-picker-emote-" + role);
                        el.dataset["zudoEmote"] = emote;

                        const imgContEl = document.createElement("div");
                        const imgEl = document.createElement("img");

                        imgEl.src = "/res/" + emotes[role][emote];

                        imgContEl.appendChild(imgEl);

                        const nameEl = document.createElement("div");
                        nameEl.classList.add("zudo-emote-picker-emote-name")
                        nameEl.innerText = emote;

                        el.appendChild(imgContEl);
                        el.appendChild(nameEl);

                        el.addEventListener("click", () => {
                            chatbox.value = chatbox.value.substring(0, chatbox.value.length - currentSearch.length - 1);
                            chatbox.value += ":" + emote + ": ";
                            chatboxCheck();
                            chatbox.focus();
                        });
                        emotePicker.appendChild(el);
                    }
                }
            });
        });
    });


    function chatboxCheck() {
        const match = chatbox.value.match(/:([^:]*)$/);
        const colonCount = Array.from(chatbox.value).filter(l => l === ":").length;
        if (match && colonCount % 2 !== 0) {
            emotePicker.style.display = "block";
            emotePicker.style.top = (chatbox.getBoundingClientRect().y - emotePicker.getBoundingClientRect().height - 10) + "px";
            emotePicker.style.left = chatbox.getBoundingClientRect().x + "px";
            emotePicker.style.width = chatbox.getBoundingClientRect().width + "px";
            currentSearch = match[1];
            const emoteResults = shownEmotes.filter(emote => emote[0].toLowerCase().indexOf(currentSearch) !== -1);
            document.querySelectorAll("[data-zudo-emote]").forEach(el => el.style.display = "none");
            emoteResults.forEach(emote => {
                document.querySelector(`[data-zudo-emote=${emote[0]}]`).style.display = "flex";
            });
        } else {
            emotePicker.style.display = "none";
        }
    }


    lobbyChatbox.addEventListener("keyup", () => {
        chatbox = lobbyChatbox;
        chatboxCheck();
    });

    dmChatbox.addEventListener("keyup", () => {
        chatbox = dmChatbox;
        chatboxCheck();
    });

    ingameChatbox.addEventListener("keyup", () => {
        chatbox = ingameChatbox;
        chatboxCheck();
    });

    leagueChatbox.addEventListener("keyup", () => {
        chatbox = leagueChatbox;
        chatboxCheck();
    });
});
