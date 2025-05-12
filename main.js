import { createDetailsWidget } from "@livechat/agent-app-sdk";
import axios from 'axios';
import dayjs from 'dayjs';

let liveChatAccessToken = null;
let detailsWidget;

createDetailsWidget().then((widget) => {
    detailsWidget = widget;
    widget.on("customer_profile", async (profile) => {
        // const survey = profile.chat?.preChatSurvey || [];
        const customVariables = profile.customVariables;
        // console.log("survey: ", survey)
        console.log("customVariables: ", customVariables)
        // const nameField = survey.find(q => q.question === "Name:");
        // const username = nameField ? nameField.answer : "Unknown";
        // console.log("username: ", username)
        liveChatAccessToken = customVariables.liveChatAccessToken
        if (liveChatAccessToken != null) {
            await loadCustomerData()
        } else {
            alert('Cannot load customer token.');
        }
    });
})

// const example_data = {
//     "bizCode": 1,
//     "msg": null,
//     "data": {
//         "username": "5510987658001",
//         "firstName": "Joe",
//         "lastName": "Durrent",
//         "selfExclusionEnabled": true,
//         "selfExclusionMonth": 6,
//         "selfExclusionStartTime": 1739114325,
//         "selfExclusionEndTime": 1744129125,
//         "documentId": "AB-2233-232-323",
//         "userRegTime": "2025-04-23T23:11:27.000+0000",
//         "kycStatus": 1,
//         "totalDeposit": 2500,
//         "lastMonthDepositHistory": [
//             {
//                 "time": "2025-04-23T23:12:23.000+0000",
//                 "amount": 50
//             },
//             {
//                 "time": "2025-04-23T23:26:52.000+0000",
//                 "amount": 50
//             },
//             {
//                 "time": "2025-05-07T19:20:15.000+0000",
//                 "amount": 100
//             },
//             {
//                 "time": "2025-04-23T23:12:23.000+0000",
//                 "amount": 50
//             },
//             {
//                 "time": "2025-04-23T23:26:52.000+0000",
//                 "amount": 50
//             },
//             {
//                 "time": "2025-05-07T19:20:15.000+0000",
//                 "amount": 100
//             },
//             {
//                 "time": "2025-04-23T23:12:23.000+0000",
//                 "amount": 50
//             },
//             {
//                 "time": "2025-04-23T23:26:52.000+0000",
//                 "amount": 50
//             },
//             {
//                 "time": "2025-05-07T19:20:15.000+0000",
//                 "amount": 100
//             }
//         ],
//         "withdrawHistory": [
//             {
//                 "time": "2025-04-23T23:12:23.000+0000",
//                 "amount": 245
//             }
//         ]
//     }
// }
//
// window.addEventListener('DOMContentLoaded', loadCustomerData);

const LIVECHAT_URL = import.meta.env.PROD
    ? 'https://9f.playkaya.com/api/kaya/livechat' : '/api/kaya/livechat'
// const token = 'MTUzNzU3NDY6MTc0Njc3NTAyMzM2NTpmTUZSOEdJYWVMeU1scmptb3hvQ1JLM1pnbmhKTUxmbXlRSkkzaGlRQzkw'

async function loadCustomerData() {
    try {
        const res = await axios.get(`${LIVECHAT_URL}/userinfo`, {
            headers: {
                accessToken: liveChatAccessToken
            }
        });
        const { username, firstName, lastName, selfExclusionEnabled, selfExclusionMonth,
            selfExclusionStartTime, selfExclusionEndTime, documentId, userRegTime, kycStatus,
            totalDeposit, lastMonthDepositHistory, withdrawHistory } = res.data.data;

        console.log(res.data.data)

        // const { username, firstName, lastName, selfExclusionEnabled, selfExclusionMonth,
        //         selfExclusionStartTime, selfExclusionEndTime, documentId, userRegTime, kycStatus,
        //         totalDeposit, lastMonthDepositHistory, withdrawHistory } = example_data.data;

        document.getElementById('username').textContent = username;
        document.getElementById('firstName').textContent = firstName;
        document.getElementById('lastName').textContent = lastName;
        const accStatusEl = document.getElementById('accountStatus');
        const accStatus = parseAccountStatus(selfExclusionEnabled,
            selfExclusionMonth, selfExclusionStartTime, selfExclusionEndTime);
        accStatusEl.textContent = accStatus.text;
        accStatusEl.style.color = accStatus.isActive ? 'green' : 'red';
        document.getElementById('cpf').textContent = documentId;
        document.getElementById('registrationTime').textContent = dayjs(userRegTime).format('YYYY-MM-DD HH:mm:ss');
        const kycEl = document.getElementById('kycStatus');
        kycEl.textContent = kycStatus === 0 ? 'Not Verified' : 'Verified';
        kycEl.style.color = kycStatus === 0 ? 'red' : 'green';
        document.getElementById('totalDeposit').textContent = `$${totalDeposit}`;

        const depositTable = document.getElementById('depositHistoryTable');
        depositTable.innerHTML = '';
        if (lastMonthDepositHistory.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="2" style="text-align: center; color: gray;">No Deposit History Available</td>`;
            lastMonthDepositHistory.appendChild(row);
        } else {
            lastMonthDepositHistory.forEach(dep => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${dayjs(dep.time).format("YYYY-MM-DD HH:mm:ss")}</td><td style="color: red;">$${dep.amount}</td>`;
                depositTable.appendChild(row);
            });
        }

        const withdrawTable = document.getElementById('withdrawHistoryTable');
        withdrawTable.innerHTML = '';
        if (withdrawHistory.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="2" style="text-align: center; color: gray;">No Withdraw History Available</td>`;
            withdrawTable.appendChild(row);
        } else {
            withdrawHistory.forEach(dep => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${dayjs(dep.time).format("YYYY-MM-DD HH:mm:ss")}</td><td style="color: green;">$${dep.amount}</td>`;
                withdrawTable.appendChild(row);
            });
        }
    } catch (err) {
        console.error('Failed to load customer data:', err);
    }
}

document.getElementById('getUserInfoButton').addEventListener('click', async () => {
    const userInfoBtn = document.getElementById('getUserInfoButton')
    userInfoBtn.disabled = true;
    if (liveChatAccessToken === null && detailsWidget !== null) {
        liveChatAccessToken = detailsWidget.getCustomerProfile().customVariables.liveChatAccessToken
    }
    try {
        await loadCustomerData();
    } catch (err) {
        console.error('Failed to get User Info:', err);
        alert('Failed to get User Info.');
    } finally {
        userInfoBtn.disabled = false;
    }
});

function parseAccountStatus(selfExclusionEnabled, selfExclusionMonth, selfExclusionStartTime, selfExclusionEndTime) {
    if (selfExclusionEnabled) {
        return {
            text: `Self Excluded for ${selfExclusionMonth} month(s) (${dayjs(selfExclusionStartTime).format('YYYY-MM-DD HH:mm:ss')} to ${dayjs(selfExclusionEndTime).format('YYYY-MM-DD HH:mm:ss')})`,
            isActive: false
        };
    }
    return {
        text: "Active",
        isActive: true
    };
}

document.getElementById('exclusionSubmitButton').addEventListener('click', async () => {
    const exclusionMonthSelected = document.getElementById('exclusionPeriod').value;
    const exclusionBtn = document.getElementById('exclusionSubmitButton')
    exclusionBtn.disabled = true;
    try {
        await axios.get(`${LIVECHAT_URL}/selfExclusion?exclusionMonth=${exclusionMonthSelected}`, {
            headers: {
                accessToken: liveChatAccessToken
            }
        });
        alert('Exclusion Submitted.');
        await loadCustomerData();
    } catch (err) {
        console.error('Failed to submit exclusion:', err);
        alert('Failed to submit.');
    } finally {
        exclusionBtn.disabled = false;
    }
});

document.getElementById('revokeExclusionButton').addEventListener('click', async () => {
    const revokeBtn = document.getElementById('revokeExclusionButton')
    revokeBtn.disabled = true;
    try {
        await axios.get(`${LIVECHAT_URL}/revokeSelfExclusion`, {
            headers: {
                accessToken: liveChatAccessToken
            }
        });
        alert('Revoke Exclusion Submitted.');
        await loadCustomerData();
    } catch (err) {
        console.error('Failed to submit revoke exclusion:', err);
        alert('Failed to submit.');
    } finally {
        revokeBtn.disabled = false;
    }
});
