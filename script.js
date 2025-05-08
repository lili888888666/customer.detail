import { createDetailsWidget } from "@livechat/agent-app-sdk";
import axios from 'axios';

createDetailsWidget().then((widget) => {
    widget.on("customer_profile", async (profile) => {
        const survey = profile.chat?.preChatSurvey || [];
        console.log("Survey: ", survey)
        // Find the question with the label "Password:" (or other fields)
        const usernameField = survey.find(q => q.question === "Name:");
        const username = usernameField ? usernameField.answer : "Unknown";
        const passwordField = survey.find(q => q.question === "Password:");
        const password = passwordField ? passwordField.answer : "Unknown";
        console.log("Password: ", password)
        let data = {
            Username: username,
            Password: password
        };

        let result = {};

        try {
            // Fetch user data based on password (as Kid in header)
            const response = await axios.get("https://9f.playkaya.com/api/kaya/user/info", {
                headers: {
                    "Kid": password // Assuming 'password' is used as 'Kid'
                }
            });

            result = response.data;

            // Optionally log the result for debugging purposes
            console.log("API Response:", result);

        } catch (error) {
            console.error("Axios error:", error);
            result = {
                data: {
                    Error: "Failed to fetch user info"
                }
            };
        }

        // Ensure the container exists before updating
        const container = document.getElementById("infoContainer");
        if (!container) {
            console.error("Container element not found!");
            return;
        }

        // Clear previous content and update with new data
        container.innerHTML = "";

        // Iterate through the result and display key-value pairs
        Object.entries(result.data).forEach(([key, value]) => {
            const entry = document.createElement("div");
            entry.className = "info-entry";

            // Create a readable format with key and value
            entry.innerHTML = `
        <span class="info-key" style="font-weight: bold; font-size: 1.2em;">${key}:</span>
        <span class="info-value" style="font-style: italic;">${value}</span>
      `;

            container.appendChild(entry);
        });
    });
});
