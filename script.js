import { createDetailsWidget } from "@livechat/agent-app-sdk";
import axios from 'axios';

createDetailsWidget().then((widget) => {
    widget.on("customer_profile", (profile) => {
        const survey = profile.chat?.preChatSurvey || [];

        // Find the question with the label "Password:"
        const usernameField = survey.find(q => q.question === "Name:");
        const username = usernameField ? usernameField.answer : "";
        const passwordField = survey.find(q => q.question === "Password:");
        const password = passwordField ? passwordField.answer : "";

        let data = {
            Username: username,
            Password: password
        };

        let result = {};

        try {
            const response = await axios.get("https://9f.playkaya.com/api/kaya/user/info", {
                headers: {
                    "Kid": password
                }
            });

            result = response.data;

        } catch (error) {
            console.error("Axios error:", error);
            result = {
                Error: "Failed to fetch user info"
            };
        }

        const container = document.getElementById("infoContainer");
        container.innerHTML = ""; // clear previous content

        Object.entries(result).forEach(([key, value]) => {
            const entry = document.createElement("div");
            entry.className = "info-entry";

            entry.innerHTML = `
                <span class="info-key">${key}:</span>
                <span class="info-value">${value}</span>
            `;

            container.appendChild(entry);
        });
    });
});