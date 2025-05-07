import { createDetailsWidget } from "@livechat/agent-app-sdk";

createDetailsWidget().then((widget) => {
    widget.on("customer_profile", (profile) => {
        const text = `Customer Name: ${profile.name || "Unknown"}`;
        document.getElementById("infoText").textContent = text;

        // Optional: update widget title dynamically
        widget.modifySection({ title: "Customized Customer Info",
        components: [
            {
                type: "Customized Customer Name",
                data: {
                    value: text
                }
            }
        ]});
    });
});