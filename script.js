import { createDetailsWidget } from "@livechat/agent-app-sdk";

createDetailsWidget().then((widget) => {
    widget.on("customer_profile", (profile) => {
        const text = `Customer Name: ${profile.name || "Unknown"}`;
        const fullProfile = JSON.stringify(profile, null, 2); // Pretty-print
        document.getElementById("infoText").textContent = text;
        document.getElementById("infoText2").textContent = fullProfile;
    });
});